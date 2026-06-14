import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

export default function Register() {
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: { email: "", name: "", password: "", confirmPassword: "" },
		onSubmit: async ({ value }) => {
			await authClient.signUp.email(
				{ email: value.email, password: value.password, name: value.name },
				{
					onSuccess: () => {
						toast.success("注册成功，欢迎加入！");
						navigate("/");
					},
					onError: (err) => toast.error(err.error.message || "注册失败"),
				}
			);
		},
		validators: {
			onSubmit: z
				.object({
					confirmPassword: z.string(),
					email: z.email("邮箱格式不正确"),
					name: z.string().min(2, "昵称至少 2 个字符"),
					password: z.string().min(6, "密码至少 6 位"),
				})
				.refine((v) => v.password === v.confirmPassword, {
					message: "两次密码不一致",
					path: ["confirmPassword"],
				}),
		},
	});

	const fields = [
		{
			label: "昵称",
			name: "name" as const,
			placeholder: "请输入昵称",
			type: "text",
		},
		{
			label: "邮箱",
			name: "email" as const,
			placeholder: "请输入邮箱",
			type: "email",
		},
		{
			label: "密码",
			name: "password" as const,
			placeholder: "至少 6 位",
			type: "password",
		},
		{
			label: "确认密码",
			name: "confirmPassword" as const,
			placeholder: "再次输入密码",
			type: "password",
		},
	];

	return (
		<div className="flex min-h-screen flex-col">
			<div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-12 pb-10 text-center text-white">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow">
					<span className="material-symbols-rounded text-3xl text-white">
						person_add
					</span>
				</div>
				<h1 className="mb-1 font-bold text-2xl">创建账号</h1>
				<p className="text-blue-100 text-sm">开始您的 DISC 性格探索之旅</p>
			</div>

			<div className="-mt-5 flex-1 rounded-t-3xl bg-white px-6 pt-8 pb-24">
				<form
					className="space-y-4"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					{fields.map(({ label, name, placeholder, type }) => (
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
										type={type}
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
								{isSubmitting ? "注册中..." : "立即注册"}
							</button>
						)}
					</form.Subscribe>
				</form>

				<div className="mt-8 text-center text-gray-500 text-sm">
					已有账号？{" "}
					<Link
						className="font-semibold text-blue-600 hover:underline"
						to="/login"
					>
						立即登录
					</Link>
				</div>
			</div>
		</div>
	);
}
