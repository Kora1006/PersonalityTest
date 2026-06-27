import { Input, ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import { api } from "../../utils/request";
import { storage } from "../../utils/storage";
import { syncLocalHistoryToServer } from "../../utils/trpc";
import "./index.scss";

type Tab = "login" | "register";

export default function Auth() {
	const [tab, setTab] = useState<Tab>("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState(() => storage.getUser());

	const [isEditingAccount, setIsEditingAccount] = useState(false);
	const [newName, setNewName] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	useLoad(() => {
		Taro.setNavigationBarTitle({ title: "我的" });
		setUser(storage.getUser());
	});

	const openAccountSettings = () => {
		setNewName(user?.name || "");
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setIsEditingAccount(true);
	};

	const handleSaveAccount = async () => {
		if (!newName.trim()) {
			Taro.showToast({ title: "昵称不能为空", icon: "none" });
			return;
		}

		setLoading(true);
		try {
			// 1. Update nickname if changed
			if (newName !== user?.name) {
				await api.post("/api/auth/update-user", { name: newName }, false);
				const updatedUser = { ...user!, name: newName };
				storage.setUser(updatedUser);
				setUser(updatedUser);
			}

			// 2. Update password if newPassword is input
			if (newPassword) {
				if (newPassword.length < 6) {
					Taro.showToast({ title: "新密码至少 6 位", icon: "none" });
					return;
				}
				if (newPassword !== confirmPassword) {
					Taro.showToast({ title: "两次密码不一致", icon: "none" });
					return;
				}
				if (!currentPassword) {
					Taro.showToast({ title: "请输入当前密码", icon: "none" });
					return;
				}
				await api.post(
					"/api/auth/change-password",
					{ currentPassword, newPassword },
					false
				);
			}

			Taro.showToast({ title: "保存成功", icon: "success" });
			setIsEditingAccount(false);
		} catch (err: any) {
			Taro.showToast({
				title: err?.message || "修改失败，请检查密码是否正确",
				icon: "none",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleLogin = async () => {
		if (!agreedToTerms) {
			Taro.showToast({
				title: "请先勾选同意《用户协议》与《隐私政策》",
				icon: "none",
			});
			return;
		}
		if (!(email && password)) {
			Taro.showToast({ title: "请填写邮箱和密码", icon: "none" });
			return;
		}
		setLoading(true);
		try {
			const res = await api.post<{
				token: string;
				user: { id: string; name: string; email: string };
			}>("/api/auth/sign-in/email", { email, password }, false);
			storage.setToken(res.token);
			storage.setUser(res.user);
			setUser(res.user);
			syncLocalHistoryToServer().catch(() => null);
			Taro.showToast({ title: "登录成功", icon: "success" });
		} catch {
			Taro.showToast({ title: "登录失败，请检查账号密码", icon: "none" });
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async () => {
		if (!agreedToTerms) {
			Taro.showToast({
				title: "请先勾选同意《用户协议》与《隐私政策》",
				icon: "none",
			});
			return;
		}
		if (!(email && password && name)) {
			Taro.showToast({ title: "请填写完整信息", icon: "none" });
			return;
		}
		if (password.length < 6) {
			Taro.showToast({ title: "密码至少 6 位", icon: "none" });
			return;
		}
		setLoading(true);
		try {
			const res = await api.post<{
				token: string;
				user: { id: string; name: string; email: string };
			}>("/api/auth/sign-up/email", { email, password, name }, false);
			storage.setToken(res.token);
			storage.setUser(res.user);
			setUser(res.user);
			syncLocalHistoryToServer().catch(() => null);
			Taro.showToast({ title: "注册成功", icon: "success" });
		} catch {
			Taro.showToast({ title: "注册失败，邮箱可能已被使用", icon: "none" });
		} finally {
			setLoading(false);
		}
	};

	const handleWechatLogin = () => {
		if (!agreedToTerms) {
			Taro.showToast({
				title: "请先勾选同意《用户协议》与《隐私政策》",
				icon: "none",
			});
			return;
		}
		console.log("[Auth Page] Starting WeChat login...");
		Taro.login({
			success: async (loginRes) => {
				console.log("[Auth Page] Taro.login success:", loginRes);
				if (!loginRes.code) {
					Taro.showToast({
						title: "微信登录失败：未获取到 code",
						icon: "none",
					});
					return;
				}
				setLoading(true);
				try {
					const res = await api.post<{
						token: string;
						user: { id: string; name: string; email: string };
					}>(
						"/api/auth/wechat/miniprogram-login",
						{ code: loginRes.code },
						false
					);
					console.log("[Auth Page] WeChat login API response:", res);
					storage.setToken(res.token);
					storage.setUser(res.user);
					setUser(res.user);
					syncLocalHistoryToServer().catch(() => null);
					Taro.showToast({ title: "微信登录成功", icon: "success" });
				} catch (err: any) {
					console.error("[Auth Page] WeChat login API failed:", err);
					const msg = err?.message || "网络请求失败";
					Taro.showToast({ title: `微信登录失败: ${msg}`, icon: "none" });
				} finally {
					setLoading(false);
				}
			},
			fail: (err) => {
				console.error("[Auth Page] Taro.login API failed:", err);
				Taro.showToast({
					title: `调用微信登录失败: ${err.errMsg || "未知错误"}`,
					icon: "none",
				});
			},
		});
	};

	const handleLogout = () => {
		Taro.showModal({
			title: "确认退出",
			content: "退出登录后，历史记录仅保存在本地",
			success: (res) => {
				if (res.confirm) {
					storage.clearToken();
					setUser(null);
					Taro.showToast({ title: "已退出登录", icon: "success" });
				}
			},
		});
	};

	// Logged in state
	if (user) {
		if (isEditingAccount) {
			return (
				<ScrollView className="auth-page" scrollY>
					<View className="auth-header">
						<Text className="auth-title">账号设置</Text>
						<Text className="auth-subtitle">修改您的昵称或密码</Text>
					</View>

					<View className="form-section">
						<View className="form-field">
							<Text className="field-label">昵称</Text>
							<Input
								className="field-input"
								onInput={(e) => setNewName(e.detail.value)}
								placeholder="请输入昵称"
								placeholderClass="field-placeholder"
								value={newName}
							/>
						</View>

						<View className="form-field">
							<Text className="field-label">当前密码</Text>
							<Input
								className="field-input"
								onInput={(e) => setCurrentPassword(e.detail.value)}
								password
								placeholder="修改密码时需输入当前密码"
								placeholderClass="field-placeholder"
								value={currentPassword}
							/>
						</View>

						<View className="form-field">
							<Text className="field-label">新密码</Text>
							<Input
								className="field-input"
								onInput={(e) => setNewPassword(e.detail.value)}
								password
								placeholder="请输入新密码（至少 6 位）"
								placeholderClass="field-placeholder"
								value={newPassword}
							/>
						</View>

						<View className="form-field">
							<Text className="field-label">确认密码</Text>
							<Input
								className="field-input"
								onInput={(e) => setConfirmPassword(e.detail.value)}
								password
								placeholder="请再次输入新密码"
								placeholderClass="field-placeholder"
								value={confirmPassword}
							/>
						</View>

						<View
							className={`submit-btn ${loading ? "submit-disabled" : ""}`}
							onClick={loading ? undefined : handleSaveAccount}
						>
							<Text className="submit-text">
								{loading ? "请稍候..." : "保存修改"}
							</Text>
						</View>

						<View
							className="cancel-btn"
							onClick={() => setIsEditingAccount(false)}
						>
							<Text className="cancel-text">返回</Text>
						</View>
					</View>
				</ScrollView>
			);
		}

		return (
			<ScrollView className="auth-page" scrollY>
				<View className="profile-section">
					<View className="avatar">
						<Text className="avatar-text">
							{user.name.charAt(0).toUpperCase()}
						</Text>
					</View>
					<Text className="profile-name">{user.name}</Text>
					<Text className="profile-email">{user.email || "微信绑定账户"}</Text>
				</View>

				<View className="menu-section">
					<View className="menu-item" onClick={openAccountSettings}>
						<Text className="menu-label">账号设置</Text>
						<Text className="menu-arrow">→</Text>
					</View>
				</View>

				<View className="logout-btn" onClick={handleLogout}>
					<Text className="logout-text">退出登录</Text>
				</View>

				<View className="footer-links">
					<Text
						className="footer-link"
						onClick={() => Taro.navigateTo({ url: "/pages/terms/index" })}
					>
						《用户协议》
					</Text>
					<Text className="footer-separator">|</Text>
					<Text
						className="footer-link"
						onClick={() => Taro.navigateTo({ url: "/pages/privacy/index" })}
					>
						《隐私政策》
					</Text>
				</View>
			</ScrollView>
		);
	}

	// Not logged in
	return (
		<ScrollView className="auth-page" scrollY>
			<View className="auth-header">
				<Text className="auth-title">欢迎使用</Text>
				<Text className="auth-subtitle">
					登录后可云端同步测评历史，跨设备访问
				</Text>
			</View>

			{/* Tab Switch */}
			<View className="tab-bar">
				<View
					className={`tab-item ${tab === "login" ? "tab-active" : ""}`}
					onClick={() => setTab("login")}
				>
					<Text className="tab-text">登录</Text>
				</View>
				<View
					className={`tab-item ${tab === "register" ? "tab-active" : ""}`}
					onClick={() => setTab("register")}
				>
					<Text className="tab-text">注册</Text>
				</View>
			</View>

			{/* Form */}
			<View className="form-section">
				{tab === "register" && (
					<View className="form-field">
						<Text className="field-label">昵称</Text>
						<Input
							className="field-input"
							onInput={(e) => setName(e.detail.value)}
							placeholder="请输入你的昵称"
							placeholderClass="field-placeholder"
							value={name}
						/>
					</View>
				)}

				<View className="form-field">
					<Text className="field-label">邮箱</Text>
					<Input
						className="field-input"
						onInput={(e) => setEmail(e.detail.value)}
						placeholder="请输入邮箱"
						placeholderClass="field-placeholder"
						type="text"
						value={email}
					/>
				</View>

				<View className="form-field">
					<Text className="field-label">密码</Text>
					<Input
						className="field-input"
						onInput={(e) => setPassword(e.detail.value)}
						password
						placeholder={
							tab === "register" ? "至少 6 位，包含字母和数字" : "请输入密码"
						}
						placeholderClass="field-placeholder"
						value={password}
					/>
				</View>

				<View
					className={`submit-btn ${loading ? "submit-disabled" : ""}`}
					onClick={
						loading ? undefined : tab === "login" ? handleLogin : handleRegister
					}
				>
					<Text className="submit-text">
						{loading ? "请稍候..." : tab === "login" ? "登录" : "注册"}
					</Text>
				</View>
			</View>

			{/* WeChat Login */}
			<View className="divider">
				<View className="divider-line" />
				<Text className="divider-text">或</Text>
				<View className="divider-line" />
			</View>

			<View
				className="wechat-btn"
				onClick={loading ? undefined : handleWechatLogin}
			>
				<Text className="wechat-text">微信一键登录</Text>
			</View>

			<View
				className="terms-checkbox-wrap"
				onClick={() => setAgreedToTerms(!agreedToTerms)}
			>
				<View
					className={`checkbox-box ${agreedToTerms ? "checkbox-checked" : ""}`}
				>
					{agreedToTerms && <Text className="checkbox-checkmark">✓</Text>}
				</View>
				<Text className="terms-checkbox-text">
					我已阅读并同意
					<Text
						className="terms-link"
						onClick={(e) => {
							e.stopPropagation();
							Taro.navigateTo({ url: "/pages/terms/index" });
						}}
					>
						《用户协议》
					</Text>
					与
					<Text
						className="terms-link"
						onClick={(e) => {
							e.stopPropagation();
							Taro.navigateTo({ url: "/pages/privacy/index" });
						}}
					>
						《隐私政策》
					</Text>
				</Text>
			</View>
		</ScrollView>
	);
}
