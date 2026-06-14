import { env } from "@PersonalityTest/env/web";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { RadarChart } from "@/components/radar-chart";
import { useQuiz } from "@/contexts/quiz-context";
import type { DiscType } from "@/data/disc-colors";
import { DISC_COLORS } from "@/data/disc-colors";
import { DISC_PROFILES } from "@/data/disc-profiles";
import { authClient } from "@/lib/auth-client";
import { getHistory } from "@/lib/history";
import { trpc } from "@/utils/trpc";
import type { Route } from "./+types/result";

export function meta(_: Route.MetaArgs) {
	return [{ title: "DISC 测评结果" }];
}

const DISC_ORDER = ["D", "I", "S", "C"] as const;

export default function Result() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { dominantType: contextType, scores: contextScores, reset } = useQuiz();
	const { data: session } = authClient.useSession();

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

	if (!activeRecord) {
		return null;
	}

	const { dominantType, scores } = activeRecord;
	const profile = DISC_PROFILES[dominantType];
	const color = DISC_COLORS[dominantType];

	const serverRecord = serverHistory?.find((r) => r.id === historyId);
	const isPaid = serverRecord?.isPaid ?? false;

	const handleDownloadClick = () => {
		if (isPaid && historyId) {
			window.open(
				`${env.VITE_SERVER_URL}/report/download/${historyId}`,
				"_blank",
				"noopener,noreferrer"
			);
		} else {
			navigate(historyId ? `/detail?id=${historyId}` : "/detail");
		}
	};

	return (
		<div className="mx-auto max-w-lg">
			{/* Type Header */}
			<div
				className={`relative px-5 pt-14 pb-8 text-white ${color.gradientClass}`}
			>
				<button
					className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
					onClick={() => navigate("/")}
					type="button"
				>
					<span className="material-symbols-outlined text-white text-xl">
						arrow_back
					</span>
				</button>
				<p className="mb-1 font-mono font-semibold text-xs uppercase tracking-widest opacity-80">
					YOUR DISC TYPE
				</p>
				<div className="flex items-end gap-4">
					<span className="font-extrabold text-8xl leading-none tracking-tight">
						{dominantType}
					</span>
					<div className="mb-2">
						<p className="font-bold text-2xl">{profile.name}</p>
						<p className="font-medium text-sm opacity-80">{profile.fullName}</p>
					</div>
				</div>
				<p className="mt-4 font-medium text-base opacity-90">
					{profile.tagline}
				</p>
			</div>

			<div className="px-5 pb-32">
				{/* Description */}
				<div className="mt-6 mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<p className="text-muted-foreground leading-relaxed">
						{profile.description}
					</p>
				</div>

				{/* Radar Chart */}
				<div className="mb-6 flex flex-col items-center rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 w-full font-bold text-base text-foreground">
						四维能力雷达图
					</h3>
					<RadarChart scores={scores} size={240} />
				</div>

				{/* Score Bars */}
				<div className="mb-6 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-4 font-bold text-base text-foreground">维度得分</h3>
					<div className="flex flex-col gap-4">
						{DISC_ORDER.map((type) => {
							const c = DISC_COLORS[type];
							const pct = scores[type];
							return (
								<div key={type}>
									<div className="mb-1.5 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span
												className="font-bold font-mono text-sm"
												style={{ color: c.hex }}
											>
												{type}
											</span>
											<span className="text-muted-foreground text-sm">
												{c.label}
											</span>
										</div>
										<span className="font-mono font-semibold text-foreground text-sm">
											{pct}%
										</span>
									</div>
									<div className="h-3 overflow-hidden rounded-full bg-secondary">
										<div
											className="h-full rounded-full transition-all duration-700 ease-out"
											style={{
												width: `${pct}%`,
												background: c.gradient,
											}}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Strengths & Growth Areas */}
				<div className="mb-6 grid grid-cols-2 gap-3">
					<div className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
						<h4 className="mb-3 flex items-center gap-1.5 font-semibold text-foreground">
							<span className="material-symbols-outlined text-emerald-500 text-lg">
								star
							</span>
							核心优势
						</h4>
						<ul className="flex flex-col gap-1.5">
							{profile.strengths.map((s) => (
								<li
									className="flex items-center gap-1.5 text-muted-foreground text-sm"
									key={s}
								>
									<span
										className="h-1.5 w-1.5 shrink-0 rounded-full"
										style={{ background: color.hex }}
									/>
									{s}
								</li>
							))}
						</ul>
					</div>
					<div className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
						<h4 className="mb-3 flex items-center gap-1.5 font-semibold text-foreground">
							<span className="material-symbols-outlined text-amber-500 text-lg">
								trending_up
							</span>
							成长空间
						</h4>
						<ul className="flex flex-col gap-1.5">
							{profile.growthAreas.map((g) => (
								<li
									className="flex items-center gap-1.5 text-muted-foreground text-sm"
									key={g}
								>
									<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
									{g}
								</li>
							))}
						</ul>
					</div>
				</div>

				{/* Career Suggestions */}
				<div className="mb-8 rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
					<h3 className="mb-3 font-bold text-base text-foreground">
						适合职业方向
					</h3>
					<div className="flex flex-wrap gap-2">
						{profile.careers.map((career) => (
							<span
								className="rounded-full px-3 py-1 font-mono font-semibold text-xs uppercase tracking-wide"
								key={career}
								style={{
									background: `${color.hex}18`,
									color: color.hex,
								}}
							>
								{career}
							</span>
						))}
					</div>
				</div>

				{/* CTA Buttons */}
				<div className="flex flex-col gap-3">
					<Link
						className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
						to={historyId ? `/detail?id=${historyId}` : "/detail"}
					>
						<span className="material-symbols-outlined text-xl">insights</span>
						查看详细解析
					</Link>
					<button
						className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-primary py-3.5 font-semibold text-primary transition-colors hover:bg-secondary"
						onClick={handleDownloadClick}
						type="button"
					>
						<span className="material-symbols-outlined text-xl">
							{isPaid ? "download" : "lock_open"}
						</span>
						{isPaid ? "下载 PDF 报告" : "付费解锁 PDF 报告"}
					</button>
					<button
						className="flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary py-3.5 font-semibold text-muted-foreground transition-colors hover:bg-accent"
						onClick={() => {
							reset();
							navigate("/quiz");
						}}
						type="button"
					>
						<span className="material-symbols-outlined text-xl">refresh</span>
						重新测试
					</button>
				</div>
			</div>
		</div>
	);
}
