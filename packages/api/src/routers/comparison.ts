import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { publicProcedure, router } from "../index";

type DiscType = "D" | "I" | "S" | "C";

const insights: Record<string, string> = {
	"C+D": "高效组合：决策力 × 精确度，能做出既快又准的判断",
	"D+I": "强驱动组合：行动力 × 感染力，最适合打开局面",
	"D+S": "天然互补：D型负责推进，S型保持稳定，协作默契",
	"C+I": "创意与质量并重：I型带来点子，C型把控细节",
	"C+S": "完美搭档：稳健执行 × 严格把控，零差错团队",
	"I+S": "温暖组合：氛围营造 × 耐心倾听，团队凝聚力最强",
	"C+C": "两人都注重精确，合作时需明确分工避免重叠",
	"D+D": "双D碰撞：能量满格，注意协调方向防止内耗",
	"I+I": "双I组合：创意无限，记得找人帮忙落地执行",
	"S+S": "稳稳的力量：节奏一致，需要外部推力保持进展",
};

function getInsight(typeA: DiscType, typeB: DiscType): string {
	const key = [typeA, typeB].sort().join("+");
	return insights[key] ?? "你们的风格各有特色，互相学习是最大的收获";
}

export const comparisonRouter = router({
	getComparison: publicProcedure
		.input(
			z.object({
				myResultId: z.string(),
				friendResultId: z.string(),
			})
		)
		.query(async ({ input }) => {
			const db = createDb();

			const [myResult, friendResult] = await Promise.all([
				db
					.select()
					.from(assessments)
					.where(eq(assessments.id, input.myResultId))
					.then((rows) => rows[0] ?? null),
				db
					.select()
					.from(assessments)
					.where(eq(assessments.id, input.friendResultId))
					.then((rows) => rows[0] ?? null),
			]);

			if (!(myResult && friendResult)) {
				throw new Error("One or both results not found");
			}

			const myScores = {
				D: myResult.scoreD,
				I: myResult.scoreI,
				S: myResult.scoreS,
				C: myResult.scoreC,
			};
			const friendScores = {
				D: friendResult.scoreD,
				I: friendResult.scoreI,
				S: friendResult.scoreS,
				C: friendResult.scoreC,
			};

			return {
				my: {
					resultId: myResult.id,
					dominantType: myResult.dominantType as DiscType,
					scores: myScores,
				},
				friend: {
					resultId: friendResult.id,
					dominantType: friendResult.dominantType as DiscType,
					scores: friendScores,
				},
				insight: getInsight(
					myResult.dominantType as DiscType,
					friendResult.dominantType as DiscType
				),
			};
		}),
});
