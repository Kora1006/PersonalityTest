import { env } from "@PersonalityTest/env/web";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { redirect, useNavigate, useSearchParams } from "react-router";
import { PaymentModal } from "@/components/payment-modal";
import { RadarChart } from "@/components/radar-chart";
import { useQuiz } from "@/contexts/quiz-context";
import type { DiscType } from "@/data/disc-colors";
import { DISC_COLORS } from "@/data/disc-colors";
import { DISC_PROFILES } from "@/data/disc-profiles";
import { authClient } from "@/lib/auth-client";
import { getHistory } from "@/lib/history";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/detail";

export async function clientLoader({ request }: { request: Request }) {
	const url = new URL(request.url);
	if (url.searchParams.get("id")) {
		const session = await authClient.getSession();
		if (!session.data) {
			throw redirect(
				`/login?redirect=${encodeURIComponent(url.pathname + url.search)}`
			);
		}
	}
	return null;
}

export function meta(_: Route.MetaArgs) {
	return [{ title: "DISC 深度解析" }];
}

const GROWTH_COLORS = ["#10b981", "#f59e0b", "#ef4444"];

export default function Detail() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { dominantType: contextType, scores: contextScores } = useQuiz();
	const { data: session } = authClient.useSession();
	const [showPayment, setShowPayment] = useState(false);
	const [isPaidUnlocked, setIsPaidUnlocked] = useState(false);

	const historyId = searchParams.get("id");

	let activeRecord: {
		dominantType: DiscType;
		scores: Record<DiscType, number>;
	} | null = null;

	if (historyId) {
		const found = getHistory().find((r) => r.id === historyId);
		if (found) {
			activeRecord = {
				dominantType: found.dominantType,
				scores: found.scores,
			};
		}
	} else if (contextType) {
		activeRecord = { dominantType: contextType, scores: contextScores };
	}

	useEffect(() => {
		if (!activeRecord) {
			navigate("/", { replace: true });
		}
	}, [activeRecord, navigate]);

	const { data: serverHistory } = useQuery({
		...trpc.assessments.getHistory.queryOptions(),
		enabled: !!session && !!historyId,
	});

	useEffect(() => {
		if (serverHistory && historyId) {
			const record = serverHistory.find((r) => r.id === historyId);
			if (record?.isPaid) {
				setIsPaidUnlocked(true);
			}
		}
	}, [serverHistory, historyId]);

	if (!activeRecord) {
		return null;
	}

	const { dominantType, scores } = activeRecord;
	const profile = DISC_PROFILES[dominantType];
	const color = DISC_COLORS[dominantType];
	const dominantScore = scores[dominantType];

	return (
		<div className="mx-auto max-w-lg">
			{/* Type Overview Header */}
			<div className={`px-5 pt-14 pb-8 text-white ${color.gradientClass}`}>
				<button
					className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
					onClick={() => navigate(-1)}
					type="button"
				>
					<span className="material-symbols-outlined text-white text-xl">
						arrow_back
					</span>
				</button>

				<div className="mb-4 flex items-center gap-4">
					<div className="relative">
						<div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/20">
							<span className="font-extrabold text-4xl text-white">
								{dominantType}
							</span>
						</div>
						<div className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-white/30">
							<span className="material-symbols-outlined text-base text-white">
								{profile.icon}
							</span>
						</div>
					</div>
					<div>
						<h1 className="font-bold text-2xl">{profile.name}</h1>
						<p className="font-mono font-semibold text-xs uppercase tracking-widest opacity-80">
							PRIMARY TYPE: {profile.fullName} ({dominantType})
						</p>
					</div>
				</div>

				<p className="mb-4 text-sm leading-relaxed opacity-90">
					{profile.description}
				</p>

				<div>
					<div className="mb-1 flex justify-between font-mono font-semibold text-xs uppercase opacity-80">
						<span>DOMINANCE STRENGTH</span>
						<span>{dominantScore}%</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-white/30">
						<div
							className="h-full rounded-full bg-white transition-all duration-700 ease-out"
							style={{ width: `${dominantScore}%` }}
						/>
					</div>
				</div>
			</div>

			<div className="px-5 pb-32">
				{/* Radar */}
				<div className="mt-5 mb-5 flex flex-col items-center rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 w-full font-bold text-base text-foreground">
						四维能力雷达图
					</h3>
					<RadarChart scores={scores} size={240} />
				</div>

				{/* Strengths Card */}
				<div className="mb-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 flex items-center gap-2 font-bold text-base text-foreground">
						<span className="material-symbols-outlined text-emerald-500 text-xl">
							star
						</span>
						核心优势
					</h3>
					<div className="flex flex-col gap-2">
						{profile.strengths.map((s, i) => (
							<div
								className="flex items-center gap-3 rounded-xl p-3"
								key={s}
								style={{ background: `${color.hex}0f` }}
							>
								<div
									className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-bold font-mono text-white text-xs"
									style={{ background: color.hex }}
								>
									{i + 1}
								</div>
								<span className="font-medium text-foreground text-sm">{s}</span>
							</div>
						))}
					</div>
				</div>

				{/* Workplace Card */}
				<div className="mb-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 flex items-center gap-2 font-bold text-base text-foreground">
						<span className="material-symbols-outlined text-primary text-xl">
							business_center
						</span>
						职场表现
					</h3>
					<div className="flex flex-col gap-4">
						{[
							{
								icon: "groups",
								label: "团队协作",
								text: profile.workplaceStyle.collaboration,
							},
							{
								icon: "manage_accounts",
								label: "管理风格",
								text: profile.workplaceStyle.management,
							},
							{
								icon: "toggle_off",
								label: "工作自主性",
								text: profile.workplaceStyle.microManagement,
							},
						].map(({ icon, label, text }) => (
							<div key={label}>
								<div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground text-sm">
									<span
										className="material-symbols-outlined text-base"
										style={{ color: color.hex }}
									>
										{icon}
									</span>
									{label}
								</div>
								<p className="pl-6 text-muted-foreground text-sm leading-relaxed">
									{text}
								</p>
							</div>
						))}
					</div>
				</div>

				{/* Communication Panel */}
				<div className="mb-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 flex items-center gap-2 font-bold text-base text-foreground">
						<span className="material-symbols-outlined text-amber-500 text-xl">
							forum
						</span>
						沟通风格
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="mb-2 font-mono font-semibold text-primary text-xs uppercase tracking-widest">
								我的表达方式
							</p>
							<ul className="flex flex-col gap-2">
								{profile.communication.express.map((item) => (
									<li
										className="flex items-start gap-1.5 text-muted-foreground text-sm leading-relaxed"
										key={item}
									>
										<span
											className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
											style={{ background: color.hex }}
										/>
										{item}
									</li>
								))}
							</ul>
						</div>
						<div>
							<p className="mb-2 font-mono font-semibold text-muted-foreground text-xs uppercase tracking-widest">
								如何与我沟通
							</p>
							<ul className="flex flex-col gap-2">
								{profile.communication.receive.map((item) => (
									<li
										className="flex items-start gap-1.5 text-muted-foreground text-sm leading-relaxed"
										key={item}
									>
										<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
										{item}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Growth Matrix */}
				<div className="mb-5 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 flex items-center gap-2 font-bold text-base text-foreground">
						<span className="material-symbols-outlined text-primary text-xl">
							trending_up
						</span>
						成长机会
					</h3>
					<div className="flex flex-col gap-3">
						{profile.growthHabits.map((habit, i) => (
							<div
								className="flex gap-4 rounded-xl border-l-4 p-4"
								key={habit.title}
								style={{
									background: "#f0f3ff",
									borderColor: GROWTH_COLORS[i] ?? color.hex,
								}}
							>
								<span
									className="material-symbols-outlined mt-0.5 text-xl"
									style={{ color: GROWTH_COLORS[i] ?? color.hex }}
								>
									{habit.icon}
								</span>
								<div>
									<p
										className="mb-1 font-bold font-mono text-xs uppercase tracking-widest"
										style={{ color: GROWTH_COLORS[i] ?? color.hex }}
									>
										{habit.title}
									</p>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{habit.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Download Report CTA */}
				<div className="rounded-2xl bg-secondary p-6 text-center">
					<span className="material-symbols-outlined mb-3 text-5xl text-primary">
						description
					</span>
					<h3 className="mb-2 font-bold text-foreground text-lg">
						{isPaidUnlocked ? "下载 PDF 报告" : "解锁完整档案"}
					</h3>
					<p className="mb-5 text-muted-foreground text-sm leading-relaxed">
						{isPaidUnlocked
							? "您的 DISC 深度分析报告已解锁，点击下载。"
							: "获取完整的 PDF 分析，包括行为盲点和团队动态。¥19"}
					</p>
					{isPaidUnlocked && historyId ? (
						<a
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
							href={`${env.VITE_SERVER_URL}/report/download/${historyId}`}
							rel="noopener noreferrer"
							target="_blank"
						>
							<span className="material-symbols-outlined text-xl">
								download
							</span>
							下载 PDF 报告
						</a>
					) : (
						<button
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
							onClick={() => {
								if (!session) {
									navigate(
										`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
									);
									return;
								}
								setShowPayment(true);
							}}
							type="button"
						>
							<span className="material-symbols-outlined text-xl">
								lock_open
							</span>
							{session ? "¥19 立即解锁" : "登录后解锁"}
						</button>
					)}
				</div>

				{historyId && (
					<PaymentModal
						assessmentId={historyId}
						onClose={() => setShowPayment(false)}
						onPaymentSuccess={() => {
							setIsPaidUnlocked(true);
							setShowPayment(false);
						}}
						open={showPayment}
					/>
				)}
			</div>
		</div>
	);
}
