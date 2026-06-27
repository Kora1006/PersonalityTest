import { COMPOSITE_PROFILES } from "@PersonalityTest/api/data/themes/index";
import { env } from "@PersonalityTest/env/web";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { RadarChart } from "@/components/radar-chart";
import { useQuiz } from "@/contexts/quiz-context";
import type { DiscType } from "@/data/disc-colors";
import { DISC_COLORS } from "@/data/disc-colors";
import { DISC_PROFILES } from "@/data/disc-profiles";
import { useWechatShare } from "@/hooks/use-wechat-share";
import { authClient } from "@/lib/auth-client";
import { getHistory } from "@/lib/history";
import { getCompositeType, getShareThumbnail } from "@/utils/disc";
import { trpc, trpcClient } from "@/utils/trpc";
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
	const [comparisonReady, setComparisonReady] = useState<{
		invitationId: string;
		myResultId: string;
	} | null>(null);

	const historyId = searchParams.get("id");

	let activeRecord: {
		dominantType: DiscType;
		scores: Record<DiscType, number>;
	} | null = null;

	if (searchParams.get("debug") === "balanced") {
		activeRecord = {
			dominantType: "D",
			scores: { D: 25, I: 25, S: 25, C: 25 },
		};
	} else if (historyId) {
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

	// Complete pending invitation after quiz + cloud sync
	useEffect(() => {
		const pendingId = sessionStorage.getItem("pendingInvitationId");
		if (!(pendingId && session && historyId) || historyId === null) {
			return;
		}
		sessionStorage.removeItem("pendingInvitationId");
		trpcClient.invitation.completeInvitation
			.mutate({
				invitationId: pendingId,
				inviteeId: session.user.id,
				inviteeResultId: historyId,
			})
			.then((result) => {
				if (!result.alreadyCompleted) {
					setComparisonReady({
						invitationId: pendingId,
						myResultId: historyId,
					});
				}
			})
			.catch(() => {
				// Silent — non-critical
			});
	}, [session, historyId]);

	const scores = activeRecord?.scores ?? { D: 0, I: 0, S: 0, C: 0 };
	const dominantType = activeRecord?.dominantType ?? "D";
	const isBalanced =
		searchParams.get("debug") === "balanced" ||
		(scores.D === scores.I && scores.I === scores.S && scores.S === scores.C);
	const compositeType = getCompositeType(scores);
	const compositeName =
		COMPOSITE_PROFILES[compositeType]?.name ?? DISC_PROFILES[dominantType].name;

	useWechatShare({
		title: `我的DISC类型是「${compositeName}」，测测你是哪种？`,
		desc: `D: ${scores.D}% · I: ${scores.I}% · S: ${scores.S}% · C: ${scores.C}% | DISC 职业性格测评`,
		imgUrl: getShareThumbnail(compositeType),
	});

	if (!activeRecord) {
		return null;
	}

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

	const renderAllRounder = () => {
		const theme = searchParams.get("theme") || "professional";
		if (theme === "leadership") {
			return (
				<div className="mx-auto min-h-screen max-w-lg bg-[#f9f9ff] pb-32">
					<header className="sticky top-0 z-50 flex h-16 w-full items-center border-gray-100 border-b bg-[#f9f9ff] px-5">
						<button
							className="mr-4 text-[#0058be] transition-opacity transition-transform hover:opacity-80 active:scale-95"
							onClick={() => navigate("/")}
							type="button"
						>
							<span className="material-symbols-outlined align-middle">
								arrow_back
							</span>
						</button>
						<h1 className="flex-1 font-semibold text-[#0058be] text-lg">
							测评结果
						</h1>
						<div className="font-extrabold font-mono text-2xl text-[#0058be] tracking-tighter opacity-10">
							DISC
						</div>
					</header>

					<main className="relative">
						<section className="relative flex aspect-[4/5] w-full flex-col items-center justify-center overflow-hidden pt-8">
							<div className="absolute inset-0 z-0">
								<img
									alt="Background Management Theme"
									className="h-full w-full object-cover"
									height={500}
									src="https://lh3.googleusercontent.com/aida/AP1WRLuQg-fz2ciPrUbnYB7e0R77FSFd04X0-ROEh7DDI5IXyQIIhLDEFgla9F9mDYTRhHVdmif0SSwTeySp2-YNtIjs7EO6MQdLNo3Jy_2I_ko2ZXGnd2bODcolpMaoBFlw_l0rK66ammZbAKwZcd7O7yP2JunmwIQ9yMTfV6KphfzPCw4G6m13h1FCoOywPsNcRQvvgQGgtoBPDrI3BtpGvf2pAh-wrh5ZgqMqecykN30dMjz0FzGMcNllwxI"
									width={400}
								/>
								<div className="absolute inset-0 bg-gradient-to-b from-slate-900/85 to-slate-950/95" />
							</div>
							<div className="relative z-10 flex flex-col items-center px-5 text-center">
								<div className="mb-4">
									<span
										className="material-symbols-outlined text-6xl text-blue-300"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										workspace_premium
									</span>
								</div>
								<h2 className="mb-2 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text font-extrabold text-3xl text-transparent tracking-tight">
									全能适配者
								</h2>
								<div className="mt-4 max-w-sm rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-md">
									<p className="text-blue-100 text-sm italic leading-relaxed">
										“您展现出极其罕见的‘矩阵式领航者’特质，四维极度均衡。这使您的领导风格不流于单一的强权或怀柔，能随情境弹性调配决策，是组织中全维战略舵手。”
									</p>
								</div>

								<div className="relative mt-8 flex h-48 w-48 items-center justify-center">
									<svg
										className="absolute inset-0 h-full w-full opacity-20"
										role="img"
										viewBox="0 0 100 100"
									>
										<title>Radar Background</title>
										<circle
											cx="50"
											cy="50"
											fill="none"
											r="40"
											stroke="white"
											strokeWidth="0.5"
										/>
										<circle
											cx="50"
											cy="50"
											fill="none"
											r="30"
											stroke="white"
											strokeWidth="0.5"
										/>
										<circle
											cx="50"
											cy="50"
											fill="none"
											r="20"
											stroke="white"
											strokeWidth="0.5"
										/>
										<line
											stroke="white"
											strokeWidth="0.5"
											x1="50"
											x2="50"
											y1="10"
											y2="90"
										/>
										<line
											stroke="white"
											strokeWidth="0.5"
											x1="10"
											x2="90"
											y1="50"
											y2="50"
										/>
									</svg>
									<svg
										className="absolute inset-0 h-full w-full"
										role="img"
										viewBox="0 0 100 100"
									>
										<title>Radar Area</title>
										<polygon
											fill="rgba(0, 88, 190, 0.4)"
											points="50,20 80,50 50,80 20,50"
											stroke="#0058be"
											strokeWidth="2"
										/>
										<circle cx="50" cy="20" fill="#0058be" r="3" />
										<circle cx="80" cy="50" fill="#0058be" r="3" />
										<circle cx="50" cy="80" fill="#0058be" r="3" />
										<circle cx="20" cy="50" fill="#0058be" r="3" />
									</svg>
									<span className="absolute top-0 font-mono text-[10px] text-white">
										支配 (D)
									</span>
									<span className="absolute right-0 font-mono text-[10px] text-white">
										影响 (I)
									</span>
									<span className="absolute bottom-0 font-mono text-[10px] text-white">
										稳健 (S)
									</span>
									<span className="absolute left-0 font-mono text-[10px] text-white">
										谨慎 (C)
									</span>
								</div>
							</div>
						</section>

						<div className="relative z-20 -mt-12 space-y-4 px-5">
							<section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
								<h3 className="mb-6 flex items-center gap-2 font-bold text-base text-slate-800">
									<span className="material-symbols-outlined text-blue-600">
										analytics
									</span>
									维度细分
								</h3>
								<div className="space-y-4">
									{[
										{
											label: "DOMINANCE (D)",
											val: 25,
											color: "bg-[#0058be]",
											text: "text-slate-500",
										},
										{
											label: "INFLUENCE (I)",
											val: 25,
											color: "bg-[#006c49]",
											text: "text-slate-500",
										},
										{
											label: "STEADINESS (S)",
											val: 25,
											color: "bg-[#765700]",
											text: "text-slate-500",
										},
										{
											label: "COMPLIANCE (C)",
											val: 25,
											color: "bg-[#727785]",
											text: "text-slate-500",
										},
									].map((item) => (
										<div key={item.label}>
											<div className="mb-1.5 flex items-center justify-between font-mono font-semibold text-xs">
												<span className={item.text}>{item.label}</span>
												<span className="font-bold text-[#0058be]">
													{item.val}%
												</span>
											</div>
											<div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
												<div
													className={`h-full ${item.color} rounded-full`}
													style={{ width: "25%" }}
												/>
											</div>
										</div>
									))}
								</div>
							</section>

							<section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
								<h3 className="mb-5 font-bold text-base text-slate-800">
									战略管理优势
								</h3>
								<div className="space-y-4">
									<div className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0058be]/10">
											<span className="material-symbols-outlined text-[#0058be]">
												diversity_3
											</span>
										</div>
										<div>
											<h4 className="mb-0.5 font-bold text-slate-800 text-sm">
												跨角色组织包容度
											</h4>
											<p className="text-slate-500 text-xs leading-normal">
												能够精准识别并包容各种极端性格的下属，给予针对性的指导和资源匹配，激发不同特质成员的最大潜力，构建高弹性、无短板的组织架构。
											</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#006c49]/10">
											<span className="material-symbols-outlined text-[#006c49]">
												dynamic_form
											</span>
										</div>
										<div>
											<h4 className="mb-0.5 font-bold text-slate-800 text-sm">
												全情境自适应领导
											</h4>
											<p className="text-slate-500 text-xs leading-normal">
												在危机时刻展现雷厉风行的决断力（D），在动员时刻激发无可抵挡的感召力（I），在稳健期展现包容共情的凝聚力（S），在合规期坚守严谨规范的自律力（C）。
											</p>
										</div>
									</div>
									<div className="flex gap-4">
										<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#765700]/10">
											<span className="material-symbols-outlined text-[#765700]">
												psychology_alt
											</span>
										</div>
										<div>
											<h4 className="mb-0.5 font-bold text-slate-800 text-sm">
												全方位风险与增长模型
											</h4>
											<p className="text-slate-500 text-xs leading-normal">
												在推动战略扩张时，既有对市场效率与结果的极致追求（D），亦有严密的数据分析与安全边界防范（C），最大程度避免盲目决策与盲区风险。
											</p>
										</div>
									</div>
								</div>
							</section>

							<div className="flex flex-col gap-3 pt-4">
								<button
									className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0058be] py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
									onClick={handleDownloadClick}
									type="button"
								>
									<span className="material-symbols-outlined text-xl">
										download
									</span>
									下载完整专家级管理报告
								</button>
								<button
									className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3.5 font-semibold text-slate-600 transition-colors hover:bg-slate-200"
									onClick={() => {
										reset();
										navigate("/quiz");
									}}
									type="button"
								>
									<span className="material-symbols-outlined text-xl">
										refresh
									</span>
									重新测试
								</button>
							</div>
							<p className="mt-4 px-5 text-center text-slate-400 text-xs">
								此测评结果基于行为倾向分析，仅供职业发展参考。
							</p>
						</div>
					</main>
				</div>
			);
		}

		if (theme === "relationship") {
			return (
				<div className="relative mx-auto min-h-screen max-w-lg pb-32">
					<div
						className="fixed inset-0 -z-10 bg-center bg-cover opacity-60"
						style={{
							backgroundImage:
								"url('https://lh3.googleusercontent.com/aida/AP1WRLsRHEOPGDfOS8bb6ARFmjmqHLdl00EYj0CTQZlnkMOA93Q3qkbfHch6xPMnn7XgpXfGUi-Bfr8ObkfqepjJiWpeiMIwWYpamXM1ylaBqY-fc5tM-TbxFAhGHyMtaWfYpxx-64hwd4WS_Ld4T0z3JD-Sj45lDMphRSeS68i16tA0PHTR_zxOt3B6ze5M_H6Nw6DU9REH-2n0bfLGlytonK8_-b453bK83JFmT7CUBHyd7znPD4ZGgqCSFBun')",
						}}
					/>
					<header className="sticky top-0 z-50 flex h-16 w-full items-center border-gray-100/50 border-b bg-[#f9f9ff]/80 px-5 backdrop-blur-md">
						<button
							className="mr-4 text-[#0058be] transition-opacity transition-transform hover:opacity-80 active:scale-95"
							onClick={() => navigate("/")}
							type="button"
						>
							<span className="material-symbols-outlined align-middle">
								arrow_back
							</span>
						</button>
						<h1 className="font-semibold text-[#0058be] text-lg">
							DISC Assessment
						</h1>
					</header>

					<main className="px-5 pt-8">
						<div className="mb-8 text-center">
							<div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#0058be] text-white shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
								<span
									className="material-symbols-outlined text-4xl"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									star
								</span>
							</div>
							<h2 className="mb-1 font-extrabold text-3xl text-[#0058be]">
								全能适配者
							</h2>
							<p className="font-mono font-semibold text-[#765700] text-xs uppercase tracking-widest">
								四维平衡者
							</p>
						</div>

						<section className="mb-6 rounded-2xl border border-white/40 bg-white/70 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
							<div className="flex gap-3">
								<span className="mt-0.5 text-xl">💡</span>
								<p className="text-slate-700 text-sm leading-relaxed">
									您是独特的
									<span className="font-bold text-[#0058be]">
										“全维和谐守护者”
									</span>
									！四维平衡让您拥有一颗极其敏感且包容的“情感共振心”。您既能理解强者背后的脆弱，也能包容弱者展现的倾诉。您从不强加意志，而是润物无声地提供情感支持与理性引导，是身边人最信赖的安全避风港。
								</p>
							</div>
						</section>

						<section className="mb-6 flex flex-col items-center rounded-2xl border border-white/40 bg-white/70 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
							<h3 className="mb-4 self-start font-bold text-base text-slate-800">
								维度分布
							</h3>
							<div className="relative mx-auto flex aspect-square w-full max-w-[280px] items-center justify-center">
								<svg className="h-full w-full" role="img" viewBox="0 0 200 200">
									<title>Radar Chart</title>
									<circle
										cx="100"
										cy="100"
										fill="none"
										r="80"
										stroke="#e2e8f8"
										strokeWidth="1"
									/>
									<circle
										cx="100"
										cy="100"
										fill="none"
										r="60"
										stroke="#e2e8f8"
										strokeWidth="1"
									/>
									<circle
										cx="100"
										cy="100"
										fill="none"
										r="40"
										stroke="#e2e8f8"
										strokeWidth="1"
									/>
									<circle
										cx="100"
										cy="100"
										fill="none"
										r="20"
										stroke="#e2e8f8"
										strokeWidth="1"
									/>
									<line
										stroke="#e2e8f8"
										strokeWidth="1"
										x1="100"
										x2="100"
										y1="20"
										y2="180"
									/>
									<line
										stroke="#e2e8f8"
										strokeWidth="1"
										x1="20"
										x2="180"
										y1="100"
										y2="100"
									/>
									<polygon
										fill="rgba(0, 88, 190, 0.1)"
										points="100,40 160,100 100,160 40,100"
										stroke="#0058be"
										strokeWidth="2"
									/>
									<circle cx="100" cy="40" fill="#0058be" r="3" />
									<circle cx="160" cy="100" fill="#0058be" r="3" />
									<circle cx="100" cy="160" fill="#0058be" r="3" />
									<circle cx="40" cy="100" fill="#0058be" r="3" />
								</svg>
								<div className="absolute top-0 left-1/2 -translate-x-1/2 font-mono font-semibold text-[10px] text-slate-500">
									D 掌控
								</div>
								<div className="absolute top-1/2 right-0 -translate-y-1/2 font-mono font-semibold text-[10px] text-slate-500">
									I 影响
								</div>
								<div className="absolute bottom-0 left-1/2 -translate-x-1/2 font-mono font-semibold text-[10px] text-slate-500">
									S 稳健
								</div>
								<div className="absolute top-1/2 left-0 -translate-y-1/2 font-mono font-semibold text-[10px] text-slate-500">
									C 服从
								</div>
							</div>
						</section>

						<div className="mb-6 grid grid-cols-1 gap-3">
							{[
								{
									label: "支配型",
									type: "D",
									val: 25,
									color: "bg-[#EF4444]",
									bg: "bg-[#EF4444]",
								},
								{
									label: "影响型",
									type: "I",
									val: 25,
									color: "bg-[#F59E0B]",
									bg: "bg-[#F59E0B]",
								},
								{
									label: "稳健型",
									type: "S",
									val: 25,
									color: "bg-[#10B981]",
									bg: "bg-[#10B981]",
								},
								{
									label: "谨慎型",
									type: "C",
									val: 25,
									color: "bg-[#3B82F6]",
									bg: "bg-[#3B82F6]",
								},
							].map((item) => (
								<div
									className="flex items-center gap-3 rounded-xl border border-white/40 bg-white/70 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md"
									key={item.type}
								>
									<div
										className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white ${item.bg}`}
									>
										{item.type}
									</div>
									<div className="min-w-0 flex-1">
										<div className="mb-1 flex items-center justify-between font-mono font-semibold text-xs">
											<span>{item.label}</span>
											<span>{item.val}%</span>
										</div>
										<div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
											<div
												className={`h-full ${item.color} rounded-full`}
												style={{ width: "25%" }}
											/>
										</div>
									</div>
								</div>
							))}
						</div>

						<section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
							<h3 className="mb-5 font-bold text-base text-slate-800">
								人际和谐力量
							</h3>
							<div className="space-y-4">
								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
										<span className="material-symbols-outlined text-red-500">
											favorite
										</span>
									</div>
									<div>
										<h4 className="mb-0.5 font-bold text-slate-800 text-sm">
											多频情感共鸣
										</h4>
										<p className="text-slate-500 text-xs leading-normal">
											具备高维度的倾听和同理心，能够瞬间换位思考，感知对方在不同情绪状态下的真实诉求，给予最温暖的慰藉与支持。
										</p>
									</div>
								</div>
								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
										<span className="material-symbols-outlined text-amber-500">
											forum
										</span>
									</div>
									<div>
										<h4 className="mb-0.5 font-bold text-slate-800 text-sm">
											双向关系润滑剂
										</h4>
										<p className="text-slate-500 text-xs leading-normal">
											在关系摩擦时，既能以温和态度稳定局面，又能用理性解构矛盾，促进双方坦诚沟通，是化解误会与冷战的天然催化剂。
										</p>
									</div>
								</div>
								<div className="flex gap-4">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
										<span className="material-symbols-outlined text-emerald-500">
											groups
										</span>
									</div>
									<div>
										<h4 className="mb-0.5 font-bold text-slate-800 text-sm">
											多维支柱型伴侣
										</h4>
										<p className="text-slate-500 text-xs leading-normal">
											在伴侣面临挑战时提供行动支持，在需要快乐时制造温暖浪漫，在低谷期坚守陪伴，在关键决策时提供理智分析。
										</p>
									</div>
								</div>
							</div>
						</section>

						<div className="flex flex-col gap-3">
							<button
								className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0058be] py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
								onClick={handleDownloadClick}
								type="button"
							>
								<span className="material-symbols-outlined text-xl">share</span>
								保存全能者勋章
							</button>
							<button
								className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100/80 py-3.5 font-semibold text-slate-600 transition-colors hover:bg-slate-200"
								onClick={() => {
									reset();
									navigate("/quiz");
								}}
								type="button"
							>
								<span className="material-symbols-outlined text-xl">
									refresh
								</span>
								重新测试
							</button>
						</div>

						<p className="mt-8 px-6 text-center font-medium text-slate-500 text-xs italic opacity-70">
							“真正的智慧不在于拥有一种性格，而在于能够驾驭所有性格。”
						</p>
					</main>
				</div>
			);
		}

		// Fallback to professional theme
		return (
			<div className="mx-auto min-h-screen max-w-lg bg-[#f9f9ff] pb-32">
				<header className="sticky top-0 z-50 flex h-16 w-full items-center border-gray-100/50 border-b bg-[#f9f9ff]/80 px-5 backdrop-blur-md">
					<button
						className="mr-4 text-[#0058be] transition-opacity transition-transform hover:opacity-80 active:scale-95"
						onClick={() => navigate("/")}
						type="button"
					>
						<span className="material-symbols-outlined align-middle">
							arrow_back
						</span>
					</button>
					<h1 className="font-semibold text-[#0058be] text-lg">
						DISC Assessment
					</h1>
				</header>

				<main>
					<section className="relative flex h-80 w-full items-center justify-center overflow-hidden">
						<div
							className="absolute inset-0 bg-center bg-cover"
							style={{
								backgroundImage:
									"url('https://lh3.googleusercontent.com/aida/AP1WRLs6X_FAqmO3J5bNCT1ad2SfBNiLjircAN7i2GdqarFKL5VJD7RX3KyyJq77iFz6NR_GyX1htiYK5s9KoWpVWd9R9P67qt-71Wy--w5AZE2gb8F31oTmu7aDyLlkdqhpHv8u5eucK7krZVfxvWz1UoSd-DllEr0n-R7Oe8mVsAEu9ep7T8wKkAdMnN5ORcSVE6jFUGgjoH9pDOp-GIv-IJ9szMC39943DE_EIVAACN8FX3k5lLe_89v-6Kc0')",
							}}
						>
							<div className="absolute inset-0 bg-blue-900/30 backdrop-blur-[2px]" />
						</div>
						<div className="relative z-10 px-5 text-center">
							<div className="inline-flex max-w-md flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-md">
								<span className="mb-3 text-3xl">💡</span>
								<h2 className="mb-1.5 font-bold text-blue-700 text-xl leading-snug">
									您是极其罕见的‘全能适配者’！
								</h2>
								<p className="text-gray-500 text-xs leading-relaxed">
									您的 DISC
									四维度非常均衡。这赋予了您跨越职能壁垒的超强自适应弹性，能如水般融入团队角色，是组织中的六边形全能战力。
								</p>
							</div>
						</div>
					</section>

					<div className="relative z-20 -mt-10 space-y-5 px-5">
						<div className="flex flex-col items-center rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
							<h3 className="mb-4 self-start font-mono font-semibold text-gray-400 text-xs tracking-wider">
								DIMENSIONAL BALANCE
							</h3>
							<div className="relative mx-auto aspect-square w-full max-w-[240px]">
								<svg className="h-full w-full" role="img" viewBox="0 0 100 100">
									<title>Concentric Polygon Radar Chart</title>
									<polygon
										className="fill-none stroke-[#E5E7EB]"
										points="50,10 90,50 50,90 10,50"
										strokeWidth="0.5"
									/>
									<polygon
										className="fill-none stroke-[#E5E7EB]"
										points="50,25 75,50 50,75 25,50"
										strokeWidth="0.5"
									/>
									<line
										stroke="#E5E7EB"
										strokeWidth="0.5"
										x1="50"
										x2="50"
										y1="10"
										y2="90"
									/>
									<line
										stroke="#E5E7EB"
										strokeWidth="0.5"
										x1="10"
										x2="90"
										y1="50"
										y2="50"
									/>
									<polygon
										fill="rgba(59, 130, 246, 0.1)"
										points="50,25 75,50 50,75 25,50"
										stroke="#3B82F6"
										strokeWidth="1.5"
									/>
									<text
										fill="#0058be"
										fontFamily="monospace"
										fontSize="5"
										fontWeight="bold"
										textAnchor="middle"
										x="50"
										y="6"
									>
										支配 (D)
									</text>
									<text
										fill="#006c49"
										fontFamily="monospace"
										fontSize="5"
										fontWeight="bold"
										textAnchor="start"
										x="80"
										y="52"
									>
										影响 (I)
									</text>
									<text
										fill="#765700"
										fontFamily="monospace"
										fontSize="5"
										fontWeight="bold"
										textAnchor="middle"
										x="50"
										y="96"
									>
										稳健 (S)
									</text>
									<text
										fill="#727785"
										fontFamily="monospace"
										fontSize="5"
										fontWeight="bold"
										textAnchor="end"
										x="20"
										y="52"
									>
										谨慎 (C)
									</text>
								</svg>
							</div>
						</div>

						<div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
							<h3 className="mb-4 font-mono font-semibold text-gray-400 text-xs tracking-wider">
								维度细分数据
							</h3>
							<div className="space-y-4">
								{[
									{
										label: "支配型 (D)",
										val: 25,
										color: "bg-[#0058be]",
										text: "text-slate-500",
									},
									{
										label: "影响型 (I)",
										val: 25,
										color: "bg-[#006c49]",
										text: "text-slate-500",
									},
									{
										label: "稳健型 (S)",
										val: 25,
										color: "bg-[#765700]",
										text: "text-slate-500",
									},
									{
										label: "谨慎型 (C)",
										val: 25,
										color: "bg-[#727785]",
										text: "text-slate-500",
									},
								].map((item) => (
									<div key={item.label}>
										<div className="mb-1 flex items-center justify-between font-mono font-semibold text-xs">
											<span className={item.text}>{item.label}</span>
											<span className="font-bold text-[#0058be]">
												{item.val}%
											</span>
										</div>
										<div className="h-4 w-full overflow-hidden rounded-full bg-slate-100">
											<div
												className={`h-full ${item.color} rounded-full`}
												style={{ width: "25%" }}
											/>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="rounded-2xl bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
							<h3 className="mb-4 font-bold text-base text-gray-800">
								职场核心优势
							</h3>
							<div className="grid grid-cols-1 gap-4">
								<div className="flex gap-3 rounded-xl border border-[#0058be]/10 bg-[#0058be]/5 p-4">
									<span className="material-symbols-outlined shrink-0 text-[#0058be]">
										hub
									</span>
									<div>
										<h4 className="mb-1 font-bold text-gray-800 text-sm">
											全景式跨界枢纽
										</h4>
										<p className="text-gray-500 text-xs leading-normal">
											无缝连接研发、创意、销售及行政等不同背景的团队，用他们熟悉的语言化解沟通壁垒，是组织中最强的跨职能协调桥梁。
										</p>
									</div>
								</div>
								<div className="flex gap-3 rounded-xl border border-[#006c49]/10 bg-[#006c49]/5 p-4">
									<span className="material-symbols-outlined shrink-0 text-[#006c49]">
										sync_alt
									</span>
									<div>
										<h4 className="mb-1 font-bold text-gray-800 text-sm">
											高自适应情境弹性
										</h4>
										<p className="text-gray-500 text-xs leading-normal">
											不拘泥于特定角色，能根据阶段性业务痛点，在“决策引领者”与“坚实执行者”之间自如切换，完美契合复杂多变的业务周期。
										</p>
									</div>
								</div>
								<div className="flex gap-3 rounded-xl border border-[#765700]/10 bg-[#765700]/5 p-4">
									<span className="material-symbols-outlined shrink-0 text-[#765700]">
										balance
									</span>
									<div>
										<h4 className="mb-1 font-bold text-gray-800 text-sm">
											中立解题与冲突中和
										</h4>
										<p className="text-gray-500 text-xs leading-normal">
											不偏执于单一立场，能在团队利益冲突中快速抽离，融合多方诉求，以高度客观的系统化视角推导最优的平衡解决方案。
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-3">
							<button
								className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0058be] py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
								onClick={handleDownloadClick}
								type="button"
							>
								<span className="material-symbols-outlined text-xl">
									download
								</span>
								下载深度职业报告
							</button>
							<button
								className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3.5 font-semibold text-slate-600 transition-colors hover:bg-slate-200"
								onClick={() => {
									reset();
									navigate("/quiz");
								}}
								type="button"
							>
								<span className="material-symbols-outlined text-xl">
									refresh
								</span>
								重新测试
							</button>
						</div>
					</div>
				</main>
			</div>
		);
	};

	if (isBalanced) {
		return renderAllRounder();
	}

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
				{isBalanced && (
					<div className="mt-6 flex gap-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-[0_4px_20px_rgba(0,88,190,0.05)]">
						<span className="material-symbols-outlined text-3xl text-primary">
							tips_and_updates
						</span>
						<div className="flex-1">
							<h4 className="mb-1 font-bold text-primary text-sm">
								🎉 均衡型性格彩蛋
							</h4>
							<p className="text-muted-foreground text-xs leading-relaxed">
								您的 DISC
								四维度非常均衡，在不同场景下能自由切换角色，具备极强的自适应弹性。
							</p>
						</div>
					</div>
				)}

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
					{comparisonReady && (
						<button
							className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(16,185,129,0.2)] transition-opacity hover:opacity-90"
							onClick={() =>
								navigate(
									`/comparison?myId=${comparisonReady.myResultId}&friendId=${comparisonReady.invitationId}`
								)
							}
							type="button"
						>
							<span className="material-symbols-outlined text-xl">people</span>
							查看与好友的配对分析
						</button>
					)}
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
