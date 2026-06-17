import { createContext } from "@PersonalityTest/api/context";
import { appRouter } from "@PersonalityTest/api/routers/index";
import { auth } from "@PersonalityTest/auth";
import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { env } from "@PersonalityTest/env/server";
import { trpcServer } from "@hono/trpc-server";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { ReportDocument } from "./pdf/report-template";
import { webhooksRouter } from "./webhooks";
import { wechatRouter } from "./wechat";

const app = new Hono();

app.use(logger());
app.use(
	"/*",
	cors({
		origin: env.CORS_ORIGIN,
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

app.route("/api/auth/wechat", wechatRouter);
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
app.route("/webhooks", webhooksRouter);

app.use(
	"/trpc/*",
	trpcServer({
		router: appRouter,
		createContext: (_opts, context) => createContext({ context }),
	})
);

app.get("/report/download/:assessmentId", async (c) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	if (!session) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const { assessmentId } = c.req.param();
	const db = createDb();

	const assessment = await db
		.select()
		.from(assessments)
		.where(
			and(
				eq(assessments.id, assessmentId),
				eq(assessments.userId, session.user.id),
				eq(assessments.isPaid, true)
			)
		)
		.then((rows) => rows[0] ?? null);

	if (!assessment) {
		return c.json({ error: "Not found or not paid" }, 403);
	}

	const { renderToBuffer } = await import("@react-pdf/renderer");
	const { createElement } = await import("react");
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const element = createElement(ReportDocument, {
		data: {
			date:
				assessment.date instanceof Date
					? assessment.date.toISOString().slice(0, 10)
					: String(assessment.date),
			dominantType: assessment.dominantType,
			isPaid: assessment.isPaid ?? false,
			note: assessment.note ?? "",
			scores: {
				C: assessment.scoreC,
				D: assessment.scoreD,
				I: assessment.scoreI,
				S: assessment.scoreS,
			},
			userName: session.user.name ?? "用户",
		},
	}) as Parameters<typeof renderToBuffer>[0];

	const pdfBuffer = await renderToBuffer(element);

	return new Response(pdfBuffer, {
		headers: {
			"Content-Disposition": `attachment; filename="DISC-Report-${assessmentId}.pdf"`,
			"Content-Type": "application/pdf",
		},
	});
});

app.get("/", (c) => c.text("OK"));

import { serve } from "@hono/node-server";

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	}
);
