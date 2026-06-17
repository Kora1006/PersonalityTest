import { themes } from "@PersonalityTest/api/data/themes/index";
import { Image, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import { Icon } from "../../components/icon";
import { RadarCanvas } from "../../components/radar-canvas";
import type { QuizResult } from "../../utils/quiz-store";
import { quizStore } from "../../utils/quiz-store";
import { fetchMiniQrcode, saveShareCardToAlbum } from "../../utils/share-card";
import { storage } from "../../utils/storage";
import { syncLocalHistoryToServer, trpc } from "../../utils/trpc";
import "./index.scss";

const TYPE_COLORS: Record<string, string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

const LEGEND_NAMES: Record<string, string> = {
	D: "掌控型 (Dominance)",
	I: "影响型 (Influence)",
	S: "稳健型 (Steadiness)",
	C: "谨慎型 (Conscientiousness)",
};

export default function Result() {
	const [result, setResult] = useState<QuizResult | null>(null);
	const [barWidths, setBarWidths] = useState({ D: 0, I: 0, S: 0, C: 0 });
	const [shareLoading, setShareLoading] = useState(false);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteQrcode, setInviteQrcode] = useState<string | null>(null);
	const [inviteModal, setInviteModal] = useState(false);
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
		setTimeout(() => setBarWidths(r.scores), 100);

		if (storage.getToken()) {
			syncLocalHistoryToServer().catch(() => null);
		}
	});

	if (!result) {
		return <View className="result-page" />;
	}

	const themeConfig = themes[result.theme ?? "professional"];
	const typeContent = themeConfig.types[result.dominantType];
	const typeColor = TYPE_COLORS[result.dominantType];
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
			});
			Taro.showToast({ title: "已保存到相册", icon: "success" });
		} catch (err: any) {
			console.error("Save share card error:", err);
			Taro.showToast({
				title: `保存失败: ${err?.errMsg || err?.message || "未知错误"}`,
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
			const scene = `inv=${inv.invitationId}&rid=${result.id}`;
			const qrBase64 = await fetchMiniQrcode(scene);
			setInviteQrcode(
				qrBase64
					? `data:image/png;base64,${qrBase64.replace("data:image/png;base64,", "")}`
					: null
			);
			setInviteModal(true);
		} catch {
			Taro.showToast({ title: "生成邀请失败", icon: "none" });
		} finally {
			setInviteLoading(false);
		}
	};

	const goDetail = () => Taro.navigateTo({ url: "/pages/detail/index" });
	const retakeQuiz = () => {
		quizStore.reset();
		Taro.redirectTo({ url: "/pages/quiz/index" });
	};
	const goHistory = () => Taro.switchTab({ url: "/pages/history/index" });

	return (
		<ScrollView className="result-page" scrollY>
			{/* Type Header */}
			<View className="result-header">
				{mode === "quick" && (
					<View className="quick-badge">
						<Text className="quick-badge-text">快速版结果</Text>
					</View>
				)}
				<Text className="header-subtitle">测评已完成</Text>
				<Text className="header-title">
					主导色彩：{result.dominantType} ({typeContent.name})
				</Text>
				<Text className="header-desc">{typeContent.tagline}</Text>
			</View>

			{/* Radar Chart */}
			<View className="radar-section">
				<RadarCanvas
					canvasId="result-radar"
					scores={result.scores}
					size={260}
				/>
			</View>

			{/* Score Bars */}
			<View className="scores-section">
				{(["D", "I", "S", "C"] as const).map((type) => (
					<View className="score-row-wrap" key={type}>
						<View className="score-header-flex">
							<Text
								className="score-label"
								style={{ color: TYPE_COLORS[type] }}
							>
								{LEGEND_NAMES[type]}
							</Text>
							<Text className="score-pct">{result.scores[type]}%</Text>
						</View>
						<View className="score-bar-bg">
							<View
								className="score-bar-fill"
								style={{
									width: `${barWidths[type]}%`,
									backgroundColor: TYPE_COLORS[type],
								}}
							/>
						</View>
					</View>
				))}
			</View>

			{/* Psychological Insights Bento Card */}
			<View className="section-container">
				<Text className="section-title">心理洞察</Text>
				<View className="insight-card">
					<View className="insight-top">
						<View
							className="insight-icon-wrap"
							style={{ backgroundColor: `${typeColor}15` }}
						>
							<Icon color={typeColor} name="psychology" size={56} />
						</View>
						<View className="insight-top-content">
							<Text className="insight-role" style={{ color: typeColor }}>
								{typeContent.name}特质
							</Text>
							<Text className="insight-paragraph">{typeContent.tagline}</Text>
						</View>
					</View>
					<View className="insight-grid">
						<View className="insight-col col-left">
							<Text className="col-title">核心优势</Text>
							{typeContent.strengths.slice(0, 3).map((s) => (
								<View className="col-item" key={s}>
									<View
										className="bullet-dot"
										style={{ backgroundColor: typeColor }}
									/>
									<Text className="item-text">{s}</Text>
								</View>
							))}
						</View>
						<View className="insight-col col-right">
							<Text className="col-title">成长空间</Text>
							{typeContent.growthAreas.slice(0, 3).map((g) => (
								<View className="col-item" key={g}>
									<View
										className="bullet-dot"
										style={{ backgroundColor: "#ba1a1a" }}
									/>
									<Text className="item-text">{g}</Text>
								</View>
							))}
						</View>
					</View>
				</View>
			</View>

			{/* Viral Actions */}
			<View className="viral-section">
				<View
					className="viral-btn share-btn"
					onClick={shareLoading ? undefined : handleShareCard}
				>
					<Text className="viral-btn-text">
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
				<View className="cta-primary" onClick={goDetail}>
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
			<View className="imagery-section">
				<View className="image-wrap-left">
					<Image
						className="imagery-img"
						mode="aspectFill"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9liOu6UZFBvsfbsIOexIB2V5jhwQSYVvFCouPecdlS1-WMaQKFi856P7prKoyJGJ3hlGorv_vNG_KtQXPtujMgi2dKdD0IldXQBVpbRM6ccLbxxgG7tbyv_PBzJkkz5tDW_gSAc5ygv2l3GT50KzJaeaxecc-mNDp4WV_GyRoR5eb1wLOIPPmed8WibIR8xZUNx0X0e38FYgyjm8oRnk_x52vDCj4NUI5GfhoHXf0P0oM-61xrNb5IU8ogTufMCtEih3YmKW4ZcAj"
					/>
				</View>
				<View className="image-wrap-right">
					<Image
						className="imagery-img"
						mode="aspectFill"
						src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT22xa9kntGvtOhpOYPsiUGFfSUlPUcGCns9R594ZIGTcehCZPWuZ444ymmO7SlfxXbRFGVs3zf44Q7RiKFC7CvryRaRPpvpaVGZf-wLo_SR3NHsu7r2aVnhtqcHN-7rabZUyn_eOHM1dlGG9PDUMxW3_RBvQBc6PXERxmD-aS4VnFITm6-t6Mmk8HglcwgS1Pu-iMdMRVB2C9JiGCLrILdXG5G3--gtYKSFE58D3wdJP2vVLxPYUWrflbEtIxKHtOvv5d0gDnT4rf"
					/>
				</View>
			</View>

			<View style={{ height: "80rpx" }} />

			{/* Invite Friend Modal */}
			{inviteModal && (
				<View className="modal-overlay" onClick={() => setInviteModal(false)}>
					<View className="modal-card" onClick={(e) => e.stopPropagation()}>
						<Text className="modal-title">邀请好友对比 DISC</Text>
						<Text className="modal-desc">
							让好友扫码完成测评，对比你们的性格差异
						</Text>
						{inviteQrcode ? (
							<Image className="invite-qrcode" src={inviteQrcode} />
						) : (
							<View className="qrcode-placeholder">
								<Text className="qrcode-placeholder-text">
									小程序码生成中...
								</Text>
							</View>
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
	);
}
