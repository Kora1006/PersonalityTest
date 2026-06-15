import { relations } from "drizzle-orm";
import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";
import { assessments } from "./assessments";
import { user } from "./auth";

export const invitations = mysqlTable("invitations", {
	id: varchar("id", { length: 36 }).primaryKey(),
	inviterId: varchar("inviter_id", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	inviterResultId: varchar("inviter_result_id", { length: 36 })
		.notNull()
		.references(() => assessments.id, { onDelete: "cascade" }),
	inviteeId: varchar("invitee_id", { length: 36 }).references(() => user.id),
	inviteeResultId: varchar("invitee_result_id", { length: 36 }).references(
		() => assessments.id
	),
	status: varchar("status", { length: 20 }).default("pending"),
	createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
	completedAt: timestamp("completed_at", { fsp: 3 }),
});

export const invitationsRelations = relations(invitations, ({ one }) => ({
	inviter: one(user, {
		fields: [invitations.inviterId],
		references: [user.id],
		relationName: "inviter",
	}),
	invitee: one(user, {
		fields: [invitations.inviteeId],
		references: [user.id],
		relationName: "invitee",
	}),
	inviterResult: one(assessments, {
		fields: [invitations.inviterResultId],
		references: [assessments.id],
		relationName: "inviterResult",
	}),
	inviteeResult: one(assessments, {
		fields: [invitations.inviteeResultId],
		references: [assessments.id],
		relationName: "inviteeResult",
	}),
}));
