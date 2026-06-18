import {
	getPersonalityContent,
	themes,
} from "@PersonalityTest/api/data/themes/index";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad, useShareAppMessage } from "@tarojs/taro";
import { useState } from "react";
import { Icon, toBase64 } from "../../components/icon";
import { RadarCanvas } from "../../components/radar-canvas";
import { getDominantLabel } from "../../data/disc-colors";
import type { QuizResult } from "../../utils/quiz-store";
import { quizStore } from "../../utils/quiz-store";
import { fetchMiniQrcode, saveShareCardToAlbum } from "../../utils/share-card";
import { storage } from "../../utils/storage";
import { CDN_IMAGES, getThemeHeroImage } from "../../utils/theme-images";
import { syncLocalHistoryToServer, trpc } from "../../utils/trpc";
import "./index.scss";

const TYPE_COLORS: Record<"D" | "I" | "S" | "C", string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

const LEGEND_NAMES: Record<"D" | "I" | "S" | "C", string> = {
	D: "掌控型 (Dominance)",
	I: "影响型 (Influence)",
	S: "稳健型 (Steadiness)",
	C: "谨慎型 (Conscientiousness)",
};

const DECISION_STYLES: Record<
	"D" | "I" | "S" | "C",
	{ title: string; desc: string; advice: string }
> = {
	D: {
		title: "结果导向型",
		desc: "您在管理决策中高度关注成果与效率，反应迅速，直奔主题，敢于承担前行中的风险。",
		advice:
			"建议在制定重大战略前多倾听团队声音，并给予下属表达不同视角的空间。",
	},
	I: {
		title: "感召直觉型",
		desc: "在管理决策中，您倾向于基于宏观愿景和人际关系进行判断。您反应迅速，能捕捉 to 转瞬即逝的机会。",
		advice: "在重要决策前，建议结合更多数据分析，平衡感性与理性的边界。",
	},
	S: {
		title: "稳健合作型",
		desc: "您在决策中重视团队共识与稳定，倾向于听取多方意见，避免过激的冒险变革。",
		advice:
			"建议压缩决策周期，尝试在收集到80%的信息时即快速行动，以适应快节奏环境。",
	},
	C: {
		title: "数据分析型",
		desc: "您在决策中高度依赖事实与逻辑，极力规避潜在的流程风险，确保方案完美可行。",
		advice:
			"在瞬息万变的商业环境中，建议尝试放权与妥协，明白70分及时决策往往优于100分迟到决策。",
	},
};

export default function Result() {
	const [result, setResult] = useState<QuizResult | null>(null);
	const [shareLoading, setShareLoading] = useState(false);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteModal, setInviteModal] = useState(false);
	const [currentInvitation, setCurrentInvitation] = useState<{
		invitationId: string;
		inviterResultId: string;
	} | null>(null);
	const mode = quizStore.getMode();

	useLoad((options: Record<string, string | undefined>) => {
		// Try quizStore first (set by quiz completion or history page)
		let r = quizStore.getLastResult();

		// Fallback: load from storage via historyId URL param
		if (!r && options.historyId) {
			const records = storage.getHistory();
			const found = records.find((rec) => rec.id === options.historyId);
			if (found) {
				r = {
					...found,
					theme: (found.theme as QuizResult["theme"]) ?? "professional",
				};
				quizStore.setLastResult(r);
			}
		}

		if (!r) {
			Taro.navigateBack();
			return;
		}
		setResult(r);
		Taro.setNavigationBarTitle({ title: "测评结果" });

		if (storage.getToken()) {
			syncLocalHistoryToServer().catch(() => null);
		}
	});

	useShareAppMessage((res) => {
		if (res.from === "button" && currentInvitation) {
			return {
				title: "快来测测你的 DISC 性格，和我进行性格默契度大比拼吧！",
				path: `/pages/index/index?inv=${currentInvitation.invitationId}&rid=${currentInvitation.inviterResultId}`,
				imageUrl: getThemeHeroImage(result?.theme || "professional") || "",
			};
		}
		return {
			title: `我的 DISC 性格测评结果是【${result?.dominantType}】，快来测测你的！`,
			path: "/pages/index/index",
		};
	});

	if (!result) {
		return <View className="result-page" />;
	}

	const themeConfig = themes[result.theme ?? "professional"];
	const primaryType = (result.dominantType.charAt(0) || "D") as
		| "D"
		| "I"
		| "S"
		| "C";
	const typeContent = getPersonalityContent(
		result.theme ?? "professional",
		result.dominantType
	);
	const typeColor = TYPE_COLORS[primaryType];
	const otherThemes = Object.values(themes).filter(
		(t) => t.id !== themeConfig.id
	);

	const handleShareCard = async () => {
		setShareLoading(true);
		try {
			await Taro.authorize({ scope: "scope.writePhotosAlbum" }).catch(
				() => null
			);
			const qrcodeBase64 = await fetchMiniQrcode(`resultId=${result.id}`);
			await saveShareCardToAlbum({
				dominantType: result.dominantType,
				scores: result.scores,
				qrcodeBase64: qrcodeBase64 ?? undefined,
				cardTheme: themeConfig.cardTheme,
				backgroundImage: themeConfig.heroImage,
			});
			Taro.showToast({ title: "已保存到相册", icon: "success" });
		} catch (err) {
			const errMsg = err instanceof Error ? err.message : String(err);
			const wechatErr =
				err && typeof err === "object" && "errMsg" in err
					? String((err as Record<string, unknown>).errMsg)
					: undefined;
			console.error("Save share card error:", err);
			Taro.showToast({
				title: `保存失败: ${wechatErr || errMsg || "未知错误"}`,
				icon: "none",
			});
		} finally {
			setShareLoading(false);
		}
	};

	const handleInviteFriend = async () => {
		const user = storage.getUser();
		if (!user) {
			Taro.showModal({
				title: "需要登录",
				content: "邀请好友对比需要先登录",
				confirmText: "去登录",
				success: (res) => {
					if (res.confirm) {
						Taro.navigateTo({ url: "/pages/auth/index" });
					}
				},
			});
			return;
		}

		setInviteLoading(true);
		try {
			const inv = await trpc.mutate<{
				invitationId: string;
				inviterId: string;
				inviterResultId: string;
			}>("invitation.createInvitation", { resultId: result.id });
			setCurrentInvitation({
				invitationId: inv.invitationId,
				inviterResultId: result.id,
			});
			setInviteModal(true);
		} catch {
			Taro.showToast({ title: "生成邀请失败", icon: "none" });
		} finally {
			setInviteLoading(false);
		}
	};

	const goDetail = () => Taro.navigateTo({ url: "/pages/detail/index" });
	const retakeQuiz = () => {
		const currentTheme = result.theme ?? "professional";
		const currentMode = quizStore.getMode() ?? "full";
		quizStore.reset(currentMode, currentTheme);
		Taro.redirectTo({
			url: `/pages/quiz/index?theme=${currentTheme}&mode=${currentMode}`,
		});
	};
	const goHistory = () => Taro.switchTab({ url: "/pages/history/index" });

	const renderProfessional = () => {
		return (
			<View className="theme-layout-professional">
				{/* Hero Header with Background Cover */}
				<View className="professional-hero">
					<Image
						className="hero-bg-image"
						mode="aspectFill"
						src={getThemeHeroImage(result.theme)}
					/>
					<View className="hero-gradient-overlay" />
					<View className="hero-content-wrap">
						<View className="glass-blur-info-card">
							<View className="info-card-flex">
								{/* Dominance Badge */}
								<View
									className="dominant-type-bubble"
									style={{ backgroundColor: typeColor }}
								>
									<Text className="bubble-letter">{result.dominantType}</Text>
									<Text className="bubble-name">
										{typeContent.name.split(" ")[0]}
									</Text>
								</View>
								<View className="info-card-texts">
									<View className="core-personality-badge">
										<Text className="badge-txt">
											核心人格：{getDominantLabel(result.dominantType)}
										</Text>
									</View>
									<Text className="hero-tagline">{typeContent.tagline}</Text>
									<Text className="hero-summary">
										{typeContent.detailAnalysis.section1Content}
									</Text>
								</View>
							</View>
						</View>
					</View>
				</View>

				{/* DISC Radar Chart Section */}
				<View className="bento-card-container radar-card">
					<Text className="bento-card-title">DISC 能力维度图</Text>
					<View className="radar-canvas-wrap">
						<RadarCanvas
							canvasId="result-radar"
							color={typeColor}
							scores={result.scores}
							size={260}
						/>
					</View>
					<View className="radar-legend-grid">
						{(["D", "I", "S", "C"] as const).map((type) => (
							<View className="legend-item" key={type}>
								<View
									className="legend-dot"
									style={{ backgroundColor: TYPE_COLORS[type] }}
								/>
								<Text className="legend-label">
									{type} ({(themeConfig.types[type]?.name || type).slice(0, 2)}
									): {result.scores[type]}%
								</Text>
							</View>
						))}
					</View>
				</View>

				{/* Core Strengths Section */}
				<View className="strengths-bento-section">
					<Text className="bento-card-title">核心优势与展现</Text>
					<View className="strengths-cards-list">
						{typeContent.strengths.slice(0, 3).map((str, idx) => {
							const parts = str.split("，");
							const title = parts[0] || "优势特质";
							const desc = parts[1] || str;
							const iconNames = ["bolt", "rocket_launch", "trending_up"];
							const iconColors = [typeColor, "#7c3aed", "#10b981"];
							return (
								<View
									className="strength-block-card"
									key={str}
									style={{ borderLeftColor: iconColors[idx % 3] }}
								>
									<View className="strength-card-header">
										<Icon
											color={iconColors[idx % 3]}
											name={iconNames[idx % 3] || "bolt"}
											size={40}
										/>
										<Text
											className="strength-card-title"
											style={{ color: iconColors[idx % 3] }}
										>
											{title}
										</Text>
									</View>
									<Text className="strength-card-desc">{desc}</Text>
								</View>
							);
						})}
					</View>
				</View>

				{/* Competitiveness advice */}
				<View className="professional-advice-card">
					<View className="advice-left">
						<Text className="advice-title">职场竞争力建议</Text>
						<Text className="advice-p">
							作为高
							{result.dominantType.length === 2
								? `${result.dominantType.charAt(0)}/${result.dominantType.charAt(1)}`
								: result.dominantType}
							型人才，您的{typeContent.name}
							特质非常明显。在职业发展中，
							{typeContent.detailAnalysis.section3Content}
						</Text>
						<View className="advice-tags-row">
							<Text className="advice-tag-chip">建议：战略管理</Text>
							<Text className="advice-tag-chip">建议：团队协作</Text>
						</View>
					</View>
					<View className="advice-right-image-wrap">
						<Image
							className="advice-meeting-img"
							mode="aspectFill"
							src={CDN_IMAGES.adviceMeeting}
						/>
					</View>
				</View>

				{/* Career Paths Recommendations */}
				{typeContent.careerPaths && typeContent.careerPaths.length > 0 && (
					<View className="career-paths-section">
						<Text className="bento-card-title">推荐职场路径</Text>
						<View className="career-paths-grid">
							{typeContent.careerPaths.map((path) => (
								<View className="career-path-item-card" key={path.title}>
									<Icon color={typeColor} name={path.icon} size={48} />
									<Text className="path-title">{path.title}</Text>
									<Text className="path-match">
										匹配度：{path.compatibility}
									</Text>
								</View>
							))}
						</View>
					</View>
				)}
			</View>
		);
	};

	const renderLeadership = () => {
		const decision = DECISION_STYLES[primaryType] || DECISION_STYLES.D;
		const isDActive = result.dominantType.includes("D");
		const isIActive = result.dominantType.includes("I");
		const isSActive = result.dominantType.includes("S");
		const isCActive = result.dominantType.includes("C");

		const activeFill = (type: "D" | "I" | "S" | "C") => {
			switch (type) {
				case "D":
					return "rgba(239, 68, 68, 0.12)";
				case "I":
					return "rgba(245, 158, 11, 0.12)";
				case "S":
					return "rgba(16, 185, 129, 0.12)";
				case "C":
					return "rgba(59, 130, 246, 0.12)";
				default:
					return "rgba(0, 88, 190, 0.12)";
			}
		};

		const dFill = isDActive ? activeFill("D") : "#F3F4F6";
		const dStroke = isDActive ? TYPE_COLORS.D : "#E5E7EB";
		const dStrokeWidth = isDActive ? 2 : 1;

		const iFill = isIActive ? activeFill("I") : "#F3F4F6";
		const iStroke = isIActive ? TYPE_COLORS.I : "#E5E7EB";
		const iStrokeWidth = isIActive ? 2 : 1;

		const sFill = isSActive ? activeFill("S") : "#F3F4F6";
		const sStroke = isSActive ? TYPE_COLORS.S : "#E5E7EB";
		const sStrokeWidth = isSActive ? 2 : 1;

		const cFill = isCActive ? activeFill("C") : "#F3F4F6";
		const cStroke = isCActive ? TYPE_COLORS.C : "#E5E7EB";
		const cStrokeWidth = isCActive ? 2 : 1;

		const dTextFill = isDActive ? TYPE_COLORS.D : "#727785";
		const dTextWeight = isDActive ? "bold" : "normal";

		const iTextFill = isIActive ? TYPE_COLORS.I : "#727785";
		const iTextWeight = isIActive ? "bold" : "normal";

		const sTextFill = isSActive ? TYPE_COLORS.S : "#727785";
		const sTextWeight = isSActive ? "bold" : "normal";

		const cTextFill = isCActive ? TYPE_COLORS.C : "#727785";
		const cTextWeight = isCActive ? "bold" : "normal";

		const wheelSvgString = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
			<path d="M 50 50 L 50 5 A 45 45 0 0 1 95 50 Z" fill="${dFill}" stroke="${dStroke}" stroke-width="${dStrokeWidth}" />
			<path d="M 50 50 L 95 50 A 45 45 0 0 1 50 95 Z" fill="${iFill}" stroke="${iStroke}" stroke-width="${iStrokeWidth}" />
			<path d="M 50 50 L 50 95 A 45 45 0 0 1 5 50 Z" fill="${sFill}" stroke="${sStroke}" stroke-width="${sStrokeWidth}" />
			<path d="M 50 50 L 5 50 A 45 45 0 0 1 50 5 Z" fill="${cFill}" stroke="${cStroke}" stroke-width="${cStrokeWidth}" />
			<circle cx="50" cy="50" r="12" fill="#ffffff" stroke="#E5E7EB" stroke-width="1" />
			<path d="M 50 43.5 L 51.9 47.7 L 56.4 48.3 L 53.1 51.5 L 53.9 56 L 50 53.8 L 46.1 56 L 46.9 51.5 L 43.6 48.3 L 48.1 47.7 Z" fill="#facc15" />
			<text x="25" y="32" fill="${dTextFill}" font-family="JetBrains Mono, monospace" font-size="8" font-weight="${dTextWeight}">D</text>
			<text x="68" y="75" fill="${iTextFill}" font-family="JetBrains Mono, monospace" font-size="8" font-weight="${iTextWeight}">I</text>
			<text x="25" y="75" fill="${sTextFill}" font-family="JetBrains Mono, monospace" font-size="8" font-weight="${sTextWeight}">S</text>
			<text x="68" y="32" fill="${cTextFill}" font-family="JetBrains Mono, monospace" font-size="8" font-weight="${cTextWeight}">C</text>
		</svg>`;

		const wheelSrc = `data:image/svg+xml;base64,${toBase64(wheelSvgString)}`;

		return (
			<View className="theme-layout-leadership">
				{/* Hero Section */}
				<View className="leadership-hero">
					<Image
						className="hero-bg-image"
						mode="aspectFill"
						src={getThemeHeroImage(result.theme)}
					/>
					<View className="hero-gradient-overlay" />
					<View className="hero-text-center">
						<View
							className="leadership-type-bubble"
							style={{ borderColor: typeColor }}
						>
							<Text className="bubble-letter" style={{ color: typeColor }}>
								{result.dominantType}
							</Text>
						</View>
						<Text className="leadership-title">{typeContent.name}</Text>
						<Text className="leadership-subtitle">管理专业版报告</Text>
					</View>
				</View>

				{/* Leadership Wheel Section */}
				<View className="bento-card-container leadership-wheel-card">
					<View className="wheel-header">
						<Text className="bento-card-title">管理潜力圆盘</Text>
						<Text className="header-mono-label">DISC ANALYTICS</Text>
					</View>
					<View className="wheel-visualization-row">
						{/* SVG Wheel Element */}
						<View className="wheel-svg-container">
							<Image className="wheel-svg rotate-45" src={wheelSrc} />
						</View>
						{/* Text info and Mini progress */}
						<View className="wheel-right-breakdown">
							<View className="breakdown-header-flex">
								<Text className="breakdown-label" style={{ color: typeColor }}>
									{LEGEND_NAMES[primaryType].split(" ")[0]} (
									{result.dominantType})
								</Text>
								<Text className="breakdown-score" style={{ color: typeColor }}>
									{result.scores[primaryType]}%
								</Text>
							</View>
							<View className="breakdown-progress-bg">
								<View
									className="breakdown-progress-fill"
									style={{
										width: `${result.scores[primaryType]}%`,
										backgroundColor: typeColor,
									}}
								/>
							</View>
							<Text className="breakdown-description">
								{typeContent.detailAnalysis.section1Content}
							</Text>
						</View>
					</View>
				</View>

				{/* Two Bento Columns */}
				<View className="bento-cards-row">
					<View className="bento-half-card strengths-checklist-card">
						<Text className="bento-half-title">团队影响力</Text>
						<View className="check-items-list">
							{typeContent.strengths.map((str) => (
								<View className="check-item-row" key={str}>
									<Icon color="#10b981" name="check_circle" size={32} />
									<Text className="check-item-text">{str}</Text>
								</View>
							))}
						</View>
					</View>

					<View className="bento-half-card decision-style-card">
						<Text className="bento-half-title">决策风格：{decision.title}</Text>
						<Text className="decision-style-desc">{decision.desc}</Text>
						<View className="decision-style-advice-box">
							<Text className="box-title">管理建议</Text>
							<Text className="box-desc">{decision.advice}</Text>
						</View>
					</View>
				</View>

				{/* Management breakdown ("管理维度剖析") */}
				{typeContent.managementAnalysis &&
					typeContent.managementAnalysis.length > 0 && (
						<View className="bento-card-container management-breakdown-card">
							<View className="breakdown-title-row">
								<Icon color={typeColor} name="architecture" size={44} />
								<Text className="bento-card-title">管理维度剖析</Text>
							</View>
							<View className="management-parameters-list">
								{typeContent.managementAnalysis.map((item, idx) => {
									const iconNames = [
										"campaign",
										"groups",
										"assignment_turned_in",
									];
									const borderColors = [typeColor, "#10b981", "#f59e0b"];
									return (
										<View className="management-param-item" key={item.title}>
											<View className="param-item-header">
												<View className="param-item-left">
													<Icon
														color={borderColors[idx % 3] || typeColor}
														name={iconNames[idx % 3] || "groups"}
														size={36}
													/>
													<Text className="param-title">{item.title}</Text>
												</View>
												<View
													className="param-badge"
													style={{
														backgroundColor: `${borderColors[idx % 3]}12`,
														borderColor: `${borderColors[idx % 3]}30`,
													}}
												>
													<Text
														className="param-badge-text"
														style={{ color: borderColors[idx % 3] }}
													>
														{item.badge}
													</Text>
												</View>
											</View>
											<View className="param-progress-wrap">
												<View className="param-progress-bg">
													<View
														className="param-progress-fill"
														style={{
															width: `${item.score}%`,
															backgroundColor:
																borderColors[idx % 3] || typeColor,
														}}
													/>
												</View>
												<Text className="param-pct-text">{item.score}%</Text>
											</View>
											<Text className="param-desc">{item.description}</Text>
										</View>
									);
								})}
							</View>
						</View>
					)}
			</View>
		);
	};

	const renderRelationship = () => {
		const insight = typeContent.relationshipInsight;
		return (
			<View className="theme-layout-relationship">
				{/* Hero Header */}
				<View className="relationship-hero">
					<View className="heart-icon-badge-wrap animate-bounce">
						<Icon color={typeColor} name="favorite" size={72} />
					</View>
					<Text className="relationship-hero-title">
						你的核心特质：{typeContent.name}
					</Text>
					<Text className="relationship-hero-subtitle">
						{typeContent.tagline}
					</Text>
				</View>

				{/* Soft Radar Chart Visuals */}
				<View className="relationship-visual-grid">
					<View className="bento-card-container soft-radar-card">
						<View className="radar-canvas-wrap">
							<RadarCanvas
								canvasId="result-radar"
								color={typeColor}
								scores={result.scores}
								size={260}
							/>
						</View>
					</View>

					<View className="relationship-profile-card">
						<View className="profile-card-header">
							<Icon color={typeColor} name="psychology" size={40} />
							<Text className="profile-title" style={{ color: typeColor }}>
								{LEGEND_NAMES[primaryType].split(" ")[0]} ({result.dominantType}
								)
							</Text>
						</View>
						<Text className="profile-body-p">
							{typeContent.detailAnalysis.section1Content}
						</Text>

						{/* Mini Progress Bars */}
						{typeContent.relationshipMetrics &&
							typeContent.relationshipMetrics.length > 0 && (
								<View className="relationship-metrics-progress">
									{typeContent.relationshipMetrics.map((met) => (
										<View className="metric-progress-item" key={met.title}>
											<View className="metric-header-flex">
												<Text className="metric-label">{met.title}</Text>
												<Text
													className="metric-pct"
													style={{ color: typeColor }}
												>
													{met.score}%
												</Text>
											</View>
											<View className="metric-bar-bg">
												<View
													className="metric-bar-fill"
													style={{
														width: `${met.score}%`,
														backgroundColor: typeColor,
													}}
												/>
											</View>
										</View>
									))}
								</View>
							)}
					</View>
				</View>

				{/* Relationship Insight Double Column Card */}
				{insight && (
					<View className="bento-card-container relationship-insight-card">
						<View className="insight-card-header">
							<View
								className="header-icon-box"
								style={{ backgroundColor: `${typeColor}15` }}
							>
								<Icon color={typeColor} name="groups" size={40} />
							</View>
							<Text className="bento-card-title">人际关系洞察</Text>
						</View>

						<View className="insight-columns-wrap">
							<View className="insight-left-column">
								<Text className="column-sub-title">在亲密关系中</Text>
								<Text className="column-desc-p">{insight.intimacy}</Text>
								<View
									className="column-quote-box"
									style={{
										backgroundColor: `${typeColor}08`,
										borderLeftColor: typeColor,
									}}
								>
									<Text
										className="quote-text"
										style={{ color: `${typeColor}d0` }}
									>
										&ldquo;{typeContent.shareQuotes[0] || "安全的港湾。"}&rdquo;
									</Text>
								</View>
							</View>

							<View className="insight-right-column">
								<Text className="column-sub-title">沟通偏好</Text>
								<View className="preference-list">
									{insight.communicationPreference.map((pref) => (
										<View className="pref-item-row" key={pref}>
											<Icon color={typeColor} name="check_circle" size={32} />
											<Text className="pref-text">{pref}</Text>
										</View>
									))}
								</View>
							</View>
						</View>
					</View>
				)}

				{/* Suggestions Bento Chips */}
				{typeContent.relationshipSuggestions &&
					typeContent.relationshipSuggestions.length > 0 && (
						<View className="relationship-suggestions-section">
							<View className="section-title-row">
								<Icon color={typeColor} name="tips_and_updates" size={44} />
								<Text className="bento-card-title">情感表达建议</Text>
							</View>
							<View className="suggestions-bento-grid">
								{typeContent.relationshipSuggestions.map((sug) => (
									<View className="suggestion-bento-card" key={sug.title}>
										<Icon color={typeColor} name={sug.icon} size={48} />
										<Text className="sug-card-title">{sug.title}</Text>
										<Text className="sug-card-desc">{sug.description}</Text>
									</View>
								))}
							</View>
						</View>
					)}
			</View>
		);
	};

	let themeContent: React.ReactNode = null;
	if (result.theme === "professional") {
		themeContent = renderProfessional();
	} else if (result.theme === "leadership") {
		themeContent = renderLeadership();
	} else if (result.theme === "relationship") {
		themeContent = renderRelationship();
	} else {
		themeContent = renderProfessional();
	}

	return (
		<View className="result-page-container">
			{result.theme === "relationship" && (
				<Image
					className="relationship-artwork-bg"
					mode="aspectFill"
					src={getThemeHeroImage(result.theme)}
				/>
			)}
			<ScrollView
				className={`result-page result-theme-${result.theme ?? "professional"}`}
				scrollY
			>
				{themeContent}

				{/* Viral Actions */}
				<View className="viral-section">
					<View
						className="viral-btn share-btn"
						onClick={shareLoading ? undefined : handleShareCard}
						style={{ borderColor: typeColor }}
					>
						<Text className="viral-btn-text" style={{ color: typeColor }}>
							{shareLoading ? "生成中..." : "生成专属卡片"}
						</Text>
						<Text className="viral-btn-sub">保存精美测评海报到相册</Text>
					</View>
					<View
						className="viral-btn invite-btn"
						onClick={inviteLoading ? undefined : handleInviteFriend}
					>
						<Text className="viral-btn-text">
							{inviteLoading ? "生成中..." : "邀请好友对比"}
						</Text>
						<Text className="viral-btn-sub">看看你们的 DISC 有何不同</Text>
					</View>
				</View>

				{/* Upgrade banner for quick mode */}
				{mode === "quick" && (
					<View className="upgrade-banner">
						<Text className="upgrade-text">
							完成完整版 24 题，获得更精准的职业性格报告
						</Text>
						<View
							className="upgrade-btn"
							onClick={() => {
								quizStore.reset("full");
								Taro.redirectTo({ url: "/pages/quiz/index" });
							}}
						>
							<Text className="upgrade-btn-text">立即完成完整版 →</Text>
						</View>
					</View>
				)}

				{/* Cross Theme recommendations */}
				<View className="cross-theme-section">
					<Text className="section-title">查看你在其他场景的风格</Text>
					<View className="cross-theme-cards">
						{otherThemes.map((t) => (
							<View
								className="cross-theme-card"
								key={t.id}
								onClick={() => {
									quizStore.reset("full", t.id);
									Taro.redirectTo({ url: `/pages/quiz/index?theme=${t.id}` });
								}}
								style={{ borderColor: `${t.cardTheme.primaryColor}40` }}
							>
								<Text
									className="cross-theme-name"
									style={{ color: t.cardTheme.primaryColor }}
								>
									{t.name}
								</Text>
								<Text className="cross-theme-subtitle">{t.entryTitle}</Text>
							</View>
						))}
					</View>
				</View>

				{/* CTAs */}
				<View className="cta-section">
					<View
						className="cta-primary"
						onClick={goDetail}
						style={{
							backgroundColor: typeColor,
							boxShadow: `0 16rpx 40rpx ${typeColor}30`,
						}}
					>
						<Text className="cta-text">查看深度解析</Text>
					</View>
					<View className="cta-row">
						<View className="cta-secondary" onClick={retakeQuiz}>
							<Text className="cta-text-muted">重新测试</Text>
						</View>
						<View className="cta-secondary" onClick={goHistory}>
							<Text className="cta-text-muted">历史记录</Text>
						</View>
					</View>
				</View>

				{/* Asymmetric Imagery Section */}
				{result.theme === "professional" && (
					<View className="imagery-section">
						<View className="image-wrap-left">
							<Image
								className="imagery-img"
								mode="aspectFill"
								src={CDN_IMAGES.imageryLeft}
							/>
						</View>
						<View className="image-wrap-right">
							<Image
								className="imagery-img"
								mode="aspectFill"
								src={CDN_IMAGES.imageryRight}
							/>
						</View>
					</View>
				)}

				<View style={{ height: "80rpx" }} />

				{/* Invite Friend Modal */}
				{inviteModal && (
					<View className="modal-overlay" onClick={() => setInviteModal(false)}>
						<View className="modal-card" onClick={(e) => e.stopPropagation()}>
							<Text className="modal-title">邀请好友对比 DISC</Text>
							<Text className="modal-desc">
								直接发送给微信好友，当好友完成测评后，即可查看双方的 DISC
								对比报告。
							</Text>
							{currentInvitation && (
								<Button
									className="modal-share-btn"
									onClick={() => setInviteModal(false)}
									openType="share"
								>
									发送给微信好友
								</Button>
							)}
							<View
								className="modal-close-btn"
								onClick={() => setInviteModal(false)}
							>
								<Text className="modal-close-text">关闭</Text>
							</View>
						</View>
					</View>
				)}
			</ScrollView>
		</View>
	);
}
