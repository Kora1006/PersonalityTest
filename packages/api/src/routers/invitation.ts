import { createDb } from "@PersonalityTest/db";
import { assessments } from "@PersonalityTest/db/schema/assessments";
import { user as userTable } from "@PersonalityTest/db/schema/auth";
import { invitations } from "@PersonalityTest/db/schema/invitations";
import { env } from "@PersonalityTest/env/server";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../index";

let cachedMpToken: { token: string; expiresAt: number } | null = null;

async function getMpAccessToken(): Promise<string | null> {
	if (cachedMpToken && Date.now() < cachedMpToken.expiresAt) {
		return cachedMpToken.token;
	}
	if (!(env.WECHAT_APP_ID && env.WECHAT_APP_SECRET)) {
		return null;
	}
	const res = await fetch(
		`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${env.WECHAT_APP_ID}&secret=${env.WECHAT_APP_SECRET}`
	);
	const data = (await res.json()) as {
		access_token?: string;
		expires_in?: number;
	};
	if (!data.access_token) {
		return null;
	}
	cachedMpToken = {
		token: data.access_token,
		expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000 - 5 * 60 * 1000,
	};
	return data.access_token;
}

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
});
