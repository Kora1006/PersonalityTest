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
