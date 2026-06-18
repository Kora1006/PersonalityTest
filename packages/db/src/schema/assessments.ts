import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	int,
	mysqlTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/mysql-core";

import { user } from "./auth";

export const assessments = mysqlTable("assessments", {
	id: varchar("id", { length: 36 }).primaryKey(),
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	date: date("date").notNull(),
	dominantType: varchar("dominant_type", { length: 10 }).notNull(),
	scoreD: int("score_d").notNull(),
	scoreI: int("score_i").notNull(),
	scoreS: int("score_s").notNull(),
	scoreC: int("score_c").notNull(),
	note: text("note").default(""),
	isPaid: boolean("is_paid").default(false),
	mode: varchar("mode", { length: 10 }).default("full"),
	isUnlocked: boolean("is_unlocked").default(false),
	theme: varchar("theme", { length: 20 }).default("professional"),
	createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
});

export const assessmentsRelations = relations(assessments, ({ one }) => ({
	user: one(user, {
		fields: [assessments.userId],
		references: [user.id],
	}),
}));
