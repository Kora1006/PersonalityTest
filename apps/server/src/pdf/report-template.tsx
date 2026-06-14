import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const DISC_LABELS: Record<string, string> = {
	C: "谨慎型",
	D: "支配型",
	I: "影响型",
	S: "稳健型",
};

const DISC_COLORS_HEX: Record<string, string> = {
	C: "#3b82f6",
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
};

const DISC_STRENGTHS: Record<string, string> = {
	C: "数据分析、质量把控和系统思维",
	D: "目标设定、快速决策和推动结果",
	I: "激励他人、创意表达和建立关系",
	S: "稳定执行、耐心倾听和团队协作",
};

const DISC_BLINDSPOTS: Record<string, string> = {
	C: "过度分析导致的决策迟缓",
	D: "对他人情绪的感知和耐心",
	I: "细节跟进和时间管理",
	S: "主动提出变革和应对冲突",
};

const DISC_CAREERS: Record<string, string[]> = {
	C: ["数据分析师", "财务审计", "质量工程师", "研究员"],
	D: ["企业家", "项目经理", "销售总监", "CEO"],
	I: ["市场营销", "公关传播", "培训师", "销售顾问"],
	S: ["客户服务", "人力资源", "咨询顾问", "教育工作者"],
};

const DISC_TEAM_DYNAMICS: Record<string, string> = {
	C: "确保团队决策的质量，与I型搭档时平衡创意与严谨性。",
	D: "倾向于主导方向、推动进度，与S型搭档时效果最佳。",
	I: "是团队的能量来源，与C型搭档时可形成创意与执行的互补。",
	S: "是团队的稳定器，与D型搭档时能有效执行战略目标。",
};

const styles = StyleSheet.create({
	body: {
		color: "#1f2937",
		fontFamily: "Helvetica",
		fontSize: 12,
		lineHeight: 1.6,
		padding: 40,
	},
	caption: {
		color: "#6b7280",
		fontSize: 10,
	},
	coverDate: {
		color: "#9ca3af",
		fontSize: 12,
		marginTop: 8,
	},
	coverSubtitle: {
		color: "#6b7280",
		fontSize: 16,
		marginTop: 8,
	},
	coverTitle: {
		fontSize: 48,
		fontWeight: "bold",
		marginTop: 8,
	},
	coverTypeBadge: {
		borderRadius: 8,
		marginTop: 24,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	coverTypeName: {
		color: "#ffffff",
		fontSize: 14,
		fontWeight: "bold",
	},
	h1: {
		borderRadius: 4,
		color: "#ffffff",
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 16,
		marginTop: 32,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	h2: {
		color: "#374151",
		fontSize: 14,
		fontWeight: "bold",
		marginBottom: 8,
		marginTop: 16,
	},
	page: {
		backgroundColor: "#ffffff",
		flexDirection: "column",
	},
	scoreBar: {
		borderRadius: 2,
		height: 8,
		marginTop: 4,
	},
	scoreLabel: {
		fontSize: 11,
	},
	scoreRow: {
		marginBottom: 8,
	},
	tag: {
		backgroundColor: "#f3f4f6",
		borderRadius: 12,
		fontSize: 10,
		marginRight: 6,
		marginTop: 4,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	tagContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
});

interface ReportData {
	date: string;
	dominantType: string;
	isPaid: boolean;
	note?: string;
	scores: {
		C: number;
		D: number;
		I: number;
		S: number;
	};
	userName: string;
}

function ScoreBar({
	color,
	label,
	value,
}: {
	color: string;
	label: string;
	value: number;
}) {
	return (
		<View style={styles.scoreRow}>
			<Text style={styles.scoreLabel}>
				{label}: {value}%
			</Text>
			<View
				style={[styles.scoreBar, { backgroundColor: "#e5e7eb", width: "100%" }]}
			>
				<View
					style={[
						styles.scoreBar,
						{ backgroundColor: color, width: `${value}%` },
					]}
				/>
			</View>
		</View>
	);
}

function CoverSection({
	data,
	typeColor,
	typeLabel,
}: {
	data: ReportData;
	typeColor: string;
	typeLabel: string;
}) {
	return (
		<>
			<Text style={styles.coverSubtitle}>DISC 性格测评报告</Text>
			<Text style={[styles.coverTitle, { color: typeColor }]}>
				{data.dominantType}
			</Text>
			<Text style={styles.coverSubtitle}>{typeLabel}</Text>
			<View style={[styles.coverTypeBadge, { backgroundColor: typeColor }]}>
				<Text style={styles.coverTypeName}>{data.userName}</Text>
			</View>
			<Text style={styles.coverDate}>测评日期：{data.date}</Text>
			{data.note ? <Text style={styles.caption}>备注：{data.note}</Text> : null}
		</>
	);
}

function ScoresSection({
	data,
	typeColor,
	typeLabel,
}: {
	data: ReportData;
	typeColor: string;
	typeLabel: string;
}) {
	return (
		<>
			<Text style={[styles.h1, { backgroundColor: typeColor }]}>
				第一章 性格概览
			</Text>
			<Text>
				您的主导类型为{typeLabel}（{data.dominantType}
				型），具备鲜明的行为特征和决策风格。
			</Text>
			<View style={{ marginTop: 16 }}>
				{(["D", "I", "S", "C"] as const).map((t) => (
					<ScoreBar
						color={DISC_COLORS_HEX[t] ?? "#6b7280"}
						key={t}
						label={`${DISC_LABELS[t] ?? t}（${t}）`}
						value={data.scores[t]}
					/>
				))}
			</View>
		</>
	);
}

function StrengthsSection({
	dominantType,
	typeLabel,
}: {
	dominantType: string;
	typeLabel: string;
}) {
	const strength = DISC_STRENGTHS[dominantType] ?? "";
	const blindspot = DISC_BLINDSPOTS[dominantType] ?? "";
	const careers = DISC_CAREERS[dominantType] ?? [];

	return (
		<>
			<Text style={[styles.h1, { backgroundColor: "#374151" }]}>
				第二章 核心优势与行为盲点
			</Text>
			<Text style={styles.h2}>核心优势</Text>
			<Text>
				作为{typeLabel}，您在{strength}方面具有显著优势。
			</Text>
			<Text style={styles.h2}>行为盲点</Text>
			<Text>需要关注{blindspot}。</Text>
			<Text style={[styles.h1, { backgroundColor: "#374151" }]}>
				第三章 职场建议
			</Text>
			<Text style={styles.h2}>适合职业方向</Text>
			<View style={styles.tagContainer}>
				{careers.map((career) => (
					<Text key={career} style={styles.tag}>
						{career}
					</Text>
				))}
			</View>
		</>
	);
}

function TeamSection({
	dominantType,
	typeLabel,
}: {
	dominantType: string;
	typeLabel: string;
}) {
	const dynamics = DISC_TEAM_DYNAMICS[dominantType] ?? "";

	return (
		<>
			<Text style={[styles.h1, { backgroundColor: "#374151" }]}>
				第四章 团队协作动态
			</Text>
			<Text>
				在团队中，{typeLabel}
				{dynamics}
			</Text>
		</>
	);
}

export function ReportDocument({ data }: { data: ReportData }) {
	const typeColor = DISC_COLORS_HEX[data.dominantType] ?? "#3b82f6";
	const typeLabel = DISC_LABELS[data.dominantType] ?? data.dominantType;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.body}>
					<CoverSection
						data={data}
						typeColor={typeColor}
						typeLabel={typeLabel}
					/>
					<ScoresSection
						data={data}
						typeColor={typeColor}
						typeLabel={typeLabel}
					/>
					<StrengthsSection
						dominantType={data.dominantType}
						typeLabel={typeLabel}
					/>
					<TeamSection dominantType={data.dominantType} typeLabel={typeLabel} />
				</View>
			</Page>
		</Document>
	);
}
