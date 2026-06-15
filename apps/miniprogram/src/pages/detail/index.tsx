import { Image, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad, useShow } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";
import { DISC_COLORS } from "../../data/disc-colors";
import { DISC_PROFILES } from "../../data/disc-profiles";
import { quizStore } from "../../utils/quiz-store";
import { fetchMiniQrcode } from "../../utils/share-card";
import { storage } from "../../utils/storage";
import { trpc } from "../../utils/trpc";
import "./index.scss";

const TYPE_COLORS: Record<string, string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

interface UnlockStatus {
	inviteCount: number;
	isUnlocked: boolean;
	needed: number;
}

export default function Detail() {
	const [unlockStatus, setUnlockStatus] = useState<UnlockStatus | null>(null);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [inviteQrcode, setInviteQrcode] = useState<string | null>(null);
	const [inviteLoading, setInviteLoading] = useState(false);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const result = quizStore.getLastResult();

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: "深度解析" });
	});

	// Fetch unlock status when page shows (also handles polling refresh)
	useShow(() => {
		if (!result) {
			return;
		}
		const user = storage.getUser();
		if (!user) {
			return;
		}

		trpc
			.query<UnlockStatus>("invitation.getUnlockStatus", {
				resultId: result.id,
			})
			.then(setUnlockStatus)
			.catch(() => null);
	});

	// Poll every 5s while modal is open
	useEffect(() => {
		if (!(showInviteModal && result)) {
			return;
		}

		const user = storage.getUser();
		if (!user) {
			return;
		}

		pollRef.current = setInterval(() => {
			trpc
				.query<UnlockStatus>("invitation.getUnlockStatus", {
					resultId: result.id,
				})
				.then((status) => {
					setUnlockStatus(status);
					if (status.isUnlocked) {
						if (pollRef.current !== null) {
							clearInterval(pollRef.current);
						}
						setShowInviteModal(false);
						Taro.showToast({ title: "报告已解锁！", icon: "success" });
					}
				})
				.catch(() => null);
		}, 5000);

		return () => {
			if (pollRef.current) {
				clearInterval(pollRef.current);
			}
		};
	}, [showInviteModal, result]);

	if (!result) {
		Taro.navigateBack();
		return null;
	}

	const profile = DISC_PROFILES[result.dominantType];
	const color = DISC_COLORS[result.dominantType];
	const typeColor = TYPE_COLORS[result.dominantType];
	const score = result.scores[result.dominantType];
	const user = storage.getUser();

	const handleUnlock = async () => {
		if (!user) {
			Taro.showModal({
				title: "需要登录",
				content: "邀请解锁需要先登录",
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
			const inv = await trpc.mutate<{ invitationId: string }>(
				"invitation.createInvitation",
				{
					resultId: result.id,
				}
			);
			const scene = `inv=${inv.invitationId}&rid=${result.id}`;
			const qr = await fetchMiniQrcode(scene);
			setInviteQrcode(qr);
			setShowInviteModal(true);

			// T-018: Request subscribe message permission
			Taro.requestSubscribeMessage({
				tmplIds: [process.env.TARO_APP_SUBSCRIBE_TEMPLATE_ID ?? ""],
				// @ts-expect-error
				success: () => null,
				fail: () => null,
			});
		} catch {
			Taro.showToast({ title: "生成邀请失败", icon: "none" });
		} finally {
			setInviteLoading(false);
		}
	};

	const isUnlocked = unlockStatus?.isUnlocked ?? false;
	const inviteCount = unlockStatus?.inviteCount ?? 0;
	const needed = unlockStatus?.needed ?? 2;

	return (
		<ScrollView className="detail-page" scrollY>
			{/* Header */}
			<View className="detail-header">
				<View
					className="type-icon"
					style={{ backgroundColor: `${typeColor}20` }}
				>
					<Text className="type-letter" style={{ color: typeColor }}>
						{result.dominantType}
					</Text>
				</View>
				<View className="type-info">
					<Text className="type-name">{color.label}</Text>
					<Text className="type-fullname">{profile.fullName}</Text>
				</View>
				<View className="score-badge">
					<Text className="score-value">{score}%</Text>
				</View>
			</View>

			<View className="dominant-bar-wrap">
				<View className="dominant-bar-bg">
					<View
						className="dominant-bar-fill"
						style={{ width: `${score}%`, backgroundColor: typeColor }}
					/>
				</View>
			</View>

			{/* Core Strengths */}
			<View className="section">
				<Text className="section-title">核心优势</Text>
				<View className="strengths-list">
					{profile.strengths.map((s) => (
						<View className="strength-chip" key={s}>
							<Text className="chip-text">{s}</Text>
						</View>
					))}
				</View>
			</View>

			{/* Workplace Style */}
			<View className="section">
				<Text className="section-title">职场表现</Text>
				<View className="info-card">
					<Text className="info-subtitle">团队协作</Text>
					<Text className="info-text">
						{profile.workplaceStyle.collaboration}
					</Text>
				</View>
				<View className="info-card">
					<Text className="info-subtitle">管理风格</Text>
					<Text className="info-text">{profile.workplaceStyle.management}</Text>
				</View>
				<View className="info-card">
					<Text className="info-subtitle">对微观管理的态度</Text>
					<Text className="info-text">
						{profile.workplaceStyle.microManagement}
					</Text>
				</View>
			</View>

			{/* Communication Style */}
			<View className="section">
				<Text className="section-title">沟通风格</Text>
				<View className="comm-grid">
					<View className="comm-card">
						<Text className="comm-title">你的表达方式</Text>
						{profile.communication.express.map((e) => (
							<View className="comm-item" key={e}>
								<Text className="comm-dot" style={{ color: typeColor }}>
									→
								</Text>
								<Text className="comm-text">{e}</Text>
							</View>
						))}
					</View>
					<View className="comm-card">
						<Text className="comm-title">如何与你沟通</Text>
						{profile.communication.receive.map((r) => (
							<View className="comm-item" key={r}>
								<Text className="comm-dot" style={{ color: "#94a3b8" }}>
									→
								</Text>
								<Text className="comm-text">{r}</Text>
							</View>
						))}
					</View>
				</View>
			</View>

			{/* Growth Habits */}
			<View className="section">
				<Text className="section-title">成长机会矩阵</Text>
				{profile.growthHabits.map((habit) => (
					<View className="habit-card" key={habit.title}>
						<Text className="habit-title" style={{ color: typeColor }}>
							{habit.title}
						</Text>
						<Text className="habit-label">{habit.label}</Text>
						<Text className="habit-desc">{habit.description}</Text>
					</View>
				))}
			</View>

			{/* Report Download CTA */}
			<View className="report-section">
				<Text className="report-title">完整深度报告</Text>
				<Text className="report-desc">
					30 页专业报告，包含行为盲点分析、职业路径建议、团队协作指南
				</Text>
				{isUnlocked ? (
					<View className="unlocked-badge">
						<Text className="unlocked-text">报告已解锁 ✓</Text>
					</View>
				) : (
					<View
						className="invite-unlock-btn"
						onClick={inviteLoading ? undefined : handleUnlock}
					>
						{unlockStatus && inviteCount > 0 ? (
							<Text className="invite-text">
								已有 {inviteCount}/{needed} 位好友完成 · 再邀请{" "}
								{needed - inviteCount} 位解锁
							</Text>
						) : (
							<Text className="invite-text">
								{inviteLoading
									? "生成邀请中..."
									: "邀请 2 位好友完成测评，免费解锁报告"}
							</Text>
						)}
					</View>
				)}
			</View>

			<View style={{ height: "80rpx" }} />

			{/* Invite Unlock Modal (T-017) */}
			{showInviteModal && (
				<View
					className="modal-overlay"
					onClick={() => setShowInviteModal(false)}
				>
					<View className="modal-card" onClick={(e) => e.stopPropagation()}>
						<Text className="modal-title">邀请好友解锁报告</Text>

						{/* Progress */}
						<View className="progress-track">
							{Array.from({ length: needed }, (_, i) => i).map((i) => (
								<View
									className={`progress-dot ${i < inviteCount ? "progress-dot-done" : ""}`}
									key={`dot-${i}`}
								/>
							))}
						</View>
						<Text className="progress-label">
							{inviteCount}/{needed} 位好友已完成测评
						</Text>

						<Text className="modal-desc">
							分享下方小程序码，好友完成测评即计入进度
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

						<Text className="polling-hint">页面每 5 秒自动刷新进度</Text>

						<View
							className="modal-close-btn"
							onClick={() => setShowInviteModal(false)}
						>
							<Text className="modal-close-text">关闭</Text>
						</View>
					</View>
				</View>
			)}
		</ScrollView>
	);
}
