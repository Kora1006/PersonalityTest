import { themes } from "@PersonalityTest/api/data/themes/index";
import { Button, Image, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useDidShow, useLoad, useShareAppMessage } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/icon";
import {
	DISC_COLORS,
	type DiscType,
	getDominantLabel,
} from "../../data/disc-colors";
import { quizStore } from "../../utils/quiz-store";
import { storage } from "../../utils/storage";
import { getThemeHeroImage } from "../../utils/theme-images";
import { trpc } from "../../utils/trpc";
import "./index.scss";

interface UnlockStatus {
	inviteCount: number;
	isUnlocked: boolean;
	needed: number;
}

export default function Detail() {
	const [unlockStatus, setUnlockStatus] = useState<UnlockStatus | null>(null);
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [inviteLoading, setInviteLoading] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const [auditMode, setAuditMode] = useState(false);
	const [currentInvitation, setCurrentInvitation] = useState<{
		invitationId: string;
		inviterResultId: string;
	} | null>(null);
	const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const [result, setResult] = useState(quizStore.getLastResult());

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: "深度解析" });
		const r = quizStore.getLastResult();
		if (!r) {
			Taro.navigateBack();
			return;
		}
		setResult(r);
	});

	useDidShow(() => {
		if (!result) {
			return;
		}

		trpc
			.query<{ auditMode: boolean }>("getSettings")
			.then((cfg) => {
				setAuditMode(cfg.auditMode);
			})
			.catch(() => null);

		const user = storage.getUser();
		if (user) {
			trpc
				.query<UnlockStatus>("invitation.getUnlockStatus", {
					resultId: result.id,
				})
				.then(setUnlockStatus)
				.catch(() => null);
		}
	});

	useShareAppMessage((res) => {
		if (res.from === "button" && currentInvitation) {
			return {
				title: "帮我点一下，测测你的 DISC 性格，即可免费解锁性格画像！",
				path: `/pages/index/index?inv=${currentInvitation.invitationId}&rid=${currentInvitation.inviterResultId}`,
				imageUrl: getThemeHeroImage(result?.theme || "professional") || "",
			};
		}
		return {
			title: "想知道你的 DISC 性格画像吗？快来测测吧！",
			path: "/pages/index/index",
		};
	});

	useEffect(() => {
		if (showInviteModal && result) {
			const user = storage.getUser();
			if (user) {
				pollRef.current = setInterval(() => {
					trpc
						.query<UnlockStatus>("invitation.getUnlockStatus", {
							resultId: result.id,
						})
						.then((status) => {
							setUnlockStatus(status);
							if (status.isUnlocked) {
								if (pollRef.current) {
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
			}
		}
	}, [showInviteModal, result]);

	if (!result) {
		return <View className="detail-page" />;
	}

	const themeConfig =
		themes[result.theme ?? "professional"] ?? themes.professional;
	const primaryType = (result.dominantType.charAt(0) || "D") as DiscType;
	const typeContent = themeConfig.types[primaryType];
	const typeColor = DISC_COLORS[primaryType]?.hex || "#0058be";
	const score = result.scores[primaryType] || 0;

	const handleUnlock = async () => {
		const user = storage.getUser();
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
			setCurrentInvitation({
				invitationId: inv.invitationId,
				inviterResultId: result.id,
			});
			setShowInviteModal(true);

			// @ts-expect-error
			Taro.requestSubscribeMessage({
				tmplIds: [process.env.TARO_APP_SUBSCRIBE_TEMPLATE_ID ?? ""],
				success: () => null,
				fail: () => null,
			});
		} catch {
			Taro.showToast({ title: "生成邀请失败", icon: "none" });
		} finally {
			setInviteLoading(false);
		}
	};

	const handleDownloadPDF = async () => {
		const token = storage.getToken();
		if (!token) {
			Taro.showToast({ title: "请先登录后再下载", icon: "none" });
			return;
		}

		setDownloading(true);
		Taro.showLoading({ title: "正在下载 PDF..." });

		const baseUrl = process.env.TARO_APP_SERVER_URL ?? "http://localhost:3000";
		const downloadUrl = `${baseUrl}/report/download/${result.id}`;

		try {
			const res = await Taro.downloadFile({
				url: downloadUrl,
				header: {
					Authorization: `Bearer ${token}`,
				},
			});

			Taro.hideLoading();

			if (res.statusCode === 200) {
				Taro.showLoading({ title: "正在打开 PDF..." });
				await Taro.openDocument({
					filePath: res.tempFilePath,
					fileType: "pdf",
					showMenu: true,
					success: () => {
						Taro.hideLoading();
					},
					fail: (err) => {
						Taro.hideLoading();
						console.error("Open PDF fail:", err);
						Taro.showModal({
							title: "无法打开 PDF",
							content:
								"已成功下载，但无法在您的设备上打开预览。您可以复制下载链接到浏览器下载。",
							confirmText: "复制链接",
							success: (confirmRes) => {
								if (confirmRes.confirm) {
									Taro.setClipboardData({ data: downloadUrl });
								}
							},
						});
					},
				});
			} else {
				throw new Error(`HTTP Status ${res.statusCode}`);
			}
		} catch (err) {
			Taro.hideLoading();
			console.error("Download PDF error:", err);
			Taro.showModal({
				title: "下载失败",
				content:
					"请确保报告已付费或已通过分享解锁，或者您可以尝试复制链接到浏览器中访问。",
				confirmText: "复制链接",
				success: (confirmRes) => {
					if (confirmRes.confirm) {
						Taro.setClipboardData({ data: downloadUrl });
					}
				},
			});
		} finally {
			setDownloading(false);
		}
	};

	const isUnlocked =
		process.env.NODE_ENV === "development" ||
		auditMode ||
		(unlockStatus?.isUnlocked ?? false);
	const inviteCount = unlockStatus?.inviteCount ?? 0;
	const needed = unlockStatus?.needed ?? 2;

	return (
		<View className="detail-page-container">
			{/* Theme background mesh */}
			<Image
				className="detail-bg-mesh"
				mode="aspectFill"
				src={getThemeHeroImage(result.theme)}
			/>
			<ScrollView className="detail-page" scrollY>
				{/* Header */}
				<View className="detail-header">
					<View
						className="type-icon"
						style={{ backgroundColor: `${typeColor}15` }}
					>
						<Text className="type-letter" style={{ color: typeColor }}>
							{result.dominantType}
						</Text>
					</View>
					<View className="type-info">
						<Text className="type-name">
							{result.dominantType.length === 2
								? `${DISC_COLORS[result.dominantType.charAt(0) as DiscType].label}/${DISC_COLORS[result.dominantType.charAt(1) as DiscType].label} 复合型`
								: typeContent.name}
						</Text>
						<Text className="type-fullname">
							主要类型：{getDominantLabel(result.dominantType)}
						</Text>
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
					<View className="section-header-flex">
						<Icon
							color={typeColor}
							name="workspace_premium"
							size={36}
							style={{ marginRight: "12rpx" }}
						/>
						<Text className="section-title">核心优势</Text>
					</View>
					<View className="strengths-list">
						{typeContent.strengths.map((s) => (
							<View className="strength-chip" key={s}>
								<Text className="chip-text">{s}</Text>
							</View>
						))}
					</View>
				</View>

				{/* Deep Analysis — 3 themed sections */}
				<View className="section">
					<View className="section-header-flex">
						<Icon
							color={typeColor}
							name="corporate_fare"
							size={36}
							style={{ marginRight: "12rpx" }}
						/>
						<Text className="section-title">
							{typeContent.detailAnalysis.section1Title}
						</Text>
					</View>
					<View className="info-card">
						<Text className="info-text">
							{typeContent.detailAnalysis.section1Content}
						</Text>
					</View>
				</View>

				<View className="section">
					<View className="section-header-flex">
						<Icon
							color={typeColor}
							name="forum"
							size={36}
							style={{ marginRight: "12rpx" }}
						/>
						<Text className="section-title">
							{typeContent.detailAnalysis.section2Title}
						</Text>
					</View>
					<View className="info-card">
						<Text className="info-text">
							{typeContent.detailAnalysis.section2Content}
						</Text>
					</View>
				</View>

				<View className="section">
					<View className="section-header-flex">
						<Icon
							color={typeColor}
							name="psychology"
							size={36}
							style={{ marginRight: "12rpx" }}
						/>
						<Text className="section-title">
							{typeContent.detailAnalysis.section3Title}
						</Text>
					</View>
					<View className="info-card">
						<Text className="info-text">
							{typeContent.detailAnalysis.section3Content}
						</Text>
					</View>
				</View>

				{/* Growth Areas */}
				<View className="section">
					<View className="section-header-flex">
						<Icon
							color={typeColor}
							name="trending_up"
							size={36}
							style={{ marginRight: "12rpx" }}
						/>
						<Text className="section-title">成长机会</Text>
					</View>
					<View className="growth-grid">
						{typeContent.growthAreas.map((area, idx) => (
							<View className="habit-card" key={area}>
								<Text className="habit-title" style={{ color: typeColor }}>
									SUGGESTION {idx + 1}
								</Text>
								<Text className="habit-desc">{area}</Text>
							</View>
						))}
					</View>
				</View>

				{/* Report Download CTA */}
				<View className="report-section">
					<Text className="report-title">解锁完整档案</Text>
					<Text className="report-desc">
						获取完整的 30 页 PDF 分析，包括盲点和团队动态。
					</Text>
					{isUnlocked ? (
						<View className="unlocked-container">
							<View className="unlocked-badge">
								<Text className="unlocked-text">报告已解锁 ✓</Text>
							</View>
							<View
								className="download-pdf-btn"
								onClick={downloading ? undefined : handleDownloadPDF}
							>
								<Text className="download-text">
									{downloading ? "正在生成..." : "下载并打开完整 PDF 报告"}
								</Text>
							</View>
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

				{/* Invite Unlock Modal */}
				{showInviteModal && (
					<View
						className="modal-overlay"
						onClick={() => setShowInviteModal(false)}
					>
						<View className="modal-card" onClick={(e) => e.stopPropagation()}>
							<Text className="modal-title">邀请好友解锁报告</Text>

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
								直接发送给微信好友，好友点击完成测评即可为您增加进度。
							</Text>

							{currentInvitation && (
								<Button
									className="modal-share-btn"
									onClick={() => setShowInviteModal(false)}
									openType="share"
								>
									发送给微信好友
								</Button>
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
		</View>
	);
}
