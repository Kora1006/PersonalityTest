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
