import { auth } from "@PersonalityTest/auth";
import { createDb } from "@PersonalityTest/db";
import { user as userTable } from "@PersonalityTest/db/schema/auth";
import { env } from "@PersonalityTest/env/server";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";

interface WechatState {
	createdAt: number;
	sessionToken?: string;
	status: "pending" | "success" | "expired";
}

const STATE_TTL_MS = 5 * 60 * 1000;

const wechatStates = new Map<string, WechatState>();

function pruneExpiredStates() {
	const now = Date.now();
	for (const [key, val] of wechatStates) {
		if (now - val.createdAt > STATE_TTL_MS) {
			wechatStates.set(key, { ...val, status: "expired" });
		}
	}
}

function generateState(): string {
	return crypto.randomUUID();
}

export const wechatRouter = new Hono();

wechatRouter.get("/qr", (c) => {
	if (!env.WECHAT_APP_ID) {
		return c.json({ error: "WeChat not configured" }, 503);
	}

	pruneExpiredStates();
	const state = generateState();
	wechatStates.set(state, { createdAt: Date.now(), status: "pending" });

	const redirectUri = encodeURIComponent(
		`${env.BETTER_AUTH_URL}/api/auth/wechat/callback`
	);
	const qrUrl = `https://open.weixin.qq.com/connect/qrconnect?appid=${env.WECHAT_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;

	return c.json({ qrUrl, state });
});

wechatRouter.get("/callback", async (c) => {
	const { code, state } = c.req.query();

	if (!(code && state)) {
		return c.redirect("/?error=wechat_missing_params");
	}

	const stateRecord = wechatStates.get(state);
	if (!stateRecord || stateRecord.status === "expired") {
		return c.redirect("/?error=wechat_state_invalid");
	}

	if (!(env.WECHAT_APP_ID && env.WECHAT_APP_SECRET)) {
		return c.redirect("/?error=wechat_not_configured");
	}

	const tokenRes = await fetch(
		`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`
	);
	const tokenData = (await tokenRes.json()) as {
		access_token?: string;
		openid?: string;
		unionid?: string;
		errcode?: number;
	};

	if (!(tokenData.access_token && tokenData.openid)) {
		wechatStates.set(state, { ...stateRecord, status: "expired" });
		return c.redirect("/?error=wechat_token_failed");
	}

	const userInfoRes = await fetch(
		`https://api.weixin.qq.com/sns/userinfo?access_token=${tokenData.access_token}&openid=${tokenData.openid}&lang=zh_CN`
	);
	const wechatUser = (await userInfoRes.json()) as {
		nickname?: string;
		headimgurl?: string;
		openid: string;
		unionid?: string;
	};

	const db = createDb();
	let dbUser = await db
		.select()
		.from(userTable)
		.where(eq(userTable.wechatOpenId, wechatUser.openid))
		.then((rows) => rows[0] ?? null);

	if (!dbUser) {
		const userId = crypto.randomUUID();
		const now = new Date();
		await db.insert(userTable).values({
			id: userId,
			name: wechatUser.nickname ?? "微信用户",
			email: `wx_${wechatUser.openid}@wechat.placeholder`,
			emailVerified: false,
			image: wechatUser.headimgurl ?? null,
			createdAt: now,
			updatedAt: now,
			wechatOpenId: wechatUser.openid,
			wechatUnionId: wechatUser.unionid ?? null,
		});
		const inserted = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, userId))
			.then((rows) => rows[0] ?? null);
		if (!inserted) {
			return c.redirect("/?error=wechat_user_create_failed");
		}
		dbUser = inserted;
	}

	const ctx = await auth.$context;
	const session = await ctx.internalAdapter.createSession(dbUser.id);

	const cookieName = ctx.authCookies.sessionToken.name;
	const isSecure = env.BETTER_AUTH_URL.startsWith("https://");
	setCookie(c, cookieName, session.token, {
		httpOnly: true,
		sameSite: "Lax",
		secure: isSecure,
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});

	wechatStates.set(state, {
		...stateRecord,
		status: "success",
		sessionToken: session.token,
	});

	return c.redirect("/");
});

wechatRouter.get("/poll/:state", (c) => {
	const { state } = c.req.param();
	pruneExpiredStates();

	const record = wechatStates.get(state);
	if (!record) {
		return c.json({ status: "expired" });
	}

	return c.json({ status: record.status });
});

// Access token cache (valid ~2h, refresh at 1.5h)
let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getMpAccessToken(): Promise<string | null> {
	if (cachedAccessToken && Date.now() < cachedAccessToken.expiresAt) {
		return cachedAccessToken.token;
	}
	if (!(env.WECHAT_APP_ID && env.WECHAT_APP_SECRET)) {
		return null;
	}
	const res = await fetch(
		`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}`
	);
	const data = (await res.json()) as {
		access_token?: string;
		expires_in?: number;
	};
	if (!data.access_token) {
		return null;
	}
	cachedAccessToken = {
		token: data.access_token,
		expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000 - 5 * 60 * 1000,
	};
	return data.access_token;
}

// GET /api/auth/wechat/mini-qrcode?scene=xxx&page=xxx
wechatRouter.get("/mini-qrcode", async (c) => {
	const { scene, page } = c.req.query();
	if (!scene) {
		return c.json({ error: "Missing scene" }, 400);
	}

	const accessToken = await getMpAccessToken();
	if (!accessToken) {
		return c.json({ error: "WeChat not configured" }, 503);
	}

	const res = await fetch(
		`https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				scene,
				page: page ?? "pages/index/index",
				width: 280,
				is_hyaline: true,
			}),
		}
	);

	const contentType = res.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) {
		const errData = (await res.json()) as { errcode?: number; errmsg?: string };
		return c.json({ error: errData.errmsg ?? "qrcode failed" }, 500);
	}

	const buffer = await res.arrayBuffer();
	const base64 = Buffer.from(buffer).toString("base64");
	return c.json({ base64, mimeType: "image/png" });
});

// Miniprogram login: exchange wx.login() code for session
wechatRouter.post("/miniprogram-login", async (c) => {
	if (!(env.WECHAT_APP_ID && env.WECHAT_APP_SECRET)) {
		return c.json({ error: "WeChat not configured" }, 503);
	}

	const body = (await c.req.json()) as { code?: string };
	if (!body.code) {
		return c.json({ error: "Missing code" }, 400);
	}

	// Exchange code for openid via jscode2session
	const sessionRes = await fetch(
		`https://api.weixin.qq.com/sns/jscode2session?appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}&js_code=${body.code}&grant_type=authorization_code`
	);
	const sessionData = (await sessionRes.json()) as {
		openid?: string;
		unionid?: string;
		session_key?: string;
		errcode?: number;
		errmsg?: string;
	};

	if (!sessionData.openid) {
		return c.json({ error: sessionData.errmsg ?? "WeChat auth failed" }, 401);
	}

	const db = createDb();
	let dbUser = await db
		.select()
		.from(userTable)
		.where(eq(userTable.wechatOpenId, sessionData.openid))
		.then((rows) => rows[0] ?? null);

	if (!dbUser) {
		const userId = crypto.randomUUID();
		const now = new Date();
		await db.insert(userTable).values({
			id: userId,
			name: "微信用户",
			email: `wx_mp_${sessionData.openid}@wechat.placeholder`,
			emailVerified: false,
			image: null,
			createdAt: now,
			updatedAt: now,
			wechatOpenId: sessionData.openid,
			wechatUnionId: sessionData.unionid ?? null,
		});
		const inserted = await db
			.select()
			.from(userTable)
			.where(eq(userTable.id, userId))
			.then((rows) => rows[0] ?? null);
		if (!inserted) {
			return c.json({ error: "User creation failed" }, 500);
		}
		dbUser = inserted;
	}

	// Create Better Auth session
	const ctx = await auth.$context;
	const session = await ctx.internalAdapter.createSession(dbUser.id);

	return c.json({
		token: session.token,
		user: {
			id: dbUser.id,
			name: dbUser.name,
			email: dbUser.email,
		},
	});
});
