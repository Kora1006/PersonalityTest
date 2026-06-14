import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { useNavigate } from "react-router";

import type { DiscType } from "@/data/disc-colors";
import { appendHistory } from "@/lib/history";

interface Scores {
	C: number;
	D: number;
	I: number;
	S: number;
}

interface QuizStore {
	answer: (index: number, choice: DiscType) => void;
	answers: Record<number, DiscType>;
	currentQuestion: number;
	dominantType: DiscType | null;
	goNext: () => void;
	isCompleted: boolean;
	reset: () => void;
	scores: Scores;
	submit: () => void;
}

const QuizContext = createContext<QuizStore | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }) {
	const navigate = useNavigate();
	const [answers, setAnswers] = useState<Record<number, DiscType>>({});
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [isCompleted, setIsCompleted] = useState(false);

	const scores = useMemo<Scores>(() => {
		const s = { D: 0, I: 0, S: 0, C: 0 };
		for (const choice of Object.values(answers)) {
			s[choice]++;
		}
		return {
			D: Math.round((s.D / 24) * 100),
			I: Math.round((s.I / 24) * 100),
			S: Math.round((s.S / 24) * 100),
			C: Math.round((s.C / 24) * 100),
		};
	}, [answers]);

	const dominantType = useMemo<DiscType | null>(() => {
		if (Object.keys(answers).length < 24) {
			return null;
		}
		return (["D", "I", "S", "C"] as const).reduce((a, b) =>
			scores[a] >= scores[b] ? a : b
		);
	}, [answers, scores]);

	const reset = useCallback(() => {
		setAnswers({});
		setCurrentQuestion(0);
		setIsCompleted(false);
	}, []);

	const answer = useCallback((index: number, choice: DiscType) => {
		setAnswers((prev) => ({ ...prev, [index]: choice }));
	}, []);

	const goNext = useCallback(() => {
		setCurrentQuestion((prev) => Math.min(prev + 1, 23));
	}, []);

	const submit = useCallback(() => {
		const finalScores = { D: 0, I: 0, S: 0, C: 0 };
		for (const choice of Object.values(answers)) {
			finalScores[choice]++;
		}
		const percentages = {
			D: Math.round((finalScores.D / 24) * 100),
			I: Math.round((finalScores.I / 24) * 100),
			S: Math.round((finalScores.S / 24) * 100),
			C: Math.round((finalScores.C / 24) * 100),
		};
		const dominant = (["D", "I", "S", "C"] as const).reduce((a, b) =>
			percentages[a] >= percentages[b] ? a : b
		);
		const newRecord = appendHistory({
			dominantType: dominant,
			scores: percentages,
			note: "",
		});
		setIsCompleted(true);
		navigate(`/result?id=${newRecord.id}`);
	}, [answers, navigate]);

	const value = useMemo(
		() => ({
			answers,
			currentQuestion,
			isCompleted,
			scores,
			dominantType,
			reset,
			answer,
			goNext,
			submit,
		}),
		[
			answers,
			currentQuestion,
			isCompleted,
			scores,
			dominantType,
			reset,
			answer,
			goNext,
			submit,
		]
	);

	return <QuizContext value={value}>{children}</QuizContext>;
}

export function useQuiz(): QuizStore {
	const ctx = useContext(QuizContext);
	if (!ctx) {
		throw new Error("useQuiz must be used within QuizProvider");
	}
	return ctx;
}
