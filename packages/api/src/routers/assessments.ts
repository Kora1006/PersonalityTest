import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

const historyRecordSchema = z.object({
	id: z.string(),
	date: z.string(),
	dominantType: z.enum(["D", "I", "S", "C"]),
	scores: z.object({
		D: z.number(),
		I: z.number(),
		S: z.number(),
		C: z.number(),
	}),
	note: z.string().default(""),
	theme: z
		.enum(["professional", "relationship", "leadership"])
		.default("professional"),
});

export const assessmentsRouter = router({
	syncHistory: protectedProcedure
		.input(z.array(historyRecordSchema))
		.mutation(async ({ ctx, input }) => {
			const db = createDb();
			const userId = ctx.session.user.id;

			const existing = await db
				.select({ id: assessments.id })
				.from(assessments)
				.where(eq(assessments.userId, userId));

			const existingIds = new Set(existing.map((r) => r.id));
			const newRecords = input.filter((r) => !existingIds.has(r.id));

			if (newRecords.length > 0) {
				await db.insert(assessments).values(
					newRecords.map((r) => ({
						date: new Date(r.date),
						dominantType: r.dominantType,
						id: r.id,
						note: r.note,
						scoreC: r.scores.C,
						scoreD: r.scores.D,
						scoreI: r.scores.I,
						scoreS: r.scores.S,
						theme: r.theme,
						userId,
					}))
				);
			}

			return { synced: newRecords.length };
		}),

	getHistory: protectedProcedure.query(async ({ ctx }) => {
		const db = createDb();
		const userId = ctx.session.user.id;

		const rows = await db
			.select()
			.from(assessments)
			.where(and(eq(assessments.userId, userId)))
			.orderBy(desc(assessments.date));

		return rows.map((r) => ({
			date:
				r.date instanceof Date
					? r.date.toISOString().slice(0, 10)
					: String(r.date),
			dominantType: r.dominantType as "D" | "I" | "S" | "C",
			id: r.id,
			scores: {
				D: r.scoreD,
				I: r.scoreI,
				S: r.scoreS,
				C: r.scoreC,
			},
			note: r.note ?? "",
			isPaid: r.isPaid ?? false,
			theme: (r.theme ?? "professional") as
				| "professional"
				| "relationship"
				| "leadership",
		}));
	}),
});
