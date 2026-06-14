import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		CORS_ORIGIN: z.url(),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		WECHAT_APP_ID: z.string().optional(),
		WECHAT_APP_SECRET: z.string().optional(),
		RESEND_API_KEY: z.string().optional(),
		WECHAT_PAY_APP_ID: z.string().optional(),
		WECHAT_PAY_MCH_ID: z.string().optional(),
		WECHAT_PAY_MCH_KEY: z.string().optional(),
		WECHAT_PAY_NOTIFY_URL: z.string().optional(),
		ALIPAY_APP_ID: z.string().optional(),
		ALIPAY_PRIVATE_KEY: z.string().optional(),
		ALIPAY_PUBLIC_KEY: z.string().optional(),
		ALIPAY_NOTIFY_URL: z.string().optional(),
	},
	runtimeEnv: process.env,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	emptyStringAsUndefined: true,
});
