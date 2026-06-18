import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import "./index.scss";

export default function Privacy() {
	useLoad(() => {
		Taro.setNavigationBarTitle({ title: "隐私政策" });
	});

	return (
		<ScrollView className="policy-page" scrollY>
			<View className="policy-content">
				<Text className="policy-title">隐私政策</Text>
				<Text className="policy-date">更新日期：2026年6月15日</Text>

				<Text className="policy-section-title">一、信息收集</Text>
				<Text className="policy-text">
					本小程序（DISC 职业性格测评）仅收集以下信息：{"\n"}
					1. 微信授权信息：当您选择微信登录时，我们会获取您的微信
					openid（不获取手机号、昵称等个人信息）；{"\n"}
					2. 测评结果数据：您的行为风格测评答案及得分数据；{"\n"}
					3. 设备信息：用于优化产品体验的基本设备标识信息。
				</Text>

				<Text className="policy-section-title">二、信息使用</Text>
				<Text className="policy-text">
					收集的信息仅用于：{"\n"}
					1. 为您提供 DISC 行为风格分析报告；{"\n"}
					2. 保存您的测评历史记录（可随时删除）；{"\n"}
					3. 改善产品功能和用户体验。{"\n\n"}
					我们不会将您的个人信息出售、出租或以任何方式提供给第三方。
				</Text>

				<Text className="policy-section-title">三、第三方 SDK</Text>
				<Text className="policy-text">
					本小程序仅使用以下第三方服务：{"\n"}• 微信登录
					SDK（腾讯）：用于微信一键登录和基础用户认证。{"\n"}
					我们不包含任何其他第三方广告追踪、营销推送或支付类 SDK。
				</Text>

				<Text className="policy-section-title">四、数据存储</Text>
				<Text className="policy-text">
					您的测评数据存储于：{"\n"}•
					本地存储（wx.setStorage）：默认方式，数据仅在您的设备上；{"\n"}•
					云端服务器：仅在您主动登录后，数据才会同步至云端，便于跨设备访问。
				</Text>

				<Text className="policy-section-title">五、数据删除</Text>
				<Text className="policy-text">
					您可以随时：{"\n"}
					1. 在「历史记录」页面删除单条测评记录；{"\n"}
					2. 在「我的」页面注销账号，将同步删除云端所有数据；{"\n"}
					3. 微信小程序设置中撤销授权，停止信息收集。
				</Text>

				<Text className="policy-section-title">六、未成年人</Text>
				<Text className="policy-text">
					本产品面向 18 周岁及以上用户。如您未满 18 周岁，请在监护人陪同下使用。
				</Text>

				<Text className="policy-section-title">七、联系我们</Text>
				<Text className="policy-text">
					如有任何隐私相关问题，请通过小程序内反馈功能联系我们。
				</Text>

				<View style={{ height: "80rpx" }} />
			</View>
		</ScrollView>
	);
}
