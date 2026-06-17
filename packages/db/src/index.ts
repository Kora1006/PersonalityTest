import { env } from "@PersonalityTest/env/server";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schema";

export function createDb() {
	const connectionOpts = {
		uri: env.DATABASE_URL,
		ssl:
			process.env.NODE_ENV === "production" ||
			env.DATABASE_URL.includes("internal-net") ||
			env.DATABASE_URL.includes("tcloudbase.com") ||
			env.DATABASE_URL.includes("10.18.110")
				? { rejectUnauthorized: false }
				: undefined,
	};

	return drizzle({
		connection: connectionOpts,
		mode: "default",
		schema,
	});
}

export const db = createDb();
