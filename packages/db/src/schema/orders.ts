import { relations } from "drizzle-orm";
import {
	boolean,
	int,
	mysqlTable,
	timestamp,
	varchar,
} from "drizzle-orm/mysql-core";

import { assessments } from "./assessments";
import { user } from "./auth";

export const orders = mysqlTable("orders", {
	id: varchar("id", { length: 36 }).primaryKey(),
	userId: varchar("user_id", { length: 36 })
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	assessmentId: varchar("assessment_id", { length: 36 })
		.notNull()
		.references(() => assessments.id, { onDelete: "cascade" }),
	amount: int("amount").notNull(),
	currency: varchar("currency", { length: 3 }).default("CNY"),
	paymentMethod: varchar("payment_method", { length: 20 }),
	status: varchar("status", { length: 20 }).default("pending"),
	isPaid: boolean("is_paid").default(false),
	wechatPrepayId: varchar("wechat_prepay_id", { length: 64 }),
	alipayTradeNo: varchar("alipay_trade_no", { length: 64 }),
	paidAt: timestamp("paid_at", { fsp: 3 }),
	createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { fsp: 3 }),
});

export const ordersRelations = relations(orders, ({ one }) => ({
	assessment: one(assessments, {
		fields: [orders.assessmentId],
		references: [assessments.id],
	}),
	user: one(user, {
		fields: [orders.userId],
		references: [user.id],
	}),
}));
