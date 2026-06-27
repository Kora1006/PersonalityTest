import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { user as userTable } from "@PersonalityTest/db/schema/auth";
import { invitations } from "@PersonalityTest/db/schema/invitations";
import { env } from "@PersonalityTest/env/server";
import crypto from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";
import { getMpAccessToken } from "../utils/wechat";

async function sendUnlockSubscribeMessage(
	inviterOpenId: string
): Promise<void> {
	const templateId = env.WECHAT_INVITE_TEMPLATE_ID;
	if (!templateId) {
		return;
	}
	const token = await getMpAccessToken();
	if (!token) {
		return;
	}
	await fetch(
		`https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				touser: inviterOpenId,
				template_id: templateId,
				data: {
					thing1: { value: "你的深度分析报告已解锁！" },
					time2: { value: new Date().toLocaleString("zh-CN") },
				},
			}),
		}
	);
}

const UNLOCK_THRESHOLD = 2;

export const invitationRouter = router({
	createInvitation: protectedProcedure
		.input(z.object({ resultId: z.string() }))
		.mutation(async ({ input, ctx }) => {
			const db = createDb();
			const inviterId = ctx.session.user.id;

			if (input.resultId === "debug-balanced") {
				const existing = await db
					.select()
					.from(assessments)
					.where(eq(assessments.id, "debug-balanced"))
					.then((rows) => rows[0] ?? null);

				if (!existing) {
					await db.insert(assessments).values({
						id: "debug-balanced",
						userId: inviterId,
						date: new Date(),
						dominantType: "D",
						scoreD: 25,
						scoreI: 25,
						scoreS: 25,
						scoreC: 25,
						note: "全能适配者调试模式",
						theme: "professional",
						mode: "full",
						isUnlocked: true,
					});
				}
			} else {
				// Verify the result belongs to this user
				const result = await db
					.select({ id: assessments.id, isUnlocked: assessments.isUnlocked })
					.from(assessments)
					.where(
						and(
							eq(assessments.id, input.resultId),
							eq(assessments.userId, inviterId)
						)
					)
					.then((rows) => rows[0] ?? null);

				if (!result) {
					throw new Error("Result not found");
				}
			}

			const id = crypto.randomUUID();
			await db.insert(invitations).values({
				id,
				inviterId,
				inviterResultId: input.resultId,
				status: "pending",
			});

			return { invitationId: id, inviterId, inviterResultId: input.resultId };
		}),

	completeInvitation: publicProcedure
		.input(
			z.object({
				invitationId: z.string(),
				inviteeId: z.string(),
				inviteeResultId: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const db = createDb();

			const invitation = await db
				.select()
				.from(invitations)
				.where(eq(invitations.id, input.invitationId))
				.then((rows) => rows[0] ?? null);

			if (!invitation) {
				throw new Error("Invitation not found");
			}
			if (invitation.status === "completed") {
				return { alreadyCompleted: true };
			}

			// Invitee cannot be same as inviter
			if (invitation.inviterId === input.inviteeId) {
				throw new Error("Cannot invite yourself");
			}

			await db
				.update(invitations)
				.set({
					inviteeId: input.inviteeId,
					inviteeResultId: input.inviteeResultId,
					status: "completed",
					completedAt: new Date(),
				})
				.where(eq(invitations.id, input.invitationId));

			// Count distinct invitees who completed for this result (dedupe by inviteeId)
			const completedRows = await db
				.select({ inviteeId: invitations.inviteeId })
				.from(invitations)
				.where(
					and(
						eq(invitations.inviterResultId, invitation.inviterResultId),
						eq(invitations.status, "completed"),
						ne(invitations.inviteeId, invitation.inviterId)
					)
				);

			const uniqueInvitees = new Set(
				completedRows.map((r) => r.inviteeId).filter(Boolean)
			);
			const completedCount = uniqueInvitees.size;

			let justUnlocked = false;
			if (completedCount >= UNLOCK_THRESHOLD) {
				const current = await db
					.select({ isUnlocked: assessments.isUnlocked })
					.from(assessments)
					.where(eq(assessments.id, invitation.inviterResultId))
					.then((rows) => rows[0] ?? null);

				if (current && !current.isUnlocked) {
					await db
						.update(assessments)
						.set({ isUnlocked: true })
						.where(eq(assessments.id, invitation.inviterResultId));
					justUnlocked = true;

					// Send WeChat subscribe message notification to inviter
					const inviter = await db
						.select({ wechatOpenId: userTable.wechatOpenId })
						.from(userTable)
						.where(eq(userTable.id, invitation.inviterId))
						.then((rows) => rows[0] ?? null);

					if (inviter?.wechatOpenId) {
						sendUnlockSubscribeMessage(inviter.wechatOpenId).catch(() => {
							// Fire-and-forget, ignore errors
						});
					}
				}
			}

			return {
				alreadyCompleted: false,
				completedCount,
				justUnlocked,
				inviterId: invitation.inviterId,
				inviterResultId: invitation.inviterResultId,
			};
		}),

	getUnlockStatus: protectedProcedure
		.input(z.object({ resultId: z.string() }))
		.query(async ({ input, ctx }) => {
			const db = createDb();
			const userId = ctx.session.user.id;

			const result = await db
				.select({ isUnlocked: assessments.isUnlocked })
				.from(assessments)
				.where(
					and(
						eq(assessments.id, input.resultId),
						eq(assessments.userId, userId)
					)
				)
				.then((rows) => rows[0] ?? null);

			if (!result) {
				throw new Error("Result not found");
			}

			const completedRows = await db
				.select({ inviteeId: invitations.inviteeId })
				.from(invitations)
				.where(
					and(
						eq(invitations.inviterResultId, input.resultId),
						eq(invitations.status, "completed"),
						ne(invitations.inviteeId, userId)
					)
				);

			const uniqueInvitees = new Set(
				completedRows.map((r) => r.inviteeId).filter(Boolean)
			);

			return {
				isUnlocked: result.isUnlocked ?? false,
				inviteCount: uniqueInvitees.size,
				needed: UNLOCK_THRESHOLD,
			};
		}),

	getInvitationPreview: publicProcedure
		.input(z.object({ invitationId: z.string() }))
		.query(async ({ input }) => {
			const db = createDb();

			const invitation = await db
				.select()
				.from(invitations)
				.where(eq(invitations.id, input.invitationId))
				.then((rows) => rows[0] ?? null);

			if (!invitation) {
				throw new Error("Invitation not found");
			}

			const [assessment, inviterUser] = await Promise.all([
				db
					.select()
					.from(assessments)
					.where(eq(assessments.id, invitation.inviterResultId))
					.then((rows) => rows[0] ?? null),
				db
					.select({ name: userTable.name })
					.from(userTable)
					.where(eq(userTable.id, invitation.inviterId))
					.then((rows) => rows[0] ?? null),
			]);

			if (!assessment) {
				throw new Error("Assessment not found");
			}

			const scores = {
				D: assessment.scoreD,
				I: assessment.scoreI,
				S: assessment.scoreS,
				C: assessment.scoreC,
			};
			const sorted = (["D", "I", "S", "C"] as const)
				.slice()
				.sort((a, b) => scores[b] - scores[a]);
			const compositeType = `${sorted[0]}${sorted[1]}`;

			return {
				inviterName: inviterUser?.name ?? "用户",
				compositeType,
			};
		}),
});
