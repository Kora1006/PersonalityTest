export interface CompositeProfile {
	growthAreas: string[];
	leadership: {
		section1Content: string;
		section2Content: string;
		section3Content: string;
		managementAnalysis: Array<{
			title: string;
			score: number;
			badge: string;
			description: string;
		}>;
	};
	name: string;
	professional: {
		section1Content: string;
		section2Content: string;
		section3Content: string;
		careerPaths: Array<{ title: string; compatibility: string; icon: string }>;
	};
	relationship: {
		section1Content: string;
		intimacy: string;
		communicationPreference: string[];
		relationshipSuggestions: Array<{
			title: string;
			icon: string;
			description: string;
		}>;
	};
	shareQuotes: string[];
	strengths: string[];
	tagline: string;
}

export const COMPOSITE_PROFILES: Record<string, CompositeProfile> = {
	DI: {
		name: "开拓型 (DI)",
		tagline: "以执行力破局，用感染力聚人，你是充满激情的开拓者",
		strengths: [
			"进取心和行动力极强，快速推动项目破局",
			"擅长沟通和说服，能轻松调动团队的主观能动性",
			"敢于面对高难度挑战，能迅速适应不确定的新环境",
		],
		growthAreas: [
			"注意倾听团队中保守和谨慎的声音，避免盲目乐观",
			"在快速推进的同时，确保细节和关键质量控制点不滑落",
			"练习在项目后期保持同样的耐心，确保闭环落地",
		],
		shareQuotes: [
			"没有路的时候，走过去就是路",
			"激情发现机会，执行拿到结果",
			"最好的领导，是带领团队看到更远的风景",
		],
		professional: {
			section1Content:
				"你在职场中是一位极具张力的开拓者。你喜欢领导新项目，用直觉和速度打破僵局。你的沟通富有感召力，能迅速凝聚人心，但有时可能会因为推进过快而给他人带来步骤上的压力。",
			section2Content:
				"你表达直接、热烈，善于通过描绘愿景来说服别人。你抗压能力强，在危机中能站出来带头冲锋。与你沟通应直奔主题，用可执行的结果激发你的热情。",
			section3Content:
				"在追求效率的同时，刻意练习耐心倾听，给下属足够的缓冲时间。在创意发散之余，建立规范的项目跟进机制，以保障结果的稳定性。",
			careerPaths: [
				{ title: "业务合伙人", compatibility: "95%", icon: "groups" },
				{ title: "开拓型市场总监", compatibility: "92%", icon: "trending_up" },
				{ title: "创新项目负责人", compatibility: "90%", icon: "lightbulb" },
				{ title: "危机公关负责人", compatibility: "88%", icon: "forum" },
			],
		},
		relationship: {
			section1Content:
				"在人际交往中，你热情、主动，擅长调动社交气氛。你习惯直接表达关怀，带给对方满满的能量与安全感，是关系中令人瞩目的主导力量。",
			intimacy:
				"你追求热烈且充满探索感的亲密关系，乐于与伴侣一起尝试新鲜事物。在感情中坦诚、直接，不喜欢隐瞒和冷暴力。",
			communicationPreference: [
				"开诚布公的直接交谈",
				"通过共同经历新鲜事物来建立连接",
				"给予对方即时且积极的肯定",
			],
			relationshipSuggestions: [
				{
					title: "放慢沟通节奏",
					icon: "spa",
					description: "在伴侣感到有压力时，试着放低音量并耐心等待对方的回应。",
				},
				{
					title: "重视日常陪伴",
					icon: "favorite",
					description: "除了轰轰烈烈的活动，温和的倾听也是高质量陪伴的表现。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位极具感召力的实干派。你不仅能指明方向、快速决断，更能用澎湃的热情点燃团队斗志。你最擅长带领团队打硬仗、抢占新市场。",
			section2Content:
				"你的团队在你的带领下敢想敢拼。但他们也需要稳定的执行框架。你需要配备擅长流程与风控的‘盾牌型’副手，来补充你的细节短板。",
			section3Content:
				"学会从‘带头冲锋’转向‘授权赋能’。给团队成员试错的空间，而不是凡事都直接接管，这会有利于团队长期的梯队建设。",
			managementAnalysis: [
				{
					title: "愿景感召力",
					score: 96,
					badge: "极强",
					description: "能够用富有激情的愿景凝聚团队，推动变革。",
				},
				{
					title: "敏捷决策度",
					score: 92,
					badge: "高效",
					description: "在不确定环境中快速反应，决断力极佳。",
				},
				{
					title: "细节风控度",
					score: 65,
					badge: "需加强",
					description: "倾向于快速行动，对潜在流程风险把控较弱。",
				},
			],
		},
	},
	DC: {
		name: "挑战者 (DC)",
		tagline: "用理性解构世界，用决断直击目标，你是冷静的破局者",
		strengths: [
			"具备深度的逻辑分析能力，决策客观严谨",
			"高度结果导向，追求最高标准的工作效率与品质",
			"在压力下依然能保持冷静，擅长解决复杂的系统性问题",
		],
		growthAreas: [
			"学会在高标准下给予团队适当的鼓励和情感关怀",
			"减少因过度追求完美和效率而产生的沟通摩擦",
			"尝试接受‘不完美但及时’的快速行动反馈",
		],
		shareQuotes: [
			"卓越不是一种标准，而是一种习惯",
			"用数据说话，以结果证明",
			"冷静的判断优于盲目的热情",
		],
		professional: {
			section1Content:
				"你在职场中是一位非常冷静、理智的策略家。你做事条理分明，极具决断力，同时又极其注重专业和准确性。在解决高难度、需要严密论证的问题上，你是不可或缺的定海神针。",
			section2Content:
				"你的沟通风格偏向客观、简明，直奔主题。你习惯用事实和逻辑说服别人，但在压力下可能会显得过于严苛或不近人情。与你协作的最佳方式是提交结构化、有数据支撑的方案。",
			section3Content:
				"在坚守原则和质量的同时，多去肯定团队的阶段性努力。理解不同性格成员的局限性，提供建设性的指导而非单纯的绩效问责。",
			careerPaths: [
				{ title: "战略咨询专家", compatibility: "96%", icon: "insights" },
				{
					title: "首席技术官(CTO)",
					compatibility: "93%",
					icon: "developer_mode",
				},
				{ title: "系统架构师", compatibility: "91%", icon: "architecture" },
				{ title: "风险管理总监", compatibility: "89%", icon: "verified" },
			],
		},
		relationship: {
			section1Content:
				"在人际交往中，你表现得理智、克制。相比起甜言蜜语，你更倾向于用切实可靠的实际行动、解决问题的方式以及对未来的长远规划来表达爱意。",
			intimacy:
				"你追求高质量、有深度的精神共鸣，重视双方的独立空间和边界感。你喜欢用合乎逻辑的沟通来解决感情中的矛盾。",
			communicationPreference: [
				"理性、不带情绪化的真诚沟通",
				"明确的事实讨论与计划制定",
				"支持彼此独立的个人成长空间",
			],
			relationshipSuggestions: [
				{
					title: "接纳情绪价值",
					icon: "spa",
					description:
						"在伴侣难过时，先给予拥抱和情感关慰，而不是急着分析对错并提供方案。",
				},
				{
					title: "多表达温暖赞赏",
					icon: "favorite",
					description:
						"刻意练习口头表达对伴侣付出的感激，哪怕是一些琐碎的日常细节。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位极具权威感的‘高标型’掌舵人。你坚守高原则，严控输出质量，凡事以事实为依托，能带领团队在复杂战局中始终锚定正确方向。",
			section2Content:
				"团队会非常敬畏你的专业能力，但也可能会因为你极高且不妥协的要求而感到窒息。在严密监管的同时，如何调动团队的主动创造力是你的必修课。",
			section3Content:
				"建立更加人性化的管理模式。适度松绑细节，将‘挑错’转变为‘赋能’，让团队在相对包容的氛围中承担责任和成长。",
			managementAnalysis: [
				{
					title: "逻辑决断力",
					score: 95,
					badge: "优秀",
					description:
						"基于数据 and 严密的逻辑推理，能快速切中要害并进行决策。",
				},
				{
					title: "质量控制度",
					score: 94,
					badge: "严苛",
					description: "对输出质量要求极高，极力规避流程中的潜在隐患。",
				},
				{
					title: "同理凝聚力",
					score: 58,
					badge: "需关注",
					description:
						"偏向任务和效率，在安抚团队情绪及建立情感羁绊上稍显不足。",
				},
			],
		},
	},
	DS: {
		name: "执着者 (DS)",
		tagline: "既有清晰的目标感，又有极强的耐力与韧性，默默成就卓越",
		strengths: [
			"兼具掌控欲与服务意识，执行稳健，极度有始有终",
			"待人真诚可靠，能在突发危机或长期逆境中稳住大局",
			"善于将宏大目标拆解为扎实的步骤，持之以恒地落实",
		],
		growthAreas: [
			"在需要快速反应的关键决策点上，学会压缩权衡时间",
			"主动并清晰地沟通自己的需求，避免一味迎合或过度承担",
			"在面对团队内部冲突时，提高直面和解决的主动性",
		],
		shareQuotes: [
			"默默扎根，最终长成参天大树",
			"目标在心，路在脚下，久久为功",
			"最坚实的承诺，从不需要喧嚣",
		],
		professional: {
			section1Content:
				"你在职场中是一位极具韧性的执行者。你不仅有完成目标的决心，更有持久推进的耐力。你工作扎实可靠，擅长在庞杂的工作中找到清晰的落实主线，深得团队信赖。",
			section2Content:
				"你的沟通温和而有分寸，表达观点时客观真诚。面对压力时，你通常会选择沉着应对，但在极端压抑下可能会产生较强的固执情绪。你最适合稳健且有长期积累性质的行业。",
			section3Content:
				"在注重稳定和执行细节之余，敢于跳出舒适区尝试快速的变革。学会更主动地为自己和团队争取资源，而不是一味等待被分配。",
			careerPaths: [
				{ title: "资深项目总监", compatibility: "94%", icon: "assignment" },
				{ title: "运营副总裁", compatibility: "91%", icon: "corporate_fare" },
				{ title: "客户关系专家", compatibility: "89%", icon: "support_agent" },
				{ title: "研发管理专家", compatibility: "86%", icon: "rocket_launch" },
			],
		},
		relationship: {
			section1Content:
				"在人际交往中，你厚重、真诚，习惯扮演长期支持者的角色。你不喜欢变动频繁的社交，但对认定的关系极尽守护，是极其长情、令人安心的伴侣。",
			intimacy:
				"你追求温馨、和谐、可预测的情感生活。你非常注重双方对家庭责任的承担，愿意默默付出大量精力打理生活琐事。",
			communicationPreference: [
				"温和、耐心且具有倾听空间的谈话",
				"关于家庭与未来的长远、务实计划",
				"用日常贴心的照顾表达爱意",
			],
			relationshipSuggestions: [
				{
					title: "及时说出不满",
					icon: "spa",
					description:
						"不要把负面情绪憋在心底，以温柔但明确的方式及时向伴侣指出困扰。",
				},
				{
					title: "创造生活惊喜",
					icon: "favorite",
					description:
						"在习惯的日常之外，主动策划一些打破常规的约会，为感情注入活力。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位稳健的小憩赋能者。你既有清晰的任务目标，又极度关心员工的稳定性与培养。你的团队流失率通常极低，大家在你的羽翼下极有安全感。",
			section2Content:
				"你推崇‘以身作则’的实干精神。但有时可能会因为过于注重温和的氛围，而在团队出现绩效低下或越轨行为时，延迟进行必要的困难对话。",
			section3Content:
				"刻意练习冲突管理，明白及时的负面反馈也是对员工长期的关怀。提升关键时刻的决策锋芒，果断进行必要的人员调配。",
			managementAnalysis: [
				{
					title: "稳健推进力",
					score: 93,
					badge: "突出",
					description:
						"具备极强的长期耐力，能把复杂任务拆解并持之以恒地执行落地。",
				},
				{
					title: "团队安全度",
					score: 90,
					badge: "极高",
					description:
						"待人宽厚真诚，能为团队成员提供极高的心理安全感与归属感。",
				},
				{
					title: "快速变革力",
					score: 60,
					badge: "较弱",
					description:
						"在面对剧烈变化的环境时，倾向于保守防守，响应敏捷度略有不足。",
				},
			],
		},
	},
	ID: {
		name: "激励者 (ID)",
		tagline: "用热情点燃创意，用速度追逐梦想，你是魅力非凡的激励者",
		strengths: [
			"具备极强的感召力与乐观心态，能瞬间点燃团队热情",
			"创意思维极其活跃，敢于打破常规，推动业务变革",
			"在社交与沟通中表现得非常自信，善于整合各种外部资源",
		],
		growthAreas: [
			"在快速铺开新想法的同时，务必确保既有项目的收尾和落地",
			"练习进行深思熟虑的分析，不要完全依赖直觉和感性做决策",
			"合理管理个人精力，避免在同一时间段内开启过多事务",
		],
		shareQuotes: [
			"相信未来，并且现在就去创造它",
			"用热情感染世界，用速度赢得先机",
			"人生就是一场不断开拓的冒险",
		],
		professional: {
			section1Content:
				"你在职场中是一位活力四射的创意推动者。你拥有出众的个人魅力和极强的表达欲，擅长在关键时刻调动资源、发表精彩演说来感召团队，是天生的资源整合者。",
			section2Content:
				"你表达生动、充满张力，倾向于用积极宏观的方式影响他人。你讨厌死板重复的流程，在快节奏、充满变化的创新型岗位上能发挥出最大价值。",
			section3Content:
				"给自己配置一位严谨细致的搭档，以确保你脑海中的闪光点能够转化为规范可操作的步骤。学会克制过快转换注意力的冲动。",
			careerPaths: [
				{ title: "营销副总裁", compatibility: "95%", icon: "campaign" },
				{ title: "公关与媒体总监", compatibility: "93%", icon: "forum" },
				{ title: "创意主策划", compatibility: "90%", icon: "lightbulb" },
				{ title: "风险合伙人", compatibility: "87%", icon: "insights" },
			],
		},
		relationship: {
			section1Content:
				"在关系中，你是一个热烈、浪漫、富有激情的人。你乐于向伴侣展示你精彩纷呈的一面，经常给感情生活带来惊喜和令人向往的亮色。",
			intimacy:
				"你追求高度默契的精神交流与情感互动，喜欢向伴侣倾诉你对未来的无数奇思妙想。你需要伴侣给予你充分的信任与情感鼓励。",
			communicationPreference: [
				"轻松、欢快且带有天马行空想象的交流",
				"随时随地的分享欲与热烈的正面肯定",
				"共同策划并体验充满新意的浪漫约会",
			],
			relationshipSuggestions: [
				{
					title: "倾听日常细节",
					icon: "spa",
					description:
						"耐下心来倾听伴侣对于日常慢事、细微感受的倾诉，这是建立深层纽带的基础。",
				},
				{
					title: "注重承诺落地",
					icon: "verified",
					description:
						"在日常中答应伴侣的事情要切实去办，用行动增强对方对你稳定性的信任。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位天生的精神领袖。你的感召力无以伦比，最擅长在团队迷茫或处于低谷时重建信心，给团队画出宏伟的蓝图并指引方向。",
			section2Content:
				"团队会非常喜欢你开明、包容、充满鼓励的管理风格。但你的短板通常在于容易对流程规范和检查点产生疏漏，这需要强力的小组长来补足。",
			section3Content:
				"为团队引入科学的OKR/KPI执行追踪系统，确保大家的干劲能精准沉淀为业务结果。在开会时，分出更多的时间让下属做事实汇报。",
			managementAnalysis: [
				{
					title: "感召影响度",
					score: 97,
					badge: "极致",
					description: "拥有无与伦比的语言感染力，能轻松激发并凝聚各方斗志。",
				},
				{
					title: "变革创新度",
					score: 93,
					badge: "优秀",
					description: "富有创意，不怕打破陈规，是推动业务转型的绝佳催化剂。",
				},
				{
					title: "执行追踪度",
					score: 55,
					badge: "需补足",
					description:
						"在任务执行的后半程监督及细致指标复盘上，有极大提升空间。",
				},
			],
		},
	},
	IS: {
		name: "顾问型 (IS)",
		tagline: "散发着温暖与善意，用同理心粘合团队，你是天生的沟通纽带",
		strengths: [
			"具备极佳的同理心与倾听能力，是最佳的合作伙伴",
			"擅长化解人际摩擦，能够在团队中创造高度和谐的合作氛围",
			"富有亲和力，乐于真诚地帮助他人成长并提供全方位支持",
		],
		growthAreas: [
			"在需要进行原则性决策或裁撤调整时，练习展现出一定的决断锋芒",
			"不要为了过度迎合他人或逃避冲突而选择一味地妥协与退让",
			"学会勇敢、清晰地拒绝不合理的需求，建立合理的个人边界",
		],
		shareQuotes: [
			"用温暖倾听世界，以善意凝聚人心",
			"真正的力量，往往隐藏在温柔与包容之中",
			"帮助他人成长，是自我成长的最佳路径",
		],
		professional: {
			section1Content:
				"你在职场中是公认的‘团队润滑剂’。你非常关注人与人之间的关系，沟通充满温度和建设性。你极其擅长在跨部门协作或内部矛盾重重时，担当沟通桥梁，以柔克刚解决分歧。",
			section2Content:
				"你表达温和、委婉，特别注意维护对方的面子和自尊心。你崇尚平等、合作的工作模式，非常反感强势专断的职场环境。你最适合人力资源、团队赋能和客户管理等方向。",
			section3Content:
				"在关注人际关系之余，提高自己对业务指标和客观数据的敏感度。在工作中做到‘对事不对人’，使自己在专业形象上更有底气。",
			careerPaths: [
				{ title: "人力资源总监(HRD)", compatibility: "95%", icon: "groups" },
				{ title: "金牌培训导师", compatibility: "92%", icon: "school" },
				{ title: "组织发展(OD)专家", compatibility: "90%", icon: "analytics" },
				{ title: "客户关系专家", compatibility: "88%", icon: "support_agent" },
			],
		},
		relationship: {
			section1Content:
				"在关系中，你极具亲和力与包容心。你总是能敏锐地察觉到伴侣的情绪波动，并在第一时间送上安慰，是所有人向往的温暖伴侣。",
			intimacy:
				"你追求温馨稳定、充满关怀和深度陪伴的情感关系。你愿意为了维持家庭的和睦付出妥协，极其看重双方在情感层面的安全感。",
			communicationPreference: [
				"倾注满满同理心与温柔聆听的深切沟通",
				"充满正向鼓励、没有指责的轻松谈话",
				"用日常贴心的照顾来传递爱意",
			],
			relationshipSuggestions: [
				{
					title: "直抒己见",
					icon: "spa",
					description:
						"遇到矛盾时及时地说出自己真实的诉求，不要以为伴侣总能猜到你的心思。",
				},
				{
					title: "设立清晰红线",
					icon: "verified",
					description:
						"面对伴侣侵犯你原则的行为要明确说不，过度的退让并不能换来长久的和谐。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位共情力顶尖的‘教练型’带路人。你擅长创造心理安全感极高的团队环境，特别善于发现并挖掘下属的个人潜能，通过包容与信任帮助他人达成目标。",
			section2Content:
				"下属会因为你的随和、体贴而极度信任你。但有时候，过于宽松的氛围可能会导致团队整体执行速度变慢，或者在绩效不合格时由于心软而未能及时惩处。",
			section3Content:
				"引入‘清晰且严明的边界感’。在进行绩效面谈时，学会用中立、客观的数据直截了当地指出问题，明确规定改进的时间节点。",
			managementAnalysis: [
				{
					title: "共情凝聚力",
					score: 96,
					badge: "极致",
					description:
						"同理心极强，能迅速建立高信任度、充满心理安全感的团队文化。",
				},
				{
					title: "倾听赋能度",
					score: 93,
					badge: "突出",
					description:
						"能够耐心引导下属发现优势，是典型的教练型、倾听型管理者。",
				},
				{
					title: "铁面果决力",
					score: 52,
					badge: "需加强",
					description:
						"在处理员工淘汰、绩效问责或果断止损等刚性场景下，略显心软。",
				},
			],
		},
	},
	IC: {
		name: "评估者 (IC)",
		tagline: "将发散的创意灵感融入严谨的逻辑框架，你是灵活的分析家",
		strengths: [
			"兼具发散的创意思维与严密的分析逻辑，点子多且落地可行",
			"表达生动有趣，同时拥有丰富的数据和事实做论据支撑",
			"能够在团队中扮演感性与理性的桥梁，擅长进行复杂的方案评估",
		],
		growthAreas: [
			"避免在‘发散创意’和‘追求完美细节’之间反复摇摆导致内耗",
			"分清任务优先级，避免因为被某些枝节细节困住而影响整体进度",
			"在制定计划后，提高知行合一的行意执行力，减少拖延",
		],
		shareQuotes: [
			"用创意打破沉闷，用逻辑框定现实",
			"兼具艺术家的直觉与工程师的理智",
			"有深度地说服，是对专业最大的尊重",
		],
		professional: {
			section1Content:
				"你在职场中是一个非常独特的复合体。你既有‘I’的活跃发散、擅长表达沟通，又有‘C’的谨慎细致、关注事实数据。你提出的点子往往不仅引人入胜，更具备切实的可行性，是极佳的方案撰写者与评估者。",
			section2Content:
				"你能够根据不同的受众转换沟通语言。在面对客户时，你能用生动的语言呈现愿景；在面对研发或技术团队时，你又用严密的数据做背书。你最适合需要平衡艺术创意与数据效果的工作。",
			section3Content:
				"警惕‘过度追求逻辑完美’而迟迟不敢交付成果的倾向。学会接受 80 分的初始方案并在快速迭代中进行完善，以提升产出效率。",
			careerPaths: [
				{ title: "高级产品经理", compatibility: "94%", icon: "analytics" },
				{ title: "市场研究专家", compatibility: "91%", icon: "insights" },
				{
					title: "内容策划与运营专家",
					compatibility: "89%",
					icon: "lightbulb",
				},
				{ title: "商业分析师", compatibility: "86%", icon: "verified" },
			],
		},
		relationship: {
			section1Content:
				"在人际交往中，你表现得既风趣幽默，又注重交流的内容深度。你乐于在感情中分享各种有趣的见闻，同时也是一个非常可靠的心灵倾听与出谋划策者。",
			intimacy:
				"你追求深层次的理性交流与丰富的精神生活，特别看重伴侣是否拥有独立思考的能力。你在情感中非常理性，不喜欢情绪化爆发。",
			communicationPreference: [
				"有逻辑且充满创意碰撞的谈话",
				"有凭有据、诚恳而坦率的直接交流",
				"共同探讨各种深度话题或艺术体验",
			],
			relationshipSuggestions: [
				{
					title: "减少客观分析对错",
					icon: "spa",
					description:
						"当伴侣处于脆弱状态时，多给予无条件的温柔，而不是站在逻辑高地上进行分析。",
				},
				{
					title: "拥抱随机与随性",
					icon: "favorite",
					description:
						"不要在生活里的每件小事上都做严丝合缝的计划，偶尔享受随性的日子。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位理智而富有亲和力的‘评估型’管理者。你不会用生硬的行政命令强压团队，而是习惯用周密的事实数据和生动的道理去‘说服’下属。",
			section2Content:
				"团队会很喜欢你包容开放的态度，但有时候，他们会觉得你的指令有些‘纠结摇摆’——这是因为你在决策时会同时考虑关系与标准、速度与细节。",
			section3Content:
				"明确并锁死任务的终局目标，避免在执行中因过度推敲方案的完美性而中途多次修改需求。学会在掌握适量信息后就一锤定音。",
			managementAnalysis: [
				{
					title: "多维说服力",
					score: 93,
					badge: "突出",
					description:
						"兼具语言温度与严密数据，能对团队和外部合作方进行深度说服。",
				},
				{
					title: "方案设计力",
					score: 91,
					badge: "优秀",
					description:
						"不仅点子多、角度新，而且有清晰的数据和逻辑闭环支撑，落地度高。",
				},
				{
					title: "果决定案度",
					score: 58,
					badge: "需加强",
					description:
						"在面对高冲突或急需定夺的十字路口时，可能因追求面面俱到而纠结。",
				},
			],
		},
	},
	SD: {
		name: "稳健推动者 (SD)",
		tagline: "默默耕耘，稳步迈进，你是团队最坚实也是最有力量的后盾",
		strengths: [
			"具备极其长久的耐心与毅力，能克服重重困难完成复杂项目",
			"专注于执行细节，能将宏大方向梳理为清晰的SOP并稳步推行",
			"待人极其真诚和负责任，拥有极佳的社会责任感与团队使命感",
		],
		growthAreas: [
			"学着快速响应多变的环境，不要因为计划的改变而感到焦虑",
			"在公开场合更加自信地展示自己的成果与才华，克服自我低估",
			"直面职场中的人际冲突，避免因为妥协退让而在心底累积负能量",
		],
		shareQuotes: [
			"实干无声，大音希声",
			"用长久的毅力征服所有的逆境",
			"最令人安心的合作，是事事有回音，件件有着落",
		],
		professional: {
			section1Content:
				"你在职场中是一位极其扎实的‘靠山型’专家。你话不多但做事绝无纰漏。你极其擅长接手庞杂的日常事务，建立起清晰可执行的流程并日复一日地高标准推行，是业务的基石。",
			section2Content:
				"你沟通时温和诚恳，在遭遇压力时非常有耐心。你可能在快速变动或高频公开表达的岗位上感到紧绷，但在需要专注力和持久攻坚的环境中，你是最强的输出者。",
			section3Content:
				"在扎实做事的同时，建立‘向上汇报’的习惯，让管理层看到你的关键付出。不要等到所有计划完美无缺后才采取行动。",
			careerPaths: [
				{ title: "资深运营专家", compatibility: "93%", icon: "assignment" },
				{ title: "供应链总监", compatibility: "90%", icon: "corporate_fare" },
				{ title: "研发管理专家", compatibility: "88%", icon: "rocket_launch" },
				{ title: "行政总监", compatibility: "85%", icon: "groups" },
			],
		},
		relationship: {
			section1Content:
				"在关系中，你极度忠诚、务实且愿意付出。你可能不太会制造轰轰烈烈的浪漫，但绝对会为家庭的正常运转和伴侣的生活起居遮风挡雨，是无可替代的港湾。",
			intimacy:
				"你追求长期、稳定且充满安全感的情感关系。一旦决定进入关系，你便会抱以极强的责任感和长远规划，对变动极其反感。",
			communicationPreference: [
				"中立、客观且态度缓和的双向沟通",
				"关于生活细节、收支和计划的务实商讨",
				"通过帮对方解决实际生活难题来传递体贴",
			],
			relationshipSuggestions: [
				{
					title: "及时宣泄压力",
					icon: "spa",
					description:
						"学会向伴侣主动倾诉自己的烦恼，不要把所有事情都自己死撑。",
				},
				{
					title: "勇于迎接小变动",
					icon: "favorite",
					description:
						"伴侣偶尔发起的随机出行或惊喜活动，试着欣然接受而不是拒绝。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位默默为团队遮风挡雨的‘守护型’带头人。你注重执行的扎实度，强调团队内部的稳定性与归属感，总是能够耐心地指导新人在长跑中成长。",
			section2Content:
				"团队会对你产生强烈的归属感。但你的短板在于有时因为对变革表现得较为谨慎，可能会错失一些快速突击的机会，或在面对破坏团队规则的冲突时处理得不够及时。",
			section3Content:
				"尝试引入一些‘敏捷变革’思维。当外部环境快速变动时，带领团队进行快速的小步试错。遇到问题员工要果决且直接地指正。",
			managementAnalysis: [
				{
					title: "流程管控力",
					score: 94,
					badge: "杰出",
					description:
						"擅长将复杂方向梳理成清晰严密的工作流，让执行过程零失误。",
				},
				{
					title: "组织向心度",
					score: 91,
					badge: "极高",
					description: "能够用真诚与实际的保护，带给团队强烈的向心力与稳定感。",
				},
				{
					title: "敏捷迭代力",
					score: 58,
					badge: "需提高",
					description:
						"对打破原有稳定常规持谨慎态度，应对突发式、颠覆式变革的弹性不足。",
				},
			],
		},
	},
	SI: {
		name: "合作协调者 (SI)",
		tagline: "用温和的姿态倾听世界，以乐观的心态支持他人，你是最佳的协作者",
		strengths: [
			"具备出色的倾听和沟通协调性，极易获得他人的信任",
			"态度温和且乐于奉献，能设身处地地体谅他人的难处",
			"做事有始有终，极富耐力，能为团队带来持续不断的正面支持",
		],
		growthAreas: [
			"提高独立做决定的信心和魄力，减少因为顾及面面俱到而犹豫",
			"在需要突出贡献的场合，勇敢展现自己的核心价值和锋芒",
			"坦诚直面冲突，不在委曲求全中积压自己的隐性负面情绪",
		],
		shareQuotes: [
			"温和地融入世界，坚定地支持他人",
			"帮助他人，是人世间最美妙的交响",
			"细水长流的真诚，能融化最坚固的壁垒",
		],
		professional: {
			section1Content:
				"你在职场中是一位亲和力拉满的‘协作天使’。你推崇和谐的合作理念，永远以热心和耐心的态度对待同事。你在跨部门沟通、售后支持或客服流程设计中，能够发挥出无与伦比的粘合价值。",
			section2Content:
				"你沟通方式柔和，极其注重对人情世故的拿捏，能把坚硬的矛盾化解于无形。你不喜欢带有强烈攻击性或恶性竞争的销售环境，更偏爱有秩序、温情脉脉的后勤与支持大本营。",
			section3Content:
				"在工作中建立‘对事不对人’的准则。面对不合理的要求时要敢于坚决维护自己的底线，不要让‘好脾气’沦为他人的便利贴。",
			careerPaths: [
				{ title: "跨部门协作专家", compatibility: "94%", icon: "groups" },
				{ title: "资深HRBP", compatibility: "91%", icon: "verified" },
				{
					title: "高级售后运营总监",
					compatibility: "88%",
					icon: "support_agent",
				},
				{ title: "行政合伙人", compatibility: "85%", icon: "assignment" },
			],
		},
		relationship: {
			section1Content:
				"在关系中，你极度体贴、包容，是一个几乎从不主动挑起矛盾的情感黏合剂。你随时准备着照顾伴侣的生活和情绪，能够为双方的爱意提供极度润泽的养分。",
			intimacy:
				"你极其看重家庭生活的舒适性与伴侣的一致性，追求稳步的日常。你对伴侣充满无条件的信任和爱护，对急变极度不适。",
			communicationPreference: [
				"倾注情感交融与鼓励的温柔倾听与诉说",
				"不带任何攻击性和预设立场的双向对话",
				"用日常细心体贴的举动来传递真诚",
			],
			relationshipSuggestions: [
				{
					title: "主动倾诉",
					icon: "spa",
					description:
						"遇到困惑时及时表达自己的想法，一味忍让会让伴侣忽视你真正的痛点。",
				},
				{
					title: "保留独特的爱好",
					icon: "favorite",
					description:
						"在照顾伴侣之余，留出时间发展自己独立的社交，保留独特的个人磁场。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位温和的‘管家协调型’导师。你提倡团队和谐，致力于通过温情关怀来驱动凝聚力。你的管理动作往往偏向温和授权与默默支持。",
			section2Content:
				"团队会觉得你没有一点领导架子，极其亲近。但你的挑战在于容易因为过度照顾大家的情绪，而导致团队整体任务的交付节点和质量标准被稀释。",
			section3Content:
				"树立领导者的必要威严，学会在核心问题上扮演决断者的角色。给团队成员明确划定任务完成的刚性时限，严格按结果拿成效。",
			managementAnalysis: [
				{
					title: "关怀协作性",
					score: 96,
					badge: "极致",
					description:
						"极富亲和力，能轻松化解人际矛盾，营造高度融洽的办公氛围。",
				},
				{
					title: "授权支持度",
					score: 93,
					badge: "杰出",
					description: "乐于为下属提供全方位的成长条件与帮助，极富包容度。",
				},
				{
					title: "刚性结果考核",
					score: 50,
					badge: "需加强",
					description:
						"在坚守刚性KPI及处理末尾淘汰或绩效问责时，略显犹豫和拖延。",
				},
			],
		},
	},
	SC: {
		name: "精密合作者 (SC)",
		tagline: "在稳定中追求规范，用精确和耐心确保品质，你是质量的守护者",
		strengths: [
			"具备极强的流程与规范执行力，工作失误率极低",
			"做事低调且逻辑严密，追求有条不紊的工作节奏",
			"拥有出众的长期专注力与执行耐心，极其真诚可靠",
		],
		growthAreas: [
			"提高做决定的效率，减少因过度考虑细枝末节导致的拖延",
			"多尝试跳出原有的经验框架，接纳并尝试新的工作方法",
			"增加沟通与表达频率，让团队随时掌握你的进度和想法",
		],
		shareQuotes: [
			"精确是给团队最可靠的礼物",
			"在安静的坚守中，把每一件小事做到极致",
			"流程不仅是标准，更是信任的基石",
		],
		professional: {
			section1Content:
				"你在职场中是公认的‘稳定压舱石’。你做事讲求流程、讲求章法，对于交给你的日常任务会用极高的精确度按部就班地落实，绝不容许半点瑕疵，极度让上级放心。",
			section2Content:
				"你沟通时冷静、务实，在压力下表现得极为克制。你反感朝令夕改和充满拍脑袋决定的浮躁环境。在逻辑思维严密、注重流程与品质控制的专业技术岗位上，你极具核心价值。",
			section3Content:
				"在完成手头工作之余，学会站在更高的维度思考业务，尝试在规则之外提出创新的解决路径。建立快速应变、边跑边调整的工作习惯。",
			careerPaths: [
				{
					title: "高级品质控制(QC)总监",
					compatibility: "95%",
					icon: "verified",
				},
				{ title: "合规与风控专家", compatibility: "92%", icon: "insights" },
				{ title: "高级财务总监", compatibility: "90%", icon: "corporate_fare" },
				{
					title: "技术研发管理专家",
					compatibility: "87%",
					icon: "developer_mode",
				},
			],
		},
		relationship: {
			section1Content:
				"在人际交往中，你低调、含蓄、追求安稳。你习惯用细致入微的照顾和对生活细节的打理来表达感情，是家庭生活中最令人放心的稳健内核。",
			intimacy:
				"你向往平稳、没有剧烈变动的伴侣关系，看重双方在生活细节上的契合度。在处理矛盾时，你习惯讨论实际的事实，反感情绪化爆发。",
			communicationPreference: [
				"有凭有据、心平气和的事实层面沟通",
				"关于家庭收支、日常起居等具体细节的商讨",
				"通过遵守家庭约定与长期默契付出来传递关爱",
			],
			relationshipSuggestions: [
				{
					title: "多表达感性感受",
					icon: "spa",
					description:
						"尝试向伴侣多讲讲你内心的情绪与细腻感受，不要让生活只剩下务实的任务。",
				},
				{
					title: "学会变通与退让",
					icon: "favorite",
					description:
						"面对伴侣发起的随兴活动或生活习惯上的小分歧，表现得更加弹性和接纳。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位极其注重流程与规范的‘体系建设者’。你擅长制定科学的管理条例，倡导以标准化的工作流去规避生产中的人为误差，推动团队长期可靠地运转。",
			section2Content:
				"团队会极其敬重你踏实、严谨的敬业态度。但同时，他们可能也会因为你对规则和细节的过度要求，而感到有些沉闷，或者在面对突变商机时反应不够敏锐。",
			section3Content:
				"为团队的创意松绑，鼓励下属在底线之上尝试不同的解决路径。在制定计划时，告诉自己：‘先行动，在快速迭代中完善’。",
			managementAnalysis: [
				{
					title: "系统构建力",
					score: 95,
					badge: "杰出",
					description:
						"极其擅长将复杂流程转化为标准可量化的规范体系并推行落地。",
				},
				{
					title: "客观稳定性",
					score: 92,
					badge: "优秀",
					description:
						"凡事遵循科学和事实，情绪平稳，能在长期拉锯战中维持核心产出。",
				},
				{
					title: "危机变通力",
					score: 55,
					badge: "需加强",
					description:
						"偏向保守，在面对彻底打破旧有模式的突发变革时，应变阻力较大。",
				},
			],
		},
	},
	CD: {
		name: "系统型 (CD)",
		tagline: "用数据构筑防线，用决策指向结果，你是严苛的完美主义者",
		strengths: [
			"具备顶尖的问题分析与系统性诊断逻辑，善于挖掘底层漏洞",
			"高度理智与客观，对低效与执行差错零容忍，原则性极强",
			"在制定战略和规避风险方面极富远见，是不被情绪左右的智囊",
		],
		growthAreas: [
			"在表达个人观点和评估意见时多一些同理心，避免语言过于冰冷",
			"学会在未能掌控100%数据时，进行合理的、带有风险意识的尝试",
			"学会分权和信任下属的质量判断力，避免陷入事必躬亲的陷阱",
		],
		shareQuotes: [
			"逻辑是事物最完美的注脚",
			"眼里容不下半点瑕疵，才能雕琢出完美的终局",
			"数据优于直觉，事实胜于雄辩",
		],
		professional: {
			section1Content:
				"你在职场中是一位极富穿透力的‘系统分析家’。你极具‘C’的深邃洞察与科学追求，同时又兼具‘D’的决断和结果导向。你不允许任何形式的低效或蒙混过关，是团队中最严厉也最可靠的质量法官。",
			section2Content:
				"你沟通简明扼要，直达核心。你的说服力建立在坚如磐石的数据和事实之上，但在团队合作中，你直截了当的批评可能会伤害同事的情感。你最适合在高精尖、风控或核心决策体系中发挥价值。",
			section3Content:
				"练习将你的评判转变为具有建设性的帮助。告诉别人‘怎么做’而不是仅仅指出‘哪里错’。在团队合作中多一分人情的柔和。",
			careerPaths: [
				{ title: "资深商业分析师", compatibility: "95%", icon: "insights" },
				{
					title: "研发总监(R&D)",
					compatibility: "92%",
					icon: "developer_mode",
				},
				{ title: "风控合规负责人", compatibility: "90%", icon: "verified" },
				{ title: "高级系统工程师", compatibility: "88%", icon: "architecture" },
			],
		},
		relationship: {
			section1Content:
				"在人际交往中，你表现得理智、慢热且深沉。你对感情抱着极其负责且严密的思考，不轻易许下承诺，但一旦确定关系，你会用强大的安全感和终身长情来守护伴侣。",
			intimacy:
				"你追求深层次的理智交流与独立的个性。你需要伴侣能够理解你冷峻外表下对长久契约的热切信守，讨厌情绪化冲突。",
			communicationPreference: [
				"有深度、客观理性的精神交心与逻辑切磋",
				"关于未来工作、收支和计划的客观编排",
				"通过切切实实帮对方解决工作与生活难题来表达爱意",
			],
			relationshipSuggestions: [
				{
					title: "先倾听后分析对错",
					icon: "spa",
					description:
						"在伴侣寻求安慰时，给予纯粹的情感共鸣，收起你想帮对方挑错的本能。",
				},
				{
					title: "及时说出赞赏",
					icon: "favorite",
					description:
						"习惯口头表达对方带给你的温暖，理性的世界同样需要阳光的直白温度。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位铁腕高标的‘理性掌舵者’。你对团队输出的质量与时效有着极致的坚守，眼里揉不得半点沙子。你善于通过强大的数据逻辑和铁律制度，把团队打造成高精密的执行战车。",
			section2Content:
				"团队会极其敬重你踏实、严谨的敬业态度。但同时，大家在你的严密质询下也可能会因为害怕犯错而不敢主动创新。你的办公室可能会因此显得有些沉闷。",
			section3Content:
				"适当容慢‘良性的犯错’，将试错作为成长的代价。拉近与下属的心理距离，提升团队黏性。",
			managementAnalysis: [
				{
					title: "问题分析力",
					score: 96,
					badge: "极佳",
					description:
						"逻辑深邃，能在纷乱的现象中迅速指出底层系统的漏洞和痛点。",
				},
				{
					title: "制度推行力",
					score: 93,
					badge: "坚定",
					description:
						"能不为面子或人情所累，坚定不移地推行客观的管理制度与标准。",
				},
				{
					title: "人情软化力",
					score: 55,
					badge: "需加强",
					description:
						"在缓和员工压力、处理情感沟通及软性员工关怀方面具有较大局限性。",
				},
			],
		},
	},
	CI: {
		name: "精致评估者 (CI)",
		tagline: "将精确的事实融入生动的沟通，你是逻辑与温度兼备的评估家",
		strengths: [
			"具备深度的数据逻辑分析基础，同时具备良好的表达能力",
			"能在追求细节和维持人际关系之间找到极佳的平衡点",
			"行事客观公正，善于通过有说服力的报告帮助团队做出明智的决策",
		],
		growthAreas: [
			"不要因为过度雕琢细节和方案的完美性，而影响了前期的交付时效",
			"在面对外界的高频情绪化表达时，练习保持心理上的中立和接纳",
			"明确自己的红线，避免在各方意见不一致时被别人牵着走",
		],
		shareQuotes: [
			"最生动的表达，是由坚实的事实构筑的",
			"客观地审视世界，热情地参与生活",
			"好的方案，不仅要有理有据，更要动人心弦",
		],
		professional: {
			section1Content:
				"你在职场中是一位非常完美的‘方案评估家’。你极富‘C’的系统化思维和对事实的追索，同时又拥有‘I’的亲和表达，这使你在汇报方案、沟通项目进程时表现得极为清晰、有逻辑且令人信服。",
			section2Content:
				"你极其擅长将专业术语转化为生动的通俗语言，向不同背景的合作方阐明方案利弊。在高度需要逻辑归纳、数据统计并向外宣讲的专业职位中，你拥有不可替代的价值。",
			section3Content:
				"告诉自己‘完成优于完美’。在制定了框架并掌握了 80% 的必要数据后，要敢于快速推进落地，而不是反复在局部推敲细节。",
			careerPaths: [
				{ title: "高级数据产品经理", compatibility: "94%", icon: "analytics" },
				{ title: "商业顾问", compatibility: "91%", icon: "insights" },
				{ title: "市场运营经理", compatibility: "88%", icon: "lightbulb" },
				{ title: "高级审计师", compatibility: "85%", icon: "verified" },
			],
		},
		relationship: {
			section1Content:
				"在交往中，你既拥有温和得体的社交礼仪，又有非常严肃理性的相处态度。你喜欢在关系中与伴侣探讨各种有思考深度的社会话题，是一个不可多得的心智伴侣。",
			intimacy:
				"你追求体面、高质量的精神生活和深层默契。你非常尊重伴侣的个人边界，也要求对方给予你同等的空间与独立发展的权利。",
			communicationPreference: [
				"有理有据、逻辑自洽且充满温度的精神共鸣",
				"诚恳直接、不带有预设批评的高质量交谈",
				"共同体验具有文化气息或生活品质的休闲项目",
			],
			relationshipSuggestions: [
				{
					title: "包容无序与变化",
					icon: "spa",
					description:
						"包容生活里的一些突发改变和无序瞬间，多一些对伴侣随性行为的接纳。",
				},
				{
					title: "多倾听少讲道理",
					icon: "favorite",
					description:
						"在伴侣向你发泄情绪时，闭上分析对错的嘴巴，先给予温柔聆听与拥抱。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位理智温和的‘说服型’领导者。你不倾向于用职务权力强压团队，而是极度擅长召集会议，通过清晰的事实论据、利弊分析去说服并引导团队达成共识。",
			section2Content:
				"下属会因为你的专业性与公正态度对你深感信赖。但你有时在决策时会因为考虑的变量过多，或者是过于平衡各方意见而稍显优柔寡断，导致效率损失。",
			section3Content:
				"在快速迭代中，适当锁定最终方向并快速做一锤定音的定夺。明确划定任务的红线界限，减少因方案反复推倒重来而耗损的团队精力。",
			managementAnalysis: [
				{
					title: "数据宣讲力",
					score: 93,
					badge: "杰出",
					description:
						"极度擅长将复杂的技术性、数据化指标向非专业成员进行生动阐释与说服。",
				},
				{
					title: "流程共识度",
					score: 91,
					badge: "高",
					description:
						"重视下属的多方反馈，力求在专业事实与人情向往之间找到合理平衡点。",
				},
				{
					title: "决策敏捷度",
					score: 58,
					badge: "需加强",
					description:
						"由于思考过于细致，对平衡的顾虑多，在处理紧急高压危机时，反应速度稍显保守。",
				},
			],
		},
	},
	CS: {
		name: "完美主义者 (CS)",
		tagline: "严守流程与承诺，默默守护每一处细节，你是最值得信赖的压舱石",
		strengths: [
			"具备卓越的条理性与系统化工作能力，几乎从不犯细节错误",
			"极具耐心与责任心，情绪平稳，能在长周期事务中保持高质量输出",
			"忠诚可靠，极其尊重既有流程与承诺，是核心执行团队的基石",
		],
		growthAreas: [
			"练习对新事物和突发变革的适应力，减少对颠覆性常规的排斥",
			"在团队讨论中更加勇敢和及时地表达自己的不同想法，不闷在心里",
			"尝试简化繁杂的检查流程，避免因过度谨慎而丧失执行效率",
		],
		shareQuotes: [
			"细节是品质唯一的定义",
			"稳健前行，不求喧哗，唯求可靠",
			"好的习惯，能让一切混乱变成秩序的乐章",
		],
		professional: {
			section1Content:
				"你在职场中是典型的‘隐秘大师’。你极具‘C’的系统化思维和对事实的求索，同时又拥有‘S’的安稳与奉献精神。你习惯在自己的专业领域中深耕，默默无闻地交付出零差错的工作结果，极其受领导器重。",
			section2Content:
				"你沟通慢条斯理，极其讲求客观事实和数据依据。你反感大呼小叫、无序混乱和不讲规则的工作环境。在需要极其严谨的数据核算、合规审计、技术排查等静水深流的方向，你拥有极高的专业优势。",
			section3Content:
				"勇敢地走出格子间参与团队脑暴。提升对快速变化的接纳度，在工作中告诉自己：‘即使没有 100% 准备好，先启动依然是重中之重’。",
			careerPaths: [
				{ title: "高级合规总监", compatibility: "95%", icon: "verified" },
				{ title: "高级数据分析师", compatibility: "92%", icon: "insights" },
				{
					title: "高级软件测试专家(QA)",
					compatibility: "90%",
					icon: "developer_mode",
				},
				{ title: "信息安全总监", compatibility: "87%", icon: "architecture" },
			],
		},
		relationship: {
			section1Content:
				"在交往中，你是一个极其务实、体贴且情绪稳定的避风港。你习惯把爱意深藏于对日常生活的细心照顾和对家庭约定的信守中，是长跑型感情中无可替代的坚实基石。",
			intimacy:
				"你追求温馨稳固、平稳而有节律的情感关系，看重彼此对家庭承诺的线索。在解决感情分歧时，你推崇客观事实，反感情绪化表达。",
			communicationPreference: [
				"有凭有据、诚恳平稳的非情绪化交谈",
				"关于日常安排等极尽翔实的讨论",
				"通过准时守约和默默付出来传递真诚",
			],
			relationshipSuggestions: [
				{
					title: "主动讲出需求",
					icon: "spa",
					description:
						"面对感到委屈的琐事及时向伴侣温和说出，不要过度积压在心底。",
				},
				{
					title: "接纳计划改变",
					icon: "favorite",
					description:
						"对于伴侣偶尔发起的即兴约会，试着积极接纳并享受放松，不要因打破计划而紧张。",
				},
			],
		},
		leadership: {
			section1Content:
				"作为领导，你是一位极富耐心的‘系统协调者’。你提倡以严密的制度和可靠的工作流程为下属引航，不提倡高风险的盲目冒险，强调在稳步推进中保障成果产出。",
			section2Content:
				"下属会非常依赖你的客观与公正。但有时候，大家在你的严密体系中可能会觉得条条框框偏多，缺乏灵活变通，容易让富有创造力的员工感到束缚。",
			section3Content:
				"适当精简那些冗长的汇报流程。支持下属在不违背基本合规的前提下进行敏捷尝试，建立开放的信任体系。",
			managementAnalysis: [
				{
					title: "流程管控力",
					score: 95,
					badge: "杰出",
					description:
						"极其精通构建闭环流程，规避系统性漏洞，能够高标准保障生产稳定性。",
				},
				{
					title: "客观稳定性",
					score: 93,
					badge: "高",
					description:
						"凡事严格按规章以身作则，极富责任心，对团队成员能起到极佳的表率效果。",
				},
				{
					title: "变革适应力",
					score: 55,
					badge: "需提高",
					description:
						"过于依赖原有计划，在面对急需打破原有组织架构的极端突发危机时，变通弹性稍弱。",
				},
			],
		},
	},
};

// Also define the aliases for order variations (e.g. ID -> DI, CD -> DC, etc.) to keep lookups clean and robust
export const COMPOSITE_ALIASES: Record<string, string> = {
	ID: "ID", // keep ID distinct if defined
	IC: "IC",
	IS: "IS",
	SD: "SD",
	SI: "SI",
	SC: "SC",
	CD: "CD",
	CI: "CI",
	CS: "CS",
};
