import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { DISC_COLORS } from "../../data/disc-colors";
import { quizStore } from "../../utils/quiz-store";
import { storage } from "../../utils/storage";
import "./index.scss";

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

const STATS = [
	{ value: "1.5万+", label: "已分析画像" },
	{ value: "98%", label: "准确度评分" },
	{ value: "10分钟", label: "平均测试时长" },
];

const COLORS: Record<string, string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

export default function Index() {
	useLoad((options: { scene?: string } = {}) => {
		Taro.setNavigationBarTitle({ title: "DISC 职业性格测评" });

		// Parse QR code scene param: inv=<invitationId>&rid=<inviterResultId>
		if (options.scene) {
			try {
				const params = Object.fromEntries(
					decodeURIComponent(options.scene)
						.split("&")
						.map((p) => p.split("=") as [string, string])
				);
				if (params.inv && params.rid) {
					storage.setPendingInvitation({
						invitationId: params.inv,
						inviterResultId: params.rid,
					});
				}
			} catch {
				// ignore malformed scene
			}
		}
	});

	const startQuiz = (mode: "full" | "quick" = "full") => {
		quizStore.reset(mode);
		Taro.navigateTo({ url: "/pages/quiz/index" });
	};

	const goHistory = () => {
		Taro.switchTab({ url: "/pages/history/index" });
	};

	return (
		<ScrollView className="index-page" scrollY>
			{/* Hero */}
			<View className="hero-section">
				<Text className="hero-subtitle">PERSONAL GROWTH ENGINE</Text>
				<Text className="hero-title">发现你的{"\n"}职场人格密码</Text>
				<Text className="hero-desc">
					基于 DISC
					模型的科学测评，帮助你深度了解自己的行为风格，解锁职业发展潜能。
				</Text>

				<View className="btn-group">
					<View className="btn-primary" onClick={() => startQuiz("full")}>
						<Text className="btn-text">开始完整测评（24题）</Text>
					</View>
					<View className="btn-quick" onClick={() => startQuiz("quick")}>
						<Text className="btn-text">快速测评（12题 · 2分钟）</Text>
					</View>
					<View className="btn-secondary" onClick={goHistory}>
						<Text className="btn-text-dark">查看历史记录</Text>
					</View>
				</View>
			</View>

			{/* DISC Cards */}
			<View className="section">
				<Text className="section-title">DISC 四维人格</Text>
				{DISC_CARDS.map(({ type, desc }) => {
					const color = DISC_COLORS[type];
					return (
						<View className="disc-card" key={type}>
							<View
								className="disc-icon"
								style={{ backgroundColor: COLORS[type] }}
							>
								<Text className="disc-icon-text">{type}</Text>
							</View>
							<View className="disc-info">
								<Text className="disc-name">{color.label}</Text>
								<Text className="disc-desc">{desc}</Text>
							</View>
						</View>
					);
				})}
			</View>

			{/* Stats */}
			<View className="stats-section">
				{STATS.map(({ value, label }) => (
					<View className="stat-item" key={label}>
						<Text className="stat-value">{value}</Text>
						<Text className="stat-label">{label}</Text>
					</View>
				))}
			</View>

			<View style={{ height: "120rpx" }} />
		</ScrollView>
	);
}
