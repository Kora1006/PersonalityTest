import { useCallback, useEffect } from "react";

import { trpcClient } from "@/utils/trpc";

export function usePaymentPolling(
	orderId: string | null,
	onSuccess: () => void
) {
	const stableOnSuccess = useCallback(onSuccess, [onSuccess]);

	useEffect(() => {
		if (!orderId) {
			return;
		}

		const interval = setInterval(async () => {
			const result = await trpcClient.payment.getOrderStatus.query({ orderId });
			if (result.status === "paid") {
				clearInterval(interval);
				stableOnSuccess();
			} else if (result.status === "expired") {
				clearInterval(interval);
			}
		}, 3000);

		return () => clearInterval(interval);
	}, [orderId, stableOnSuccess]);
}
