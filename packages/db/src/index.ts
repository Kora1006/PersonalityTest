import { env } from "@PersonalityTest/env/server";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schema";

export function createDb() {
	return drizzle({
		connection: {
			uri: env.DATABASE_URL,
		},
		mode: "default",
		schema,
	});
}

export const db = createDb();
