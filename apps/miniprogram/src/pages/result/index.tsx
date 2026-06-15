import { Image, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import { RadarCanvas } from "../../components/radar-canvas";
import { DISC_COLORS } from "../../data/disc-colors";
import { DISC_PROFILES } from "../../data/disc-profiles";
import type { QuizResult } from "../../utils/quiz-store";
import { quizStore } from "../../utils/quiz-store";
import { fetchMiniQrcode, saveShareCardToAlbum } from "../../utils/share-card";
import { storage } from "../../utils/storage";
import { trpc } from "../../utils/trpc";
import "./index.scss";

const TYPE_COLORS: Record<string, string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

export default function Result() {
	const [result, setResult] = useState<QuizResult | null>(null);
	const [barWidths, setBarWidths] = useState({ D: 0, I: 0, S: 0, C: 0 });
	const [shareLoading, setShareLoading] = useState(false);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteQrcode, setInviteQrcode] = useState<string | null>(null);
	const [inviteModal, setInviteModal] = useState(false);
	const mode = quizStore.getMode();

	useLoad(() => {
		const r = quizStore.getLastResult();
		if (!r) {
			Taro.navigateBack();
			return;
		}
		setResult(r);
		Taro.setNavigationBarTitle({ title: "测评结果" });
		setTimeout(() => setBarWidths(r.scores), 100);
	});

	if (!result) {
		return null;
	}

	const profile = DISC_PROFILES[result.dominantType];
	const color = DISC_COLORS[result.dominantType];
	const typeColor = TYPE_COLORS[result.dominantType];

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
			});
			Taro.showToast({ title: "已保存到相册", icon: "success" });
		} catch {
			Taro.showToast({ title: "保存失败，请重试", icon: "none" });
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
		Taro.navigateTo({ url: "/pages/quiz/index" });
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
				<View
					className="type-badge"
					style={{
						backgroundColor: `${typeColor}20`,
						borderColor: `${typeColor}40`,
					}}
				>
					<Text className="type-letter" style={{ color: typeColor }}>
						{result.dominantType}
					</Text>
				</View>
				<Text className="type-name">{color.label}</Text>
				<Text className="type-tagline">{profile.tagline}</Text>
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
				<Text className="section-title">维度得分</Text>
				{(["D", "I", "S", "C"] as const).map((type) => (
					<View className="score-row" key={type}>
						<Text className="score-label" style={{ color: TYPE_COLORS[type] }}>
							{type}
						</Text>
						<View className="score-bar-bg">
							<View
								className="score-bar-fill"
								style={{
									width: `${barWidths[type]}%`,
									backgroundColor: TYPE_COLORS[type],
								}}
							/>
						</View>
						<Text className="score-pct">{result.scores[type]}%</Text>
					</View>
				))}
			</View>

			{/* Profile Summary */}
			<View className="profile-section">
				<Text className="section-title">性格画像</Text>
				<Text className="profile-desc">{profile.description}</Text>
				<View className="strengths-grid">
					<View className="strengths-card">
						<Text className="card-title">核心优势</Text>
						{profile.strengths.slice(0, 3).map((s) => (
							<View className="strength-item" key={s}>
								<Text className="strength-dot" style={{ color: typeColor }}>
									•
								</Text>
								<Text className="strength-text">{s}</Text>
							</View>
						))}
					</View>
					<View className="strengths-card">
						<Text className="card-title">成长空间</Text>
						{profile.growthAreas.slice(0, 3).map((g) => (
							<View className="strength-item" key={g}>
								<Text className="strength-dot" style={{ color: "#94a3b8" }}>
									•
								</Text>
								<Text className="strength-text">{g}</Text>
							</View>
						))}
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

			{/* Quick version upgrade prompt */}
			{mode === "quick" && (
				<View className="upgrade-banner">
					<Text className="upgrade-text">
						完成完整版 24 题，获得更精准的职业性格报告
					</Text>
					<View
						className="upgrade-btn"
						onClick={() => {
							quizStore.reset("full");
							Taro.navigateTo({ url: "/pages/quiz/index" });
						}}
					>
						<Text className="upgrade-btn-text">立即完成完整版 →</Text>
					</View>
				</View>
			)}

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
