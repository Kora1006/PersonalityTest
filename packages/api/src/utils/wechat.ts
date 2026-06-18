import { env } from "@PersonalityTest/env/server";

let cachedMpToken: { token: string; expiresAt: number } | null = null;

export async function getMpAccessToken(): Promise<string | null> {
	if (cachedMpToken && Date.now() < cachedMpToken.expiresAt) {
		return cachedMpToken.token;
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
	cachedMpToken = {
		token: data.access_token,
		expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000 - 5 * 60 * 1000,
	};
	return data.access_token;
}
