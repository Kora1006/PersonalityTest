import { publicProcedure, router } from "../index";

import { assessmentsRouter } from "./assessments";
import { comparisonRouter } from "./comparison";
import { invitationRouter } from "./invitation";
import { paymentRouter } from "./payment";

export const appRouter = router({
	assessments: assessmentsRouter,
	comparison: comparisonRouter,
	healthCheck: publicProcedure.query(() => "OK"),
	invitation: invitationRouter,
	payment: paymentRouter,
});
export type AppRouter = typeof appRouter;
