import { getMpAccessToken } from "@PersonalityTest/api/utils/wechat";
import { auth } from "@PersonalityTest/auth";
import { createDb } from "@PersonalityTest/db";
import { user as userTable } from "@PersonalityTest/db/schema/auth";
import { env } from "@PersonalityTest/env/server";
import { createHash, randomUUID } from "crypto";
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
	return randomUUID();
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
		const userId = randomUUID();
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

// jsapi_ticket cache (valid ~2h, refresh at 1.5h)
let cachedJsapiTicket: { ticket: string; expiresAt: number } | null = null;

async function getJsapiTicket(): Promise<string | null> {
	if (cachedJsapiTicket && Date.now() < cachedJsapiTicket.expiresAt) {
		return cachedJsapiTicket.ticket;
	}
	const accessToken = await getMpAccessToken();
	if (!accessToken) {
		return null;
	}
	const res = await fetch(
		`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
	);
	const data = (await res.json()) as {
		ticket?: string;
		expires_in?: number;
		errcode?: number;
	};
	if (!data.ticket) {
		return null;
	}
	cachedJsapiTicket = {
		ticket: data.ticket,
		expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000 - 5 * 60 * 1000,
	};
	return data.ticket;
}

// GET /api/auth/wechat/mini-qrcode?scene=xxx&page=xxx
wechatRouter.get("/mini-qrcode", async (c) => {
	const { scene, page } = c.req.query();
	if (!scene) {
		return c.json({ error: "Missing scene" }, 400);
	}

	const accessToken = await getMpAccessToken();
	if (!accessToken) {
		console.warn(
			"WeChat AppID/Secret not configured. Using mock QR code for scene:",
			scene
		);
		// Mock QR code base64 fallback
		const mockBase64 =
			"iVBORw0KGgoAAAANSUhEUgAAARgAAAEYAQMAAAC9QHvPAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAABf0lEQVRoge3ZO7LCMAwFUGUoKFlClsLSwtKyFJaQkiITYX38CW94Q2MlxVUDE59UGsuyQvRDTOyxEl1ZnyxE97UubDBRZrGcjPqURubHTd8oCzBxZpCkiEn50rTdNs1XXoA5wExOvXjBHGhS8PPC7HUMJt7UOvZKxk/zr7UOpqNhDzeXdKZs33sAmI7mM2zv/B8wfYynRZosCc0X8+xpa3YTzDmMHC+2sYR63K0tI4KJNDlf9Z5CA89pVa4r6eVaD2E6G82OJUq531Pkry2OMFFmyn9tlpLvKXL8pLRd2XIKE2IW3Slex+xnE/NxpsBEGEvQqCRvodneyLUOJtT44rP0xkppd6+E6W/SFmlmKTrvtZibaTzMKUwT6Y5vMWgrQNo0w8SZKefG5i0svXGZQ5Y+ASbE1Dnk/ltJmy+YIFO/lUi+fNFC6th+hg8TZvSCYr0xL05hjjE2xSoT+fvf74wwPU2pY9Or/Ybocy2YQJNr1prvKQ8b9JYFmDOZH+INJmsvEIxtHf4AAAAASUVORK5CYII=";
		return c.json({ base64: mockBase64, mimeType: "image/png" });
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
	try {
		const body = (await c.req.json()) as { code?: string };
		if (!body.code) {
			return c.json({ error: "Missing code" }, 400);
		}

		let openid = "";
		let unionid: string | null = null;

		if (env.WECHAT_APP_ID && env.WECHAT_APP_SECRET) {
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
				return c.json(
					{ error: sessionData.errmsg ?? "WeChat auth failed" },
					401
				);
			}
			openid = sessionData.openid;
			unionid = sessionData.unionid ?? null;
		} else {
			// Mock login fallback in development when WeChat is not configured
			console.warn(
				"WeChat AppID/Secret not configured. Using mock login for code:",
				body.code
			);
			openid = `mock_openid_${body.code.slice(0, 16)}`;
		}

		const db = createDb();
		let dbUser = await db
			.select()
			.from(userTable)
			.where(eq(userTable.wechatOpenId, openid))
			.then((rows) => rows[0] ?? null);

		if (!dbUser) {
			const userId = randomUUID();
			const now = new Date();
			await db.insert(userTable).values({
				id: userId,
				name: "微信测试用户",
				email: `wx_mp_${openid}@wechat.placeholder`,
				emailVerified: false,
				image: null,
				createdAt: now,
				updatedAt: now,
				wechatOpenId: openid,
				wechatUnionId: unionid,
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
	} catch (err) {
		console.error("CRITICAL ERROR in miniprogram-login handler:", err);
		return c.json(
			{
				error: err instanceof Error ? err.message : String(err),
				stack: err instanceof Error ? err.stack : undefined,
			},
			500
		);
	}
});

// GET /api/auth/wechat/jssdk-signature?url=<encoded_page_url>
// Returns JSSDK config params for wx.config() on the given page URL.
wechatRouter.get("/jssdk-signature", async (c) => {
	const url = c.req.query("url");
	if (!url) {
		return c.json({ error: "Missing url parameter" }, 400);
	}

	if (!env.WECHAT_APP_ID) {
		return c.json({
			appId: "mock",
			timestamp: 0,
			nonceStr: "mock",
			signature: "mock",
		});
	}

	const jsapiTicket = await getJsapiTicket();
	if (!jsapiTicket) {
		return c.json({ error: "Failed to get jsapi ticket" }, 503);
	}

	const timestamp = Math.floor(Date.now() / 1000);
	const nonceStr = randomUUID().replace(/-/g, "").slice(0, 16);
	const signStr = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
	const signature = createHash("sha1").update(signStr).digest("hex");

	return c.json({
		appId: env.WECHAT_APP_ID,
		timestamp,
		nonceStr,
		signature,
	});
});
