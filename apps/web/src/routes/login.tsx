import { env } from "@PersonalityTest/env/web";
import { useForm } from "@tanstack/react-form";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import { syncLocalHistoryToServer } from "@/lib/sync";

// biome-ignore lint/correctness/noUnusedVariables: temporarily disabled (no domain)
const MICROMESSENGER_RE = /MicroMessenger/i;

// biome-ignore lint/correctness/noUnusedVariables: temporarily disabled (no domain)
type Tab = "email" | "wechat";

interface WechatQrData {
	qrUrl: string;
	state: string;
}

function EmailLoginForm({ onSuccess }: { onSuccess: () => void }) {
	const form = useForm({
		defaultValues: { email: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.signIn.email(
				{ email: value.email, password: value.password },
				{
					onSuccess,
					onError: (err) => toast.error(err.error.message || "登录失败"),
				}
			);
		},
		validators: {
			onSubmit: z.object({
				email: z.email("邮箱格式不正确"),
				password: z.string().min(6, "密码至少 6 位"),
			}),
		},
	});

	return (
		<form
			className="space-y-4"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<form.Field name="email">
				{(field) => (
					<div className="space-y-1">
						<label
							className="font-medium text-gray-700 text-sm"
							htmlFor={field.name}
						>
							邮箱
						</label>
						<input
							className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							id={field.name}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="请输入邮箱"
							type="email"
							value={field.state.value}
						/>
						{field.state.meta.errors.map((err) => (
							<p className="text-red-500 text-xs" key={err?.message}>
								{err?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Field name="password">
				{(field) => (
					<div className="space-y-1">
						<div className="flex items-center justify-between">
							<label
								className="font-medium text-gray-700 text-sm"
								htmlFor={field.name}
							>
								密码
							</label>
							<Link
								className="text-blue-600 text-xs hover:underline"
								to="/reset-password"
							>
								忘记密码？
							</Link>
						</div>
						<input
							className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							id={field.name}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="请输入密码"
							type="password"
							value={field.state.value}
						/>
						{field.state.meta.errors.map((err) => (
							<p className="text-red-500 text-xs" key={err?.message}>
								{err?.message}
							</p>
						))}
					</div>
				)}
			</form.Field>

			<form.Subscribe
				selector={(state) => ({
					canSubmit: state.canSubmit,
					isSubmitting: state.isSubmitting,
				})}
			>
				{({ canSubmit, isSubmitting }) => (
					<button
						className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-sm text-white transition hover:bg-blue-700 disabled:opacity-50"
						disabled={!canSubmit || isSubmitting}
						type="submit"
					>
						{isSubmitting ? "登录中..." : "立即登录"}
					</button>
				)}
			</form.Subscribe>
		</form>
	);
}

// biome-ignore lint/correctness/noUnusedVariables: temporarily disabled (no domain)
function WechatQrTab({ onSuccess }: { onSuccess: () => void }) {
	const [qrData, setQrData] = useState<WechatQrData | null>(null);
	const [status, setStatus] = useState<"loading" | "pending" | "expired">(
		"loading"
	);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const fetchQr = useCallback(async () => {
		setStatus("loading");
		setQrData(null);
		try {
			const res = await fetch(`${env.VITE_SERVER_URL}/api/auth/wechat/qr`);
			if (!res.ok) {
				throw new Error("WeChat not configured");
			}
			const data = (await res.json()) as WechatQrData;
			setQrData(data);
			setStatus("pending");
		} catch {
			setStatus("expired");
		}
	}, []);

	useEffect(() => {
		fetchQr();
		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current);
			}
		};
	}, [fetchQr]);

	useEffect(() => {
		if (!qrData || status !== "pending") {
			return;
		}

		pollRef.current = setInterval(async () => {
			const res = await fetch(
				`${env.VITE_SERVER_URL}/api/auth/wechat/poll/${qrData.state}`
			);
			const data = (await res.json()) as { status: string };
			if (data.status === "success") {
				if (pollRef.current) {
					clearInterval(pollRef.current);
				}
				await authClient.getSession({ query: { disableCookieCache: true } });
				onSuccess();
			} else if (data.status === "expired") {
				if (pollRef.current) {
					clearInterval(pollRef.current);
				}
				setStatus("expired");
			}
		}, 2000);

		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current);
			}
		};
	}, [qrData, status, onSuccess]);

	if (status === "loading") {
		return (
			<div className="flex flex-col items-center gap-4 py-8">
				<div className="h-48 w-48 animate-pulse rounded-lg bg-gray-100" />
				<p className="text-gray-500 text-sm">生成二维码中...</p>
			</div>
		);
	}

	if (status === "expired" || !qrData) {
		return (
			<div className="flex flex-col items-center gap-4 py-8">
				<div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-gray-200 border-dashed">
					<span className="material-symbols-rounded text-5xl text-gray-300">
						qr_code
					</span>
				</div>
				<p className="text-gray-500 text-sm">二维码已过期</p>
				<button
					className="rounded-lg bg-blue-600 px-6 py-2 text-sm text-white hover:bg-blue-700"
					onClick={fetchQr}
					type="button"
				>
					刷新二维码
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-4 py-8">
			<div className="rounded-xl border border-gray-100 p-3 shadow-sm">
				<QRCodeSVG size={180} value={qrData.qrUrl} />
			</div>
			<p className="text-center text-gray-500 text-sm">
				使用微信扫描二维码登录
				<br />
				<span className="text-gray-400 text-xs">二维码 5 分钟内有效</span>
			</p>
		</div>
	);
}

export default function Login() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const redirect = searchParams.get("redirect") ?? "/";

	// Temporarily disable WeChat automatic login redirect (no domain name)
	const isWechat = false;

	const handleSuccess = async () => {
		await syncLocalHistoryToServer();
		toast.success("登录成功");
		navigate(redirect);
	};

	if (isWechat && env.VITE_SERVER_URL) {
		const redirectUri = encodeURIComponent(
			`${env.VITE_SERVER_URL}/api/auth/wechat/callback`
		);
		const wechatAuthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=WECHAT_APP_ID&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=h5#wechat_redirect`;

		return (
			<div className="flex min-h-screen items-center justify-center p-6">
				<div className="w-full max-w-sm text-center">
					<div className="mb-8 flex justify-center">
						<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-500 shadow-lg">
							<span className="material-symbols-rounded text-4xl text-white">
								wechat
							</span>
						</div>
					</div>
					<h1 className="mb-2 font-bold text-2xl text-gray-900">微信登录</h1>
					<p className="mb-8 text-gray-500 text-sm">点击授权以微信身份登录</p>
					<a
						className="block w-full rounded-xl bg-green-500 py-4 font-semibold text-base text-white transition hover:bg-green-600"
						href={wechatAuthUrl}
					>
						微信一键登录
					</a>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-12 pb-10 text-center text-white">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow">
					<span className="material-symbols-rounded text-3xl text-white">
						psychology
					</span>
				</div>
				<h1 className="mb-1 font-bold text-2xl">欢迎回来</h1>
				<p className="text-blue-100 text-sm">登录继续您的 DISC 性格探索</p>
			</div>

			<div className="-mt-5 flex-1 rounded-t-3xl bg-white px-6 pt-8 pb-24">
				<EmailLoginForm onSuccess={handleSuccess} />

				<div className="mt-8 text-center text-gray-500 text-sm">
					还没有账号？{" "}
					<Link
						className="font-semibold text-blue-600 hover:underline"
						to="/register"
					>
						立即注册
					</Link>
				</div>
			</div>
		</div>
	);
}
