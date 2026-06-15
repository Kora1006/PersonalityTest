import { leadershipTheme } from "./leadership";
import { professionalTheme } from "./professional";
import { relationshipTheme } from "./relationship";

export type DiscType = "D" | "I" | "S" | "C";
export type ThemeId = "professional" | "relationship" | "leadership";

export interface TypeContent {
	detailAnalysis: {
		section1Title: string;
		section1Content: string;
		section2Title: string;
		section2Content: string;
		section3Title: string;
		section3Content: string;
	};
	growthAreas: string[];
	name: string;
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
	id: ThemeId;
	name: string;
	questionPrefix: string;
	types: Record<DiscType, TypeContent>;
}

export const themes: Record<ThemeId, ThemeConfig> = {
	professional: professionalTheme,
	relationship: relationshipTheme,
	leadership: leadershipTheme,
};
