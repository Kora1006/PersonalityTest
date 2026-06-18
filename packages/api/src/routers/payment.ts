import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { orders } from "@PersonalityTest/db/schema/orders";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const REPORT_PRICE_CNY_FEN = 1900;

export const paymentRouter = router({
	createOrder: protectedProcedure
		.input(
			z.object({
				assessmentId: z.string().uuid(),
				paymentMethod: z.enum(["wechat", "alipay"]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const db = createDb();
			const userId = ctx.session.user.id;

			const assessment = await db
				.select({ id: assessments.id, isPaid: assessments.isPaid })
				.from(assessments)
				.where(
					and(
						eq(assessments.id, input.assessmentId),
						eq(assessments.userId, userId)
					)
				)
				.then((rows) => rows[0] ?? null);

			if (!assessment) {
				throw new Error("Assessment not found");
			}

			if (assessment.isPaid) {
				return { alreadyPaid: true, orderId: null, qrCode: null };
			}

			const orderId = crypto.randomUUID();
			const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

			await db.insert(orders).values({
				id: orderId,
				userId,
				assessmentId: input.assessmentId,
				amount: REPORT_PRICE_CNY_FEN,
				currency: "CNY",
				paymentMethod: input.paymentMethod,
				status: "pending",
				isPaid: false,
				expiresAt,
				createdAt: new Date(),
			});

			return {
				alreadyPaid: false,
				orderId,
				qrCode: null as string | null,
				amount: REPORT_PRICE_CNY_FEN,
			};
		}),

	getOrderStatus: protectedProcedure
		.input(z.object({ orderId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const db = createDb();

			const order = await db
				.select({
					expiresAt: orders.expiresAt,
					id: orders.id,
					isPaid: orders.isPaid,
					status: orders.status,
				})
				.from(orders)
				.where(
					and(
						eq(orders.id, input.orderId),
						eq(orders.userId, ctx.session.user.id)
					)
				)
				.then((rows) => rows[0] ?? null);

			if (!order) {
				return { status: "not_found" as const };
			}

			if (order.isPaid) {
				return { status: "paid" as const };
			}

			if (order.expiresAt && order.expiresAt < new Date()) {
				return { status: "expired" as const };
			}

			return { status: "pending" as const };
		}),
});
