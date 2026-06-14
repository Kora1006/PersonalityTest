import { trpcClient } from "@/utils/trpc";

import { getHistory } from "./history";

export async function syncLocalHistoryToServer(): Promise<void> {
	const local = getHistory();
	if (local.length === 0) {
		return;
	}

	try {
		await trpcClient.assessments.syncHistory.mutate(local);
	} catch {
		// Silently ignore sync failures — local data is the source of truth
	}
}
