import { themes } from "@PersonalityTest/api/data/themes/index";
import { Image, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import benefitsImg from "../../assets/images/benefits.png";
import { Icon } from "../../components/icon";
import { DISC_COLORS } from "../../data/disc-colors";
import type { ThemeId } from "../../utils/quiz-store";
import { quizStore } from "../../utils/quiz-store";
import { storage } from "../../utils/storage";
import "./index.scss";

const DISC_CARDS = [
	{
		type: "D" as const,
		desc: "侧重于达成目标、结果导向、果断且充满自信。",
	},
	{
		type: "I" as const,
		desc: "侧重于说服与影响他人、心态开放、重视人际关系。",
	},
	{
		type: "S" as const,
		desc: "侧重于团队协作、真诚可靠、追求稳定与一致性。",
	},
	{
		type: "C" as const,
		desc: "侧重于质量与准确性、专业知识、注重逻辑与规程。",
	},
];

const STATS = [
	{ value: "3种主题", label: "深度测评" },
	{ value: "98%", label: "准确度评分" },
	{ value: "10分钟", label: "平均测试时长" },
];

export default function Index() {
	useLoad((options: { scene?: string } | undefined) => {
		Taro.setNavigationBarTitle({ title: "DISC 职业性格测评" });

		if (options?.scene) {
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
				// ignore
			}
		}
	});

	const startQuiz = (
		mode: "full" | "quick" = "full",
		theme: ThemeId = "professional"
	) => {
		quizStore.reset(mode, theme);
		Taro.navigateTo({ url: `/pages/quiz/index?theme=${theme}&mode=${mode}` });
	};

	const getIconName = (type: "D" | "I" | "S" | "C") => {
		switch (type) {
			case "D":
				return "bolt";
			case "I":
				return "groups";
			case "S":
				return "balance";
			case "C":
				return "fact_check";
		}
	};

	return (
		<ScrollView className="index-page" scrollY>
			{/* Top Bar Header */}
			<View className="page-header">
				<Icon color="#0058be" name="psychology" size={48} />
				<Text className="header-title">DISC 职业测评</Text>
			</View>

			{/* Hero */}
			<View className="hero-section">
				<Text className="hero-subtitle">个人成长引擎</Text>
				<Text className="hero-title">解码行为特质，{"\n"}放大职场影响力。</Text>
				<Text className="hero-desc">
					DISC
					测评是了解职业性格倾向的强大工具。识别您在支配型、影响型、稳健型和服从型四个维度中的独特组合。
				</Text>

				<View className="btn-group">
					<View className="btn-primary" onClick={() => startQuiz("full")}>
						<Text className="btn-text">开始完整测评 (40题)</Text>
					</View>
					<View className="btn-quick" onClick={() => startQuiz("quick")}>
						<Text className="btn-text-blue">快速测评 (20题 · 5分钟)</Text>
					</View>
				</View>
			</View>

			{/* Theme Selector */}
			<View className="section">
				<Text className="section-title">选择你的测评视角</Text>
				<Text className="section-subtitle">同样的算法，不同的场景解读</Text>
				<View className="theme-cards">
					{Object.values(themes).map((theme) => (
						<View
							className="theme-card"
							key={theme.id}
							onClick={() => startQuiz("full", theme.id)}
							style={{ borderColor: `${theme.cardTheme.primaryColor}30` }}
						>
							<View
								className="theme-card-bar"
								style={{ backgroundColor: theme.cardTheme.primaryColor }}
							/>
							<Text
								className="theme-card-name"
								style={{ color: theme.cardTheme.primaryColor }}
							>
								{theme.name}
							</Text>
							<Text className="theme-card-title">{theme.entryTitle}</Text>
							<Text className="theme-card-sub">{theme.entrySubtitle}</Text>
						</View>
					))}
				</View>
			</View>

			{/* DISC Cards */}
			<View className="section">
				<Text className="section-title">四大核心维度</Text>
				<Text className="section-subtitle">
					每个个体都是这些核心特质的独特融合
				</Text>
				<View className="disc-grid">
					{DISC_CARDS.map(({ type, desc }) => {
						const color = DISC_COLORS[type];
						return (
							<View className="disc-card" key={type}>
								<View
									className={`disc-icon disc-gradient-${type.toLowerCase()}`}
								>
									<Icon color="#ffffff" name={getIconName(type)} size={44} />
								</View>
								<View className="disc-info">
									<Text className="disc-name">
										{color.label} ({type})
									</Text>
									<Text className="disc-desc">{desc}</Text>
								</View>
							</View>
						);
					})}
				</View>
			</View>

			{/* Benefits Section */}
			<View className="section benefits-section">
				<Text className="section-title">为什么要了解您的性格画像？</Text>
				<View className="benefits-layout">
					<View className="benefits-image-wrap">
						<Image
							className="benefits-image"
							mode="aspectFill"
							src={benefitsImg}
						/>
					</View>
					<View className="benefits-list">
						<View className="benefit-item">
							<View className="benefit-icon-wrap">
								<Icon color="#0058be" name="forum" size={32} />
							</View>
							<View className="benefit-content">
								<Text className="benefit-title">更好的沟通效果</Text>
								<Text className="benefit-desc">
									学习如何根据他人的风格调整自己的沟通方式，实现更高效、无冲突的互动。
								</Text>
							</View>
						</View>
						<View className="benefit-item">
							<View className="benefit-icon-wrap">
								<Icon color="#0058be" name="insights" size={32} />
							</View>
							<View className="benefit-content">
								<Text className="benefit-title">职业生涯优化</Text>
								<Text className="benefit-desc">
									深入了解您的天赋优势，并将自己定位在能够毫不费力发挥所长的岗位上。
								</Text>
							</View>
						</View>
						<View className="benefit-item">
							<View className="benefit-icon-wrap">
								<Icon color="#0058be" name="diversity_3" size={32} />
							</View>
							<View className="benefit-content">
								<Text className="benefit-title">团队动力提升</Text>
								<Text className="benefit-desc">
									管理者和人力资源专家使用 DISC 来构建能力互补的平衡团队。
								</Text>
							</View>
						</View>
					</View>
				</View>
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

			<View style={{ height: "160rpx" }} />

			{/* Floating action button */}
			<View className="floating-start-btn" onClick={() => startQuiz("full")}>
				<Icon color="#ffffff" name="play_arrow" size={56} />
			</View>
		</ScrollView>
	);
}
