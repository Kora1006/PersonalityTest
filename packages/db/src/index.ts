import { env } from "@PersonalityTest/env/server";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import * as schema from "./schema";

export function createDb() {
	const connectionOpts: mysql.PoolOptions = {
		uri: env.DATABASE_URL,
	};

	const pool = mysql.createPool(connectionOpts);

	// Override execute with query to prevent ER_MALFORMED_PACKET errors
	// caused by cloud database proxies not fully supporting MySQL prepared statements.
	pool.execute = pool.query as typeof pool.execute;

	return drizzle({
		client: pool,
		mode: "default",
		schema,
	});
}

export const db = createDb();
