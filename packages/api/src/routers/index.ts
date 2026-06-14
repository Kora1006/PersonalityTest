import { publicProcedure, router } from "../index";

import { assessmentsRouter } from "./assessments";
import { paymentRouter } from "./payment";

export const appRouter = router({
	assessments: assessmentsRouter,
	healthCheck: publicProcedure.query(() => "OK"),
	payment: paymentRouter,
});
export type AppRouter = typeof appRouter;
