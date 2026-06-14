import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { orders } from "@PersonalityTest/db/schema/orders";
import { env } from "@PersonalityTest/env/server";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

export const webhooksRouter = new Hono();

webhooksRouter.post("/wechat-pay", async (c) => {
	if (!env.WECHAT_PAY_MCH_KEY) {
		return c.json({ code: "FAIL", message: "Not configured" }, 503);
	}

	const timestamp = c.req.header("Wechatpay-Timestamp") ?? "";
	const nonce = c.req.header("Wechatpay-Nonce") ?? "";
	const signature = c.req.header("Wechatpay-Signature") ?? "";
	const rawBody = await c.req.text();

	if (!(timestamp && nonce && signature && rawBody)) {
		return c.json({ code: "FAIL", message: "Missing headers" }, 400);
	}

	let notification: {
		resource?: {
			ciphertext?: string;
			associated_data?: string;
			nonce?: string;
			algorithm?: string;
		};
		event_type?: string;
	};

	try {
		notification = JSON.parse(rawBody) as typeof notification;
	} catch {
		return c.json({ code: "FAIL", message: "Invalid JSON" }, 400);
	}

	if (notification.event_type !== "TRANSACTION.SUCCESS") {
		return c.json({ code: "SUCCESS", message: "OK" });
	}

	const db = createDb();

	const prepayId = notification.resource?.ciphertext;
	if (!prepayId) {
		return c.json({ code: "FAIL", message: "Missing prepay_id" }, 400);
	}

	const order = await db
		.select()
		.from(orders)
		.where(eq(orders.wechatPrepayId, prepayId))
		.then((rows) => rows[0] ?? null);

	if (!order || order.isPaid) {
		return c.json({ code: "SUCCESS", message: "OK" });
	}

	const now = new Date();
	await db
		.update(orders)
		.set({ isPaid: true, paidAt: now, status: "paid" })
		.where(eq(orders.id, order.id));

	await db
		.update(assessments)
		.set({ isPaid: true })
		.where(
			and(
				eq(assessments.id, order.assessmentId),
				eq(assessments.userId, order.userId)
			)
		);

	return c.json({ code: "SUCCESS", message: "OK" });
});

webhooksRouter.post("/alipay", async (c) => {
	if (!env.ALIPAY_PUBLIC_KEY) {
		return c.text("fail", 503);
	}

	const rawBody = await c.req.text();
	const params = new URLSearchParams(rawBody);

	const tradeStatus = params.get("trade_status");
	const outTradeNo = params.get("out_trade_no");

	if (tradeStatus !== "TRADE_SUCCESS" || !outTradeNo) {
		return c.text("success");
	}

	const db = createDb();

	const order = await db
		.select()
		.from(orders)
		.where(eq(orders.id, outTradeNo))
		.then((rows) => rows[0] ?? null);

	if (!order || order.isPaid) {
		return c.text("success");
	}

	const alipayTradeNo = params.get("trade_no") ?? null;
	const now = new Date();

	await db
		.update(orders)
		.set({
			alipayTradeNo,
			isPaid: true,
			paidAt: now,
			status: "paid",
		})
		.where(eq(orders.id, order.id));

	await db
		.update(assessments)
		.set({ isPaid: true })
		.where(
			and(
				eq(assessments.id, order.assessmentId),
				eq(assessments.userId, order.userId)
			)
		);

	return c.text("success");
});
