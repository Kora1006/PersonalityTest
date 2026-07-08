import { createDb } from "@PersonalityTest/db";
import {
	account,
	session,
	user,
	verification,
} from "@PersonalityTest/db/schema/auth";
import { env } from "@PersonalityTest/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins/bearer";
import { Resend } from "resend";

export function createAuth() {
	const db = createDb();
	const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "mysql",
			schema: { account, session, user, verification },
		}),
		trustedOrigins: [env.CORS_ORIGIN, "https://servicewechat.com"],
		emailAndPassword: {
			enabled: true,
			minPasswordLength: 6,
			sendResetPassword: resend
				? async ({ user: recipient, url }) => {
						await resend.emails.send({
							from: "noreply@personalitytest.app",
							to: recipient.email,
							subject: "重置您的密码",
							html: `<p>点击以下链接重置密码：</p><p><a href="${url}">${url}</a></p><p>链接有效期 1 小时。</p>`,
						});
					}
				: undefined,
		},
		session: {
			expiresIn: 60 * 60 * 24 * 7,
			updateAge: 60 * 60 * 24,
		},
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: env.COOKIE_SECURE === "false" ? "lax" : "none",
				secure: env.COOKIE_SECURE !== "false",
				httpOnly: true,
			},
		},
		plugins: [bearer()],
	});
}

export const auth = createAuth();
