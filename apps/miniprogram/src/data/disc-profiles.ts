import type { DiscType } from "./disc-colors";

export interface DiscProfile {
	careers: string[];
	communication: {
		express: string[];
		receive: string[];
	};
	description: string;
	fullName: string;
	growthAreas: string[];
	growthHabits: {
		description: string;
		icon: string;
		label: string;
		title: string;
	}[];
	icon: string;
	name: string;
	strengths: string[];
	tagline: string;
	type: DiscType;
	workplaceStyle: {
		collaboration: string;
		management: string;
		microManagement: string;
	};
}

export const DISC_PROFILES: Record<DiscType, DiscProfile> = {
	D: {
		type: "D",
		name: "支配型",
		fullName: "Dominance",
		tagline: "天生的领导者，目标驱动",
		description:
			"你是一个高效的行动派，善于设定目标、做出决策并推动团队实现成果。你天生具有领导魅力，面对挑战时充满斗志，不惧压力，专注结果。",
		icon: "bolt",
		strengths: ["决断力强", "目标明确", "执行力超强", "勇于挑战", "独立自主"],
		growthAreas: ["注重细节", "倾听他人", "耐心沟通", "控制节奏"],
		careers: ["创业者", "项目总监", "销售总监", "运营负责人", "战略顾问"],
		workplaceStyle: {
			collaboration:
				"你在团队中主动承担领导角色，喜欢清晰的分工与快速的决策机制。你推动进度、不拖延，但有时可能忽略团队成员的情感需求。",
			management:
				'作为管理者，你设定高标准并期望下属自驱完成目标。你给予充分授权，但当结果不达预期时会直接介入，不喜欢"被管理"。',
			microManagement:
				"你讨厌过多的审批流程和汇报层级，希望有足够的自主权来快速行动。过度控制的工作环境会让你感到窒息。",
		},
		communication: {
			express: [
				"直接、简洁，省去不必要的寒暄，直奔主题",
				"以结果和影响为中心表达观点，少用感情色彩",
				"在压力下表达更果断，有时显得咄咄逼人",
			],
			receive: [
				"简明扼要地陈述核心问题和解决方案",
				"用数据和结果说话，避免情绪化表达",
				"给予足够的决策权，让他自主推进",
			],
		},
		growthHabits: [
			{
				title: "PATIENCE",
				label: "耐心倾听",
				description: "在提供解决方案之前先积极倾听，理解他人的顾虑和想法。",
				icon: "hearing",
			},
			{
				title: "EMPATHY",
				label: "共情他人",
				description: "认可团队情感以建立更强的凝聚力，关注过程而非只看结果。",
				icon: "favorite",
			},
			{
				title: "DETAIL",
				label: "注重细节",
				description: "在追求进展的过程中不要忽视小细节，细节决定质量。",
				icon: "search",
			},
		],
	},
	I: {
		type: "I",
		name: "影响型",
		fullName: "Influence",
		tagline: "感染力十足的沟通大师",
		description:
			"你热情开朗、充满创造力，擅长通过沟通和感染力激励他人。在社交和团队协作场合中，你总能成为凝聚人心的核心，带动整体氛围向上。",
		icon: "group",
		strengths: ["沟通表达", "激励他人", "创意思维", "乐观向上", "善于社交"],
		growthAreas: ["注重细节", "专注执行", "时间管理", "坚持收尾"],
		careers: ["市场营销", "公关传播", "培训讲师", "品牌经理", "内容创作者"],
		workplaceStyle: {
			collaboration:
				"你是天生的团队激励者，擅长用热情感染团队，推动协作。你喜欢开放的讨论环境，享受创意碰撞。",
			management:
				"作为管理者，你善于鼓励和认可下属，建立积极的团队文化。你较少关注细节执行，重点放在凝聚力和方向上。",
			microManagement:
				"你喜欢灵活自由的工作方式，过于刻板的流程和规定会限制你的创意发挥。你需要能够即兴发挥的空间。",
		},
		communication: {
			express: [
				"语言生动富有感染力，善于用故事和比喻传递想法",
				"热情洋溢，表达时充满肢体语言和面部表情",
				"喜欢互动和反馈，单向汇报会让你感到乏味",
			],
			receive: [
				"以友好轻松的方式开场，建立情感联结再谈正事",
				"认可他的想法和热情，避免直接否定",
				"给予足够的发言机会，让他充分表达",
			],
		},
		growthHabits: [
			{
				title: "FOCUS",
				label: "专注收尾",
				description: "将热情转化为持久的行动力，从开始到收尾都保持投入。",
				icon: "center_focus_strong",
			},
			{
				title: "STRUCTURE",
				label: "建立结构",
				description: "为创意和想法建立可执行的框架，让好点子真正落地。",
				icon: "account_tree",
			},
			{
				title: "LISTENING",
				label: "深度倾听",
				description: "在分享之前先充分倾听，深入理解对方真正想表达的内容。",
				icon: "hearing",
			},
		],
	},
	S: {
		type: "S",
		name: "稳健型",
		fullName: "Steadiness",
		tagline: "团队中的可靠基石",
		description:
			"你耐心体贴、值得信赖，是团队中的稳定力量。你善于倾听、协调关系，并在持续稳定的环境中发挥最佳状态，是同事们最信任的伙伴。",
		icon: "balance",
		strengths: ["耐心可靠", "善于倾听", "团队协作", "忠诚稳定", "共情能力"],
		growthAreas: ["主动表达", "勇于变化", "设定边界", "快速决策"],
		careers: ["人力资源", "客户成功", "心理咨询", "行政管理", "社会工作"],
		workplaceStyle: {
			collaboration:
				'你是团队中的"黏合剂"，善于协调成员间的分歧，维护和谐的工作关系。你倾向于在背后默默付出，确保每个人都感到被尊重。',
			management:
				"作为管理者，你关注团队成员的个人发展和情感状态，努力营造安全信任的氛围。你的决策往往经过充分考量，较为稳健。",
			microManagement:
				"你习惯稳定可预期的工作节奏，频繁的变化和突发任务会让你感到压力。需要足够的准备时间来适应新要求。",
		},
		communication: {
			express: [
				"表达温和有礼，措辞经过深思熟虑，避免冒犯他人",
				"更擅长一对一的深度交流，大型公开场合会感到不适",
				'倾向于用"我们"而非"我"，强调集体而非个人',
			],
			receive: [
				"提前告知变化，给予足够的适应时间",
				"以真诚关怀的态度沟通，避免强迫和施压",
				"认可他的贡献和付出，让他感到被重视",
			],
		},
		growthHabits: [
			{
				title: "ASSERTIVENESS",
				label: "主动表达",
				description: "勇于表达自己的需求和观点，不要总是把他人放在第一位。",
				icon: "record_voice_over",
			},
			{
				title: "ADAPTABILITY",
				label: "拥抱变化",
				description: "将变化视为成长的机会，培养在不确定环境中快速适应的能力。",
				icon: "change_circle",
			},
			{
				title: "BOUNDARIES",
				label: "设定边界",
				description: '学会说"不"，保护自己的时间和精力，避免过度承诺。',
				icon: "shield",
			},
		],
	},
	C: {
		type: "C",
		name: "谨慎型",
		fullName: "Compliance",
		tagline: "精准思考的质量守门人",
		description:
			"你逻辑严谨、注重细节，善于分析复杂问题并找出最优解。你对质量有极高标准，能在需要精确性的工作中表现出色，是团队的质量保障。",
		icon: "fact_check",
		strengths: ["逻辑分析", "注重质量", "系统思考", "严谨细致", "问题诊断"],
		growthAreas: ["接受不完美", "快速行动", "人际沟通", "灵活变通"],
		careers: ["数据分析师", "审计师", "研究员", "工程师", "法律顾问"],
		workplaceStyle: {
			collaboration:
				"你在团队中承担质量把关的角色，确保输出符合高标准。你偏好有明确规范和流程的协作环境，在混乱中难以发挥。",
			management:
				"作为管理者，你设定清晰的标准和期望，注重流程规范和结果质量。你对细节的把控有时会让下属感到压力。",
			microManagement:
				"你对不确定性有较低的容忍度，喜欢充足的信息才能做决策。不完善的计划和仓促的执行让你感到不安。",
		},
		communication: {
			express: [
				"逻辑清晰，数据翔实，每个论点都有充分依据",
				"表达谨慎，在确定之前不轻易作出承诺",
				"书面沟通优于口头沟通，更擅长用文字梳理思路",
			],
			receive: [
				"提供充足的背景信息和数据支撑，让他充分评估",
				"避免催促，给予足够的思考和准备时间",
				"直接提出具体问题，避免模糊不清的要求",
			],
		},
		growthHabits: [
			{
				title: "DECISIVENESS",
				label: "果断行动",
				description: '在信息不完整时也能做出决策，接受"足够好"而非追求完美。',
				icon: "bolt",
			},
			{
				title: "CONNECTION",
				label: "建立联结",
				description: "主动关注团队成员的情感和需求，不仅仅聚焦于任务和数据。",
				icon: "handshake",
			},
			{
				title: "FLEXIBILITY",
				label: "灵活变通",
				description: "在规则之外留有弹性，有时打破常规才能找到更好的解决方案。",
				icon: "tune",
			},
		],
	},
};
