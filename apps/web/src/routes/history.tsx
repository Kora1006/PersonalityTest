import { useState } from "react";
import { useNavigate } from "react-router";
import type { DiscType } from "@/data/disc-colors";
import { DISC_COLORS } from "@/data/disc-colors";
import { useHistory } from "@/hooks/use-history";
import type { HistoryRecord } from "@/lib/history";
import type { Route } from "./+types/history";

export function meta(_: Route.MetaArgs) {
	return [{ title: "测评历史" }];
}

const DISC_ORDER = ["D", "I", "S", "C"] as const;

function HistoryCard({
	record,
	onDelete,
	onView,
}: {
	record: HistoryRecord;
	onDelete: (id: string) => void;
	onView: (id: string) => void;
}) {
	const color = DISC_COLORS[record.dominantType];
	const dominantScore = record.scores[record.dominantType];

	return (
		<div className="rounded-2xl bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
			<div className="mb-3 flex items-start justify-between gap-2">
				<div className="flex items-center gap-3">
					<div
						className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-extrabold text-lg text-white ${color.gradientClass}`}
					>
						{record.dominantType}
					</div>
					<div>
						<p className="font-semibold text-foreground">{color.label}</p>
						<p className="text-muted-foreground text-xs">{record.date}</p>
					</div>
				</div>
				<div className="flex items-center gap-1.5">
					<span
						className="rounded-full px-2 py-0.5 font-mono font-semibold text-xs uppercase"
						style={{ background: `${color.hex}18`, color: color.hex }}
					>
						{dominantScore}%
					</span>
				</div>
			</div>

			{/* Score bars */}
			<div className="mb-3 flex flex-col gap-1.5">
				{DISC_ORDER.map((type) => {
					const c = DISC_COLORS[type as DiscType];
					const pct = record.scores[type as DiscType];
					return (
						<div className="flex items-center gap-2" key={type}>
							<span
								className="w-4 shrink-0 font-bold font-mono text-xs"
								style={{ color: c.hex }}
							>
								{type}
							</span>
							<div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
								<div
									className="h-full rounded-full"
									style={{ width: `${pct}%`, background: c.gradient }}
								/>
							</div>
							<span className="w-8 text-right font-mono text-muted-foreground text-xs">
								{pct}%
							</span>
						</div>
					);
				})}
			</div>

			{record.note && (
				<p className="mb-3 text-muted-foreground text-xs">{record.note}</p>
			)}

			<div className="flex gap-2">
				<button
					className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 font-semibold text-sm text-white transition-opacity hover:opacity-90"
					onClick={() => onView(record.id)}
					type="button"
				>
					<span className="material-symbols-outlined text-base">bar_chart</span>
					查看结果
				</button>
				<button
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
					onClick={() => onDelete(record.id)}
					type="button"
				>
					<span className="material-symbols-outlined text-base">delete</span>
				</button>
			</div>
		</div>
	);
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
	const navigate = useNavigate();
	return (
		<div className="flex flex-col items-center px-8 py-16 text-center">
			<span className="material-symbols-outlined mb-4 text-6xl text-muted-foreground/40">
				{hasSearch ? "search_off" : "history"}
			</span>
			<p className="mb-2 font-semibold text-foreground">
				{hasSearch ? "未找到匹配记录" : "暂无测评记录"}
			</p>
			<p className="mb-6 text-muted-foreground text-sm">
				{hasSearch
					? "试试搜索其他关键词"
					: "完成一次 DISC 测评，记录将自动保存在这里"}
			</p>
			{!hasSearch && (
				<button
					className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] transition-opacity hover:opacity-90"
					onClick={() => navigate("/quiz")}
					type="button"
				>
					<span className="material-symbols-outlined text-xl">play_arrow</span>
					开始测试
				</button>
			)}
		</div>
	);
}

export default function History() {
	const navigate = useNavigate();
	const { filteredRecords, searchQuery, setSearchQuery, removeRecord } =
		useHistory();
	const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

	const handleDeleteConfirm = () => {
		if (deleteTargetId) {
			removeRecord(deleteTargetId);
			setDeleteTargetId(null);
		}
	};

	const handleView = (id: string) => {
		navigate(`/result?id=${id}`);
	};

	return (
		<div className="mx-auto max-w-lg px-5">
			{/* Header */}
			<div className="pt-12 pb-4">
				<h1 className="mb-5 font-bold text-2xl text-foreground">测评历史</h1>

				{/* Search Bar */}
				<div className="relative">
					<span className="material-symbols-outlined absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground text-xl">
						search
					</span>
					<input
						className="h-11 w-full rounded-2xl border border-border bg-white pr-10 pl-10 text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="搜索测试结果..."
						type="text"
						value={searchQuery}
					/>
					{searchQuery && (
						<button
							className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							onClick={() => setSearchQuery("")}
							type="button"
						>
							<span className="material-symbols-outlined text-xl">close</span>
						</button>
					)}
				</div>
			</div>

			{/* List */}
			{filteredRecords.length > 0 ? (
				<div className="flex flex-col gap-3 pb-6">
					{filteredRecords.map((record) => (
						<HistoryCard
							key={record.id}
							onDelete={(id) => setDeleteTargetId(id)}
							onView={handleView}
							record={record}
						/>
					))}
					<p className="py-4 text-center font-mono text-muted-foreground text-xs">
						已经加载全部记录
					</p>
				</div>
			) : (
				<EmptyState hasSearch={!!searchQuery} />
			)}

			{/* Delete Confirm Modal */}
			{deleteTargetId && (
				<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
					<div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
						<h3 className="mb-2 font-bold text-foreground text-lg">确认删除</h3>
						<p className="mb-6 text-muted-foreground text-sm">
							删除后无法恢复这条测评记录，确定继续吗？
						</p>
						<div className="flex gap-3">
							<button
								className="flex-1 rounded-2xl border border-border py-3 font-semibold text-foreground transition-colors hover:bg-secondary"
								onClick={() => setDeleteTargetId(null)}
								type="button"
							>
								取消
							</button>
							<button
								className="flex-1 rounded-2xl bg-red-500 py-3 font-semibold text-white transition-opacity hover:opacity-90"
								onClick={handleDeleteConfirm}
								type="button"
							>
								删除
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
