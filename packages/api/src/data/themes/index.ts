import { leadershipTheme } from "./leadership";
import { professionalTheme } from "./professional";
import { relationshipTheme } from "./relationship";

export type DiscType = "D" | "I" | "S" | "C";
export type ThemeId = "professional" | "relationship" | "leadership";

export interface TypeContent {
	// Theme-specific fields
	careerPaths?: Array<{
		title: string;
		compatibility: string;
		icon: string;
	}>;
	detailAnalysis: {
		section1Title: string;
		section1Content: string;
		section2Title: string;
		section2Content: string;
		section3Title: string;
		section3Content: string;
	};
	growthAreas: string[];
	managementAnalysis?: Array<{
		title: string;
		score: number;
		badge: string;
		description: string;
	}>;
	name: string;
	relationshipInsight?: {
		intimacy: string;
		communicationPreference: string[];
	};
	relationshipMetrics?: Array<{
		title: string;
		score: number;
	}>;
	relationshipSuggestions?: Array<{
		title: string;
		icon: string;
		description: string;
	}>;
	shareQuotes: string[];
	strengths: string[];
	tagline: string;
}

export interface ThemeConfig {
	cardTheme: {
		backgroundGradient: [string, string];
		primaryColor: string;
	};
	entrySubtitle: string;
	entryTitle: string;
	heroImage: string;
	id: ThemeId;
	name: string;
	questionPrefix: string;
	themeIcon: string;
	types: Record<DiscType, TypeContent>;
}

export const themes: Record<ThemeId, ThemeConfig> = {
	professional: professionalTheme,
	relationship: relationshipTheme,
	leadership: leadershipTheme,
};

// biome-ignore lint/style/noExportedImports: also used locally in getPersonalityContent
import { COMPOSITE_PROFILES } from "./composite-profiles";

export { COMPOSITE_PROFILES };

export function getPersonalityContent(
	themeId: ThemeId,
	dominantType: string
): TypeContent {
	const baseTheme = themes[themeId] ?? themes.professional;
	const baseType = (dominantType.charAt(0) || "D") as DiscType;
	const defaultContent = baseTheme.types[baseType];

	// If it is a composite type and exists in our composite profiles
	const comp = COMPOSITE_PROFILES[dominantType];
	if (dominantType.length === 2 && comp) {
		let detailAnalysis = {
			section1Title: defaultContent.detailAnalysis.section1Title,
			section1Content: "",
			section2Title: defaultContent.detailAnalysis.section2Title,
			section2Content: "",
			section3Title: defaultContent.detailAnalysis.section3Title,
			section3Content: "",
		};

		let careerPaths = defaultContent.careerPaths;
		let managementAnalysis = defaultContent.managementAnalysis;
		let relationshipInsight = defaultContent.relationshipInsight;
		let relationshipSuggestions = defaultContent.relationshipSuggestions;
		let relationshipMetrics = defaultContent.relationshipMetrics;

		if (themeId === "professional") {
			detailAnalysis = {
				section1Title: "职场协作风格",
				section1Content: comp.professional.section1Content,
				section2Title: "你的沟通方式",
				section2Content: comp.professional.section2Content,
				section3Title: "核心成长方向",
				section3Content: comp.professional.section3Content,
			};
			careerPaths = comp.professional.careerPaths;
		} else if (themeId === "relationship") {
			// Construct communication preferences text
			const prefsText = comp.relationship.communicationPreference
				.map((p: string) => `· ${p}`)
				.join("\n");
			const sec2Content = `${comp.relationship.intimacy}\n\n你的沟通偏好：\n${prefsText}`;

			// Construct growth suggestion text
			const sugText = comp.relationship.relationshipSuggestions
				.map(
					(
						s: { title: string; icon: string; description: string },
						idx: number
					) => `${idx + 1}. 【${s.title}】${s.description}`
				)
				.join("\n");
			const sec3Content = `在亲密关系发展中，以下成长建议对你至关重要：\n\n${sugText}`;

			detailAnalysis = {
				section1Title: "你的恋爱模式",
				section1Content: comp.relationship.section1Content,
				section2Title: "和你相处的密码",
				section2Content: sec2Content,
				section3Title: "你在关系中的成长点",
				section3Content: sec3Content,
			};
			relationshipInsight = {
				intimacy: comp.relationship.intimacy,
				communicationPreference: comp.relationship.communicationPreference,
			};
			relationshipSuggestions = comp.relationship.relationshipSuggestions;

			// Generate relationship metrics based on the composite letters
			const char1 = dominantType.charAt(0) as DiscType;
			const char2 = dominantType.charAt(1) as DiscType;
			const getMetric = (char: DiscType, defaultScore: number) => {
				switch (char) {
					case "D":
						return { title: "关系掌控度", score: defaultScore };
					case "I":
						return { title: "情感共鸣度", score: defaultScore };
					case "S":
						return { title: "情感包容力", score: defaultScore };
					case "C":
						return { title: "理性分析度", score: defaultScore };
					default:
						return { title: "关系掌控度", score: defaultScore };
				}
			};
			relationshipMetrics = [getMetric(char1, 92), getMetric(char2, 86)];
		} else if (themeId === "leadership") {
			detailAnalysis = {
				section1Title: "你的领导风格",
				section1Content: comp.leadership.section1Content,
				section2Title: "你的团队需要什么",
				section2Content: comp.leadership.section2Content,
				section3Title: "你的领导力成长点",
				section3Content: comp.leadership.section3Content,
			};
			managementAnalysis = comp.leadership.managementAnalysis;
		}

		return {
			name: comp[themeId]?.name ?? comp.name,
			tagline: comp[themeId]?.tagline ?? comp.tagline,
			strengths: comp.strengths,
			growthAreas: comp.growthAreas,
			shareQuotes: comp.shareQuotes,
			detailAnalysis,
			careerPaths,
			managementAnalysis,
			relationshipInsight,
			relationshipSuggestions,
			relationshipMetrics,
		};
	}

	return defaultContent;
}
