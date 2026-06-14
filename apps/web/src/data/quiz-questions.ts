export type DiscChoice = "D" | "I" | "S" | "C";

export interface QuestionOption {
	subtitle: string;
	text: string;
	type: DiscChoice;
}

export interface Question {
	category: string;
	id: number;
	options: QuestionOption[];
	scenario: string;
}

export const QUIZ_QUESTIONS: Question[] = [
	{
		id: 1,
		category: "DECISION MAKING",
		scenario: "当团队面临紧急决策时，你倾向于怎么做？",
		options: [
			{
				text: "迅速做出决定并推进执行，不让团队陷入等待",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "激励团队成员共同讨论，营造积极的决策氛围",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "收集所有人的意见，确保每个人都接受最终决定",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "仔细分析所有可用数据，确保决策有充分依据",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 2,
		category: "DECISION MAKING",
		scenario: "在没有充分信息的情况下，你如何做决定？",
		options: [
			{
				text: "基于直觉和经验果断行动，把握先机",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "和团队头脑风暴，集思广益找到创意解决方案",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "先征求前辈或专家的建议，再谨慎决定",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "推迟决定，花更多时间收集必要的信息",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 3,
		category: "WORK STYLE",
		scenario: "面对一个大型项目，你的工作方式是？",
		options: [
			{
				text: "直接设定目标并快速推进，关注最终结果",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "与团队成员合作，保持高涨的工作热情",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "制定稳健的计划，按部就班地完成每个步骤",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "详细规划每个环节，确保质量和准确性",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 4,
		category: "WORK STYLE",
		scenario: "当工作压力增大时，你的反应是？",
		options: [
			{
				text: "增加工作强度，更积极地推动结果落地",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "寻求团队支持，用积极心态感染周围的人",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "保持冷静，有条不紊地处理一件件任务",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "重新审视计划，找出哪些步骤可以优化",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 5,
		category: "TEAM DYNAMICS",
		scenario: "在一个团队项目中，你最常扮演的角色是？",
		options: [
			{
				text: "领导者，推动团队聚焦目标、快速行动",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "激励者，鼓励团队保持活力和创造力",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "协调者，确保每个人都感到被倾听和尊重",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "分析者，审核计划的可行性和细节准确性",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 6,
		category: "TEAM DYNAMICS",
		scenario: "当团队成员意见不一致时，你通常怎么处理？",
		options: [
			{
				text: "直接表明自己的立场，推动团队做出决定",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "用热情和说服力让大家统一在最佳方案上",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "耐心倾听各方意见，寻求大家都能接受的共识",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "客观地评估每个方案的利弊，找出最优解",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 7,
		category: "CONFLICT HANDLING",
		scenario: "当你和同事发生分歧时，你的第一反应是？",
		options: [
			{
				text: "直接说出自己的想法，据理力争",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "保持友好，尝试找到双方都满意的解决方式",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "退后一步，给对方时间和空间，不急于解决",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "寻找客观事实和数据，理性分析谁更有道理",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 8,
		category: "CONFLICT HANDLING",
		scenario: "当你的方案被否定时，你通常会怎么做？",
		options: [
			{
				text: "坚持自己的观点，用更有力的论据争取支持",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "调整策略，用更有感染力的方式重新展示想法",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "接受反馈，认真倾听对方的顾虑后再改进",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "重新研究数据，找出方案被否定的根本原因",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 9,
		category: "COMMUNICATION",
		scenario: "在向上级汇报工作时，你倾向于？",
		options: [
			{
				text: "直接汇报关键结果和下一步行动计划",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "用生动的故事和例子展示工作的价值和影响",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "有条理地呈现进展，确保没有遗漏任何细节",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "准备详尽的数据报告，用事实和逻辑说话",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 10,
		category: "COMMUNICATION",
		scenario: "接受工作反馈时，你最看重的是？",
		options: [
			{
				text: "是否具体指出了哪里有待改进，能否帮我更快达到目标",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "反馈是否以鼓励为主，让我保持前进的动力",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "对方是否理解我的出发点，反馈是否公平",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "反馈是否基于客观标准，逻辑是否严谨",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 11,
		category: "PROBLEM SOLVING",
		scenario: "遇到一个棘手的问题时，你的第一步是？",
		options: [
			{
				text: "快速找出影响最大的因素，优先解决关键问题",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "和团队成员一起讨论，发散思维找灵感",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "回顾以往类似问题的解决方法，借鉴经验",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "系统分析问题的根本原因，列出所有可能的解决方案",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 12,
		category: "PROBLEM SOLVING",
		scenario: "当你的解决方案执行后效果不理想时，你会？",
		options: [
			{
				text: "迅速调整策略，尝试新的方法",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "鼓励团队不要气馁，共同寻找更好的出路",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "耐心分析哪里出了问题，稳扎稳打地做出调整",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "重新审视所有假设和数据，找出分析中的错误",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 13,
		category: "WORK STYLE",
		scenario: "当你需要学习一项新技能时，你倾向于？",
		options: [
			{
				text: "直接上手实践，通过犯错来快速成长",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "和他人一起学习，在互动和分享中获得动力",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "找一个稳定的学习路径，按步骤扎实掌握",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "先阅读大量资料，深入理解原理再动手",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 14,
		category: "DECISION MAKING",
		scenario: "当有多个重要任务同时出现时，你如何处理？",
		options: [
			{
				text: "快速判断优先级，强力推进最重要的任务",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "看哪个任务更能激发自己的热情，先做那个",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "按计划稳步处理，避免因跳跃而影响质量",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "制作详细的任务清单，系统地分配时间和资源",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 15,
		category: "TEAM DYNAMICS",
		scenario: "在一个新团队中，你通常如何建立关系？",
		options: [
			{
				text: "主动承担领导角色，通过成果证明自己的价值",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "积极社交，用热情和幽默拉近与同事的距离",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "认真观察，先了解团队文化，再慢慢融入",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "专注于工作表现，让专业能力为自己说话",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 16,
		category: "CONFLICT HANDLING",
		scenario: "你如何应对工作中的不确定性和变化？",
		options: [
			{
				text: "把变化看作机会，快速适应并抢占先机",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "保持乐观，相信事情最终会向好的方向发展",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "先稳住阵脚，等局势明朗后再做出判断",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "评估变化带来的风险，制定应对不同情况的预案",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 17,
		category: "COMMUNICATION",
		scenario: "当你需要说服他人接受你的想法时，你会？",
		options: [
			{
				text: "直接指出执行这个想法能带来的具体利益",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "用热情的态度和引人入胜的故事打动对方",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "耐心解释自己的考量，建立信任后再推进",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "用翔实的数据和逻辑论证想法的可行性",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 18,
		category: "PROBLEM SOLVING",
		scenario: "面对一个没有明确答案的问题，你会？",
		options: [
			{
				text: "大胆提出假设并快速验证，不怕失败",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "发散思维，探索各种有趣的可能性",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "参考以往经验和成功案例，寻找稳妥方案",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "深入研究问题的每个方面，直到找到最优解",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 19,
		category: "WORK STYLE",
		scenario: "你认为高效工作最重要的是？",
		options: [
			{
				text: "清晰的目标和结果导向，减少不必要的过程",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "充满热情的团队氛围和相互激励的环境",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "稳定的节奏和可靠的协作关系",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "严谨的流程和高质量的输出标准",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 20,
		category: "DECISION MAKING",
		scenario: "当计划被突然打乱时，你倾向于？",
		options: [
			{
				text: "立即重新规划，快速恢复行动节奏",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "保持灵活，轻松地适应变化并保持正能量",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "沉着冷静，有序地重新整理优先级",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "分析变化原因，评估对整体计划的影响",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 21,
		category: "TEAM DYNAMICS",
		scenario: "在你看来，一个优秀的团队最重要的特质是？",
		options: [
			{
				text: "执行力强、目标一致、行动迅速",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "充满活力、善于沟通、具有感染力",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "相互信任、稳定可靠、协作无间",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "专业严谨、注重质量、做事有条理",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 22,
		category: "COMMUNICATION",
		scenario: "在会议中，你通常会？",
		options: [
			{
				text: "主导议程，推动讨论聚焦和快速得出结论",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "活跃气氛，让会议充满能量和互动",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "认真倾听，在适当时机表达深思熟虑的意见",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "关注会议逻辑，指出讨论中的不严谨之处",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 23,
		category: "PROBLEM SOLVING",
		scenario: "当你发现团队犯了一个错误时，你会？",
		options: [
			{
				text: "直接指出问题，推动团队立即采取纠正措施",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "以鼓励为主，帮助团队从错误中找到积极的一面",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "私下和相关成员沟通，避免让对方感到难堪",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "详细记录错误原因，制定流程以避免类似问题",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
	{
		id: 24,
		category: "WORK STYLE",
		scenario: "下班后，你最常做的事情是？",
		options: [
			{
				text: "思考如何进一步推进工作目标，或准备明天的计划",
				subtitle: "DECISIVE & ASSERTIVE",
				type: "D",
			},
			{
				text: "和朋友或同事聚会，保持社交活跃",
				subtitle: "PERSUASIVE & ENTHUSIASTIC",
				type: "I",
			},
			{
				text: "享受安静的家庭时光，为明天积蓄能量",
				subtitle: "PATIENT & RELIABLE",
				type: "S",
			},
			{
				text: "阅读、学习或深入研究一个感兴趣的话题",
				subtitle: "ANALYTICAL & PRECISE",
				type: "C",
			},
		],
	},
];
