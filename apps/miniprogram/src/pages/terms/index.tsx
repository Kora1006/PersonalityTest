import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import "./index.scss";

export default function Terms() {
	useLoad(() => {
		Taro.setNavigationBarTitle({ title: "用户协议" });
	});

	return (
		<ScrollView className="policy-page" scrollY>
			<View className="policy-content">
				<Text className="policy-title">用户协议</Text>
				<Text className="policy-date">更新日期：2026年6月15日</Text>

				<Text className="policy-section-title">一、服务说明</Text>
				<Text className="policy-text">
					DISC 职业性格测评（以下简称「本产品」）提供基于 DISC
					模型的行为风格分析服务。本测评结果仅供个人参考，不构成任何医学建议、心理诊断或职业决策依据。
				</Text>

				<Text className="policy-section-title">二、使用规范</Text>
				<Text className="policy-text">
					您同意不将本产品用于：{"\n"}
					1. 任何违反中华人民共和国法律法规的用途；{"\n"}
					2. 歧视他人或对他人做出不当评价；{"\n"}
					3. 商业性转售或二次开发（未获书面授权）。
				</Text>

				<Text className="policy-section-title">三、邀请解锁与报告获取</Text>
				<Text className="policy-text">
					本产品的所有测评服务和分析报告均为免费提供。部分深度分析报告可通过邀请好友完成测评来免费解锁。我们承诺本产品内不包含任何计费项目或付费解锁服务。
				</Text>

				<Text className="policy-section-title">四、免责声明</Text>
				<Text className="policy-text">
					1. 本测评为行为风格参考工具，非心理健康评估工具；{"\n"}
					2. 测评结果因个人作答状态不同可能存在差异；{"\n"}
					3. 本产品不承担因测评结果被不当使用而产生的责任。
				</Text>

				<Text className="policy-section-title">五、知识产权</Text>
				<Text className="policy-text">
					本产品的所有内容（题目、分析文案、设计等）均受著作权法保护，未经授权不得复制或传播。
				</Text>

				<Text className="policy-section-title">六、协议更新</Text>
				<Text className="policy-text">
					我们保留随时更新本协议的权利。重大变更将通过小程序通知您。继续使用本产品视为同意更新后的协议。
				</Text>

				<View style={{ height: "80rpx" }} />
			</View>
		</ScrollView>
	);
}
