import { env } from "@PersonalityTest/env/server";
import { publicProcedure, router } from "../index";

import { assessmentsRouter } from "./assessments";
import { comparisonRouter } from "./comparison";
import { invitationRouter } from "./invitation";
import { paymentRouter } from "./payment";

export const appRouter = router({
	assessments: assessmentsRouter,
	comparison: comparisonRouter,
	healthCheck: publicProcedure.query(() => "OK"),
	getSettings: publicProcedure.query(() => {
		return {
			auditMode: env.WECHAT_AUDIT_MODE === "true",
		};
	}),
	invitation: invitationRouter,
	payment: paymentRouter,
});
export type AppRouter = typeof appRouter;
