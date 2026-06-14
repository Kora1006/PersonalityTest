import { Link } from "react-router";

import { DISC_COLORS } from "@/data/disc-colors";
import type { Route } from "./+types/_index";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "DISC 职场人格测评" },
		{ name: "description", content: "发现你的职场人格密码，解锁职业潜能" },
	];
}

const DISC_CARDS = [
	{
		type: "D" as const,
		desc: "目标明确、行动果断，善于在压力下快速推动结果落地。",
	},
	{
		type: "I" as const,
		desc: "热情开朗、感染力强，擅长激励团队并建立广泛的人际网络。",
	},
	{
		type: "S" as const,
		desc: "耐心稳健、值得信赖，是团队中凝聚人心的可靠支柱。",
	},
	{
		type: "C" as const,
		desc: "逻辑严谨、注重细节，善于分析复杂问题并给出精准解答。",
	},
];

const BENEFITS = [
	{
		icon: "psychology",
		title: "深度自我认知",
		desc: "科学测评揭示你的行为模式与决策风格",
	},
	{
		icon: "work",
		title: "职业发展指引",
		desc: "基于人格特质，找到最适合你的职业路径",
	},
	{
		icon: "groups",
		title: "团队协作优化",
		desc: "了解团队成员风格，提升沟通与协作效率",
	},
];

const STATS = [
	{ value: "1.5万+", unit: "", label: "已分析画像" },
	{ value: "98%", unit: "", label: "准确度评分" },
	{ value: "10", unit: "分钟", label: "平均测试时长" },
];

export default function Home() {
	return (
		<div className="mx-auto max-w-lg px-5">
			{/* Hero Section */}
			<section className="pt-10 pb-8">
				<p className="mb-3 font-mono font-semibold text-primary text-xs uppercase tracking-widest">
					PERSONAL GROWTH ENGINE
				</p>
				<h1 className="mb-4 font-extrabold text-3xl text-foreground leading-tight -tracking-wide">
					发现你的
					<br />
					职场人格密码
				</h1>
				<p className="mb-8 text-base text-muted-foreground leading-relaxed">
					基于 DISC
					模型的科学测评，帮助你深度了解自己的行为风格，解锁职业发展潜能。
				</p>
				<div className="flex flex-col gap-3">
					<Link
						className="flex w-full items-center justify-center rounded-2xl bg-primary py-3.5 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
						to="/quiz"
					>
						<span className="material-symbols-outlined mr-2 text-xl">
							play_arrow
						</span>
						开始测试
					</Link>
					<Link
						className="flex w-full items-center justify-center rounded-2xl border border-border bg-white py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
						to="/history"
					>
						查看历史记录
					</Link>
				</div>
			</section>

			{/* DISC Dimension Cards */}
			<section className="pb-8">
				<h2 className="mb-4 font-bold text-foreground text-lg">
					DISC 四维人格
				</h2>
				<div className="flex flex-col gap-3">
					{DISC_CARDS.map(({ type, desc }) => {
						const color = DISC_COLORS[type];
						return (
							<div
								className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
								key={type}
							>
								<div
									className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${color.gradientClass}`}
								>
									<span className="material-symbols-outlined text-xl">
										{color.icon}
									</span>
								</div>
								<div className="min-w-0">
									<div className="mb-0.5 flex items-center gap-2">
										<span className="font-bold text-foreground">
											{color.label}
										</span>
										<span className="font-mono font-semibold text-muted-foreground text-xs uppercase tracking-widest">
											({type})
										</span>
									</div>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{desc}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</section>

			{/* Stats Section */}
			<section className="mb-8 rounded-2xl bg-primary px-6 py-6">
				<div className="flex justify-around">
					{STATS.map(({ value, unit, label }) => (
						<div className="text-center" key={label}>
							<div className="font-extrabold text-3xl text-white">
								{value}
								<span className="font-semibold text-lg">{unit}</span>
							</div>
							<div className="mt-1 font-mono font-semibold text-white/70 text-xs uppercase tracking-widest">
								{label}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Benefits Section */}
			<section className="pb-24">
				<h2 className="mb-4 font-bold text-foreground text-lg">
					测评能帮你什么
				</h2>
				<div className="flex flex-col gap-3">
					{BENEFITS.map(({ icon, title, desc }) => (
						<div
							className="flex items-start gap-4 rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
							key={title}
						>
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
								<span className="material-symbols-outlined text-primary text-xl">
									{icon}
								</span>
							</div>
							<div>
								<p className="mb-0.5 font-semibold text-foreground">{title}</p>
								<p className="text-muted-foreground text-sm leading-relaxed">
									{desc}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Global Floating Action Button (FAB) */}
			<div className="pointer-events-none fixed bottom-24 left-1/2 z-40 flex w-full max-w-lg -translate-x-1/2 justify-end px-5">
				<Link
					className="group pointer-events-auto relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-[0_8px_24px_rgba(0,88,190,0.3)] transition-transform hover:scale-105 active:scale-95"
					title="立即开始测评"
					to="/quiz"
				>
					<span className="material-symbols-outlined text-2xl">play_arrow</span>
					<span className="absolute top-1/2 right-16 -translate-y-1/2 scale-0 whitespace-nowrap rounded bg-foreground px-2 py-1 text-background text-xs shadow transition-all duration-150 group-hover:scale-100">
						立即开始测评
					</span>
				</Link>
			</div>
		</div>
	);
}
