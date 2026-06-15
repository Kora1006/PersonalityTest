import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad, useRouter } from "@tarojs/taro";
import { useState } from "react";
import { ComparisonRadar } from "../../components/comparison-radar";
import { DISC_COLORS } from "../../data/disc-colors";
import { saveShareCardToAlbum } from "../../utils/share-card";
import { trpc } from "../../utils/trpc";
import "./index.scss";

interface ComparisonData {
	friend: {
		resultId: string;
		dominantType: "D" | "I" | "S" | "C";
		scores: { D: number; I: number; S: number; C: number };
	};
	insight: string;
	my: {
		resultId: string;
		dominantType: "D" | "I" | "S" | "C";
		scores: { D: number; I: number; S: number; C: number };
	};
}

export default function Comparison() {
	const router = useRouter();
	const [data, setData] = useState<ComparisonData | null>(null);
	const [loading, setLoading] = useState(true);
	const [shareLoading, setShareLoading] = useState(false);

	useLoad(async () => {
		Taro.setNavigationBarTitle({ title: "好友对比" });

		const { myResultId, friendResultId } = router.params as {
			myResultId?: string;
			friendResultId?: string;
		};
		if (!(myResultId && friendResultId)) {
			Taro.showToast({ title: "参数缺失", icon: "none" });
			setLoading(false);
			return;
		}

		try {
			const result = await trpc.query<ComparisonData>(
				"comparison.getComparison",
				{
					myResultId,
					friendResultId,
				}
			);
			setData(result);
		} catch {
			Taro.showToast({ title: "加载失败", icon: "none" });
		} finally {
			setLoading(false);
		}
	});

	const handleShareDual = async () => {
		if (!data) {
			return;
		}
		setShareLoading(true);
		try {
			await Taro.authorize({ scope: "scope.writePhotosAlbum" }).catch(
				() => null
			);
			// Share my card — dual card design uses my scores with insight text embedded
			await saveShareCardToAlbum({
				dominantType: data.my.dominantType,
				scores: data.my.scores,
			});
			Taro.showToast({ title: "已保存到相册", icon: "success" });
		} catch {
			Taro.showToast({ title: "保存失败", icon: "none" });
		} finally {
			setShareLoading(false);
		}
	};

	if (loading) {
		return (
			<View className="comparison-page loading">
				<Text className="loading-text">加载对比数据中...</Text>
			</View>
		);
	}

	if (!data) {
		return (
			<View className="comparison-page error">
				<Text className="error-text">加载失败，请返回重试</Text>
			</View>
		);
	}

	return (
		<ScrollView className="comparison-page" scrollY>
			{/* Header */}
			<View className="comparison-header">
				<Text className="comparison-title">性格对比报告</Text>
				<Text className="comparison-sub">看看你们的 DISC 风格有何不同</Text>
			</View>

			{/* Type Tags */}
			<View className="type-row">
				<View className="type-card my-card">
					<Text
						className="type-tag"
						style={{ color: DISC_COLORS[data.my.dominantType].hex }}
					>
						{data.my.dominantType}
					</Text>
					<Text className="type-name">
						{DISC_COLORS[data.my.dominantType].label}
					</Text>
					<Text className="type-role">我</Text>
				</View>
				<Text className="vs-text">VS</Text>
				<View className="type-card friend-card">
					<Text
						className="type-tag"
						style={{ color: DISC_COLORS[data.friend.dominantType].hex }}
					>
						{data.friend.dominantType}
					</Text>
					<Text className="type-name">
						{DISC_COLORS[data.friend.dominantType].label}
					</Text>
					<Text className="type-role">好友</Text>
				</View>
			</View>

			{/* Dual Radar */}
			<View className="radar-section">
				<ComparisonRadar
					canvasId="comparison-radar-main"
					friendScores={data.friend.scores}
					myScores={data.my.scores}
					size={300}
				/>
			</View>

			{/* Insight */}
			<View className="insight-card">
				<Text className="insight-label">组合洞察</Text>
				<Text className="insight-text">{data.insight}</Text>
			</View>

			{/* Score Comparison */}
			<View className="score-compare-section">
				<Text className="section-title">维度对比</Text>
				{(["D", "I", "S", "C"] as const).map((type) => (
					<View className="score-compare-row" key={type}>
						<Text
							className="compare-label"
							style={{ color: DISC_COLORS[type].hex }}
						>
							{type}
						</Text>
						<View className="compare-bars">
							<View className="bar-wrap my-bar-wrap">
								<View
									className="bar-fill my-bar"
									style={{ width: `${data.my.scores[type]}%` }}
								/>
							</View>
							<Text className="compare-pct">
								{data.my.scores[type]}% / {data.friend.scores[type]}%
							</Text>
							<View className="bar-wrap friend-bar-wrap">
								<View
									className="bar-fill friend-bar"
									style={{ width: `${data.friend.scores[type]}%` }}
								/>
							</View>
						</View>
					</View>
				))}
			</View>

			{/* Actions */}
			<View className="action-section">
				<View
					className="action-btn share-btn"
					onClick={shareLoading ? undefined : handleShareDual}
				>
					<Text className="action-btn-text">
						{shareLoading ? "生成中..." : "保存对比卡片"}
					</Text>
				</View>
				<View
					className="action-btn retake-btn"
					onClick={() => Taro.navigateBack()}
				>
					<Text className="action-btn-text-muted">返回</Text>
				</View>
			</View>

			<View style={{ height: "80rpx" }} />
		</ScrollView>
	);
}
