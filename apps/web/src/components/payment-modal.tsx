import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { usePaymentPolling } from "@/hooks/use-payment-polling";
import { trpcClient } from "@/utils/trpc";

interface PaymentModalProps {
	assessmentId: string;
	onClose: () => void;
	onPaymentSuccess: () => void;
	open: boolean;
}

type PaymentMethod = "alipay" | "wechat";

const PRICE_DISPLAY = "¥19.00";
const PRICE_LABEL = "DISC 深度解析报告";
const COUNTDOWN_SECONDS = 300;

function formatCountdown(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PaymentModal({
	assessmentId,
	onClose,
	onPaymentSuccess,
	open,
}: PaymentModalProps) {
	const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wechat");
	const [orderId, setOrderId] = useState<string | null>(null);
	const [qrCode, setQrCode] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
	const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const handleSuccess = useCallback(() => {
		toast.success("支付成功！PDF 报告已解锁");
		onPaymentSuccess();
	}, [onPaymentSuccess]);

	usePaymentPolling(orderId, handleSuccess);

	const createOrder = useCallback(
		async (method: PaymentMethod) => {
			setLoading(true);
			setQrCode(null);
			setOrderId(null);
			try {
				const result = await trpcClient.payment.createOrder.mutate({
					assessmentId,
					paymentMethod: method,
				});
				if (result.alreadyPaid) {
					handleSuccess();
					return;
				}
				setOrderId(result.orderId);
				setQrCode(result.qrCode);
				setCountdown(COUNTDOWN_SECONDS);
			} catch {
				toast.error("创建订单失败，请重试");
			} finally {
				setLoading(false);
			}
		},
		[assessmentId, handleSuccess]
	);

	useEffect(() => {
		if (!open) {
			return;
		}
		createOrder(paymentMethod);
	}, [open, paymentMethod, createOrder]);

	useEffect(() => {
		if (!(open && orderId)) {
			return;
		}

		countdownRef.current = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					if (countdownRef.current) {
						clearInterval(countdownRef.current);
					}
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (countdownRef.current) {
				clearInterval(countdownRef.current);
			}
		};
	}, [open, orderId]);

	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
			<div className="w-full max-w-sm rounded-t-3xl bg-white p-6 sm:rounded-3xl">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-gray-900 text-lg">解锁深度报告</h2>
					<button
						className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100"
						onClick={onClose}
						type="button"
					>
						<span className="material-symbols-rounded text-gray-500 text-sm">
							close
						</span>
					</button>
				</div>

				<div className="mb-4 rounded-xl bg-blue-50 p-3">
					<p className="font-medium text-blue-800 text-sm">{PRICE_LABEL}</p>
					<p className="font-bold text-2xl text-blue-600">{PRICE_DISPLAY}</p>
				</div>

				<div className="mb-4 flex rounded-xl bg-gray-100 p-1">
					{(
						[
							{ icon: "wechat", label: "微信支付", value: "wechat" },
							{
								icon: "account_balance_wallet",
								label: "支付宝",
								value: "alipay",
							},
						] as { icon: string; label: string; value: PaymentMethod }[]
					).map(({ icon, label, value }) => (
						<button
							className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 font-semibold text-sm transition ${
								paymentMethod === value
									? "bg-white text-gray-900 shadow-sm"
									: "text-gray-500"
							}`}
							key={value}
							onClick={() => {
								setPaymentMethod(value);
							}}
							type="button"
						>
							<span className="material-symbols-rounded text-base">{icon}</span>
							{label}
						</button>
					))}
				</div>

				<div className="flex flex-col items-center py-4">
					{loading && (
						<div className="h-40 w-40 animate-pulse rounded-lg bg-gray-100" />
					)}
					{!loading && qrCode && (
						<div className="rounded-xl border border-gray-100 p-2 shadow-sm">
							<QRCodeSVG size={156} value={qrCode} />
						</div>
					)}
					{!(loading || qrCode) && (
						<div className="flex h-40 w-40 flex-col items-center justify-center rounded-xl border-2 border-gray-200 border-dashed">
							<span className="material-symbols-rounded text-4xl text-gray-300">
								qr_code
							</span>
							<p className="mt-2 text-center text-gray-400 text-xs">
								{countdown === 0 ? "二维码已过期" : "等待生成..."}
							</p>
						</div>
					)}

					{orderId && countdown > 0 && (
						<p className="mt-3 text-gray-400 text-xs">
							扫码后自动确认 · 剩余{" "}
							<span className="font-medium text-gray-600">
								{formatCountdown(countdown)}
							</span>
						</p>
					)}
					{countdown === 0 && (
						<button
							className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
							onClick={() => createOrder(paymentMethod)}
							type="button"
						>
							重新获取二维码
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
