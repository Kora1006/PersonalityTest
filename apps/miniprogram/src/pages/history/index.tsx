import { themes } from "@PersonalityTest/api/data/themes/index";
import { Input, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useDidShow, useLoad } from "@tarojs/taro";
import { useCallback, useState } from "react";
import { Icon } from "../../components/icon";
import { DISC_COLORS } from "../../data/disc-colors";
import type { ThemeId } from "../../utils/quiz-store";
import { quizStore } from "../../utils/quiz-store";
import type { HistoryRecord } from "../../utils/storage";
import { storage } from "../../utils/storage";
import "./index.scss";

const TYPE_COLORS: Record<string, string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

export default function History() {
	const [records, setRecords] = useState<HistoryRecord[]>([]);
	const [search, setSearch] = useState("");

	const loadRecords = useCallback(() => {
		setRecords(storage.getHistory());
	}, []);

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: "历史记录" });
		loadRecords();
	});

	useDidShow(() => {
		loadRecords();
	});

	const filtered = records.filter((r: HistoryRecord) => {
		if (!r.dominantType) {
			return false;
		}
		if (!search) {
			return true;
		}
		const q = search.toLowerCase();
		const color = DISC_COLORS[r.dominantType];
		if (!color) {
			return false;
		}
		return (
			r.dominantType.toLowerCase().includes(q) ||
			color.label.includes(q) ||
			(r.date && r.date.includes(q)) ||
			(r.note && r.note.toLowerCase().includes(q))
		);
	});

	const handleView = (record: HistoryRecord) => {
		quizStore.setLastResult({
			...record,
			theme: (record.theme as ThemeId) ?? "professional",
		});
		Taro.navigateTo({ url: `/pages/result/index?historyId=${record.id}` });
	};

	const handleDelete = (id: string) => {
		Taro.showModal({
			title: "确认删除",
			content: "删除后无法恢复，确定要删除这条记录吗？",
			success: (res) => {
				if (res.confirm) {
					storage.deleteHistoryRecord(id);
					setRecords((prev: HistoryRecord[]) =>
						prev.filter((r: HistoryRecord) => r.id !== id)
					);
				}
			},
		});
	};

	return (
		<View className="history-page">
			{/* Search */}
			<View className="search-bar">
				<Icon
					color="#727785"
					name="search"
					size={28}
					style={{ marginRight: "8rpx" }}
				/>
				<Input
					className="search-input"
					onInput={(e: any) => setSearch(e.detail.value)}
					placeholder="搜索类型、日期..."
					placeholderClass="search-placeholder"
					value={search}
				/>
				{search ? (
					<Text className="search-clear" onClick={() => setSearch("")}>
						✕
					</Text>
				) : null}
			</View>

			<ScrollView className="records-list" scrollY>
				{filtered.length === 0 ? (
					<View className="empty-state">
						<Icon
							color="#c2c6d6"
							name="history"
							size={96}
							style={{ marginBottom: "24rpx" }}
						/>
						<Text className="empty-title">
							{search ? "没有匹配的记录" : "还没有测评记录"}
						</Text>
						<Text className="empty-desc">
							{search ? "换个关键词试试" : "完成一次测评，结果将自动保存在这里"}
						</Text>
						{!search && (
							<View
								className="start-btn"
								onClick={() => {
									quizStore.reset();
									Taro.navigateTo({ url: "/pages/quiz/index" });
								}}
							>
								<Text className="start-btn-text">开始测评</Text>
							</View>
						)}
					</View>
				) : (
					filtered.map((record: HistoryRecord) => {
						const color = record.dominantType
							? DISC_COLORS[record.dominantType]
							: null;
						const typeColor = record.dominantType
							? TYPE_COLORS[record.dominantType]
							: "#0058be";
						return (
							<View className="record-card" key={record.id}>
								<View className="record-header">
									<View
										className="type-badge"
										style={{ backgroundColor: `${typeColor}15` }}
									>
										<Text className="type-letter" style={{ color: typeColor }}>
											{record.dominantType}
										</Text>
									</View>
									<View className="record-meta">
										<Text className="record-type-name">
											{color
												? `${color.label} (${record.dominantType})`
												: "未知类型"}
										</Text>
										<Text className="record-date">{record.date}</Text>
									</View>
									<View
										className="delete-btn"
										onClick={() => handleDelete(record.id)}
									>
										<Icon color="#ba1a1a" name="trash" size={32} />
									</View>
								</View>
								{record.theme && themes[record.theme as ThemeId] && (
									<View
										className="theme-tag"
										style={{
											backgroundColor: `${themes[record.theme as ThemeId].cardTheme.primaryColor}15`,
											borderColor: `${themes[record.theme as ThemeId].cardTheme.primaryColor}30`,
										}}
									>
										<Text
											className="theme-tag-text"
											style={{
												color:
													themes[record.theme as ThemeId].cardTheme
														.primaryColor,
											}}
										>
											{themes[record.theme as ThemeId].name}
										</Text>
									</View>
								)}

								{/* Mini score bars */}
								<View className="mini-scores">
									{(["D", "I", "S", "C"] as const).map((t) => (
										<View className="mini-bar-row" key={t}>
											<Text
												className="mini-label"
												style={{ color: TYPE_COLORS[t] }}
											>
												{t}
											</Text>
											<View className="mini-bar-bg">
												<View
													className="mini-bar-fill"
													style={{
														width: `${record.scores[t]}%`,
														backgroundColor: TYPE_COLORS[t],
													}}
												/>
											</View>
											<Text className="mini-pct">{record.scores[t]}%</Text>
										</View>
									))}
								</View>

								<View className="view-btn" onClick={() => handleView(record)}>
									<Text className="view-btn-text">查看结果 →</Text>
								</View>
							</View>
						);
					})
				)}
				<View style={{ height: "40rpx" }} />
			</ScrollView>
		</View>
	);
}
