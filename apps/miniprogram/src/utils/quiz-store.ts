import type { DiscType } from "../data/disc-colors";

export type ThemeId = "professional" | "relationship" | "leadership";

export interface QuizResult {
	date: string;
	dominantType: DiscType;
	id: string;
	note: string;
	scores: { D: number; I: number; S: number; C: number };
	theme: ThemeId;
}

interface QuizState {
	answers: Record<number, DiscType>;
	currentQuestion: number;
	lastResult: QuizResult | null;
	mode: "full" | "quick";
	theme: ThemeId;
}

const state: QuizState = {
	answers: {},
	currentQuestion: 0,
	mode: "full",
	theme: "professional",
	lastResult: null,
};

export const quizStore = {
	reset(mode: "full" | "quick" = "full", theme: ThemeId = "professional") {
		state.answers = {};
		state.currentQuestion = 0;
		state.mode = mode;
		state.theme = theme;
		state.lastResult = null;
	},

	setAnswer(index: number, choice: DiscType) {
		state.answers[index] = choice;
	},

	getAnswer(index: number): DiscType | undefined {
		return state.answers[index];
	},

	getCurrentQuestion() {
		return state.currentQuestion;
	},

	setCurrentQuestion(n: number) {
		state.currentQuestion = n;
	},

	getMode() {
		return state.mode;
	},

	getTheme(): ThemeId {
		return state.theme;
	},

	setTheme(theme: ThemeId) {
		state.theme = theme;
	},

	getTotalQuestions() {
		return state.mode === "quick" ? 20 : 40;
	},

	computeScores(): { D: number; I: number; S: number; C: number } {
		const total = quizStore.getTotalQuestions();
		const raw = { D: 0, I: 0, S: 0, C: 0 };
		for (const choice of Object.values(state.answers)) {
			raw[choice]++;
		}
		return {
			D: Math.round((raw.D / total) * 100),
			I: Math.round((raw.I / total) * 100),
			S: Math.round((raw.S / total) * 100),
			C: Math.round((raw.C / total) * 100),
		};
	},

	computeDominant(scores: {
		D: number;
		I: number;
		S: number;
		C: number;
	}): DiscType {
		return (["D", "I", "S", "C"] as const).reduce((a, b) =>
			scores[a] >= scores[b] ? a : b
		);
	},

	buildResult(): QuizResult {
		const scores = quizStore.computeScores();
		const dominantType = quizStore.computeDominant(scores);
		return {
			id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
			date: new Date().toISOString().slice(0, 10),
			dominantType,
			scores,
			note: "",
			theme: state.theme,
		};
	},

	setLastResult(result: QuizResult) {
		state.lastResult = result;
	},

	getLastResult(): QuizResult | null {
		return state.lastResult;
	},
};
