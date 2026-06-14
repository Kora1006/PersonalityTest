import { useForm } from "@tanstack/react-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

function RequestResetForm() {
	const form = useForm({
		defaultValues: { email: "" },
		onSubmit: async ({ value }) => {
			await authClient.requestPasswordReset(
				{ email: value.email, redirectTo: "/reset-password" },
				{
					onSuccess: () => toast.success("重置邮件已发送，请检查您的邮箱"),
					onError: (err) => toast.error(err.error.message || "发送失败"),
				}
			);
		},
		validators: {
			onSubmit: z.object({ email: z.email("邮箱格式不正确") }),
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
							注册邮箱
						</label>
						<input
							className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							id={field.name}
							name={field.name}
							onBlur={field.handleBlur}
							onChange={(e) => field.handleChange(e.target.value)}
							placeholder="请输入注册邮箱"
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
						{isSubmitting ? "发送中..." : "发送重置邮件"}
					</button>
				)}
			</form.Subscribe>

			<div className="text-center">
				<Link className="text-blue-600 text-sm hover:underline" to="/login">
					返回登录
				</Link>
			</div>
		</form>
	);
}

function SetNewPasswordForm({ token }: { token: string }) {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: { confirmPassword: "", password: "" },
		onSubmit: async ({ value }) => {
			await authClient.resetPassword(
				{ newPassword: value.password, token },
				{
					onSuccess: () => {
						toast.success("密码已重置，请重新登录");
						navigate("/login");
					},
					onError: (err) =>
						toast.error(err.error.message || "重置失败，链接可能已过期"),
				}
			);
		},
		validators: {
			onSubmit: z
				.object({
					confirmPassword: z.string(),
					password: z.string().min(6, "密码至少 6 位"),
				})
				.refine((v) => v.password === v.confirmPassword, {
					message: "两次密码不一致",
					path: ["confirmPassword"],
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
			{(
				[
					{
						label: "新密码",
						name: "password" as const,
						placeholder: "至少 6 位",
					},
					{
						label: "确认新密码",
						name: "confirmPassword" as const,
						placeholder: "再次输入新密码",
					},
				] as const
			).map(({ label, name, placeholder }) => (
				<form.Field key={name} name={name}>
					{(field) => (
						<div className="space-y-1">
							<label
								className="font-medium text-gray-700 text-sm"
								htmlFor={field.name}
							>
								{label}
							</label>
							<input
								className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								id={field.name}
								name={field.name}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(e.target.value)}
								placeholder={placeholder}
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
			))}

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
						{isSubmitting ? "设置中..." : "设置新密码"}
					</button>
				)}
			</form.Subscribe>
		</form>
	);
}

export default function ResetPassword() {
	const [searchParams] = useSearchParams();
	const token = searchParams.get("token");

	return (
		<div className="flex min-h-screen flex-col">
			<div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-12 pb-10 text-center text-white">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow">
					<span className="material-symbols-rounded text-3xl text-white">
						lock_reset
					</span>
				</div>
				<h1 className="mb-1 font-bold text-2xl">
					{token ? "设置新密码" : "找回密码"}
				</h1>
				<p className="text-blue-100 text-sm">
					{token ? "请输入您的新密码" : "我们将发送重置链接到您的邮箱"}
				</p>
			</div>

			<div className="-mt-5 flex-1 rounded-t-3xl bg-white px-6 pt-8 pb-24">
				{token ? <SetNewPasswordForm token={token} /> : <RequestResetForm />}
			</div>
		</div>
	);
}
