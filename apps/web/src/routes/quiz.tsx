import { useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuiz } from "@/contexts/quiz-context";
import { DISC_COLORS } from "@/data/disc-colors";
import { QUIZ_QUESTIONS } from "@/data/quiz-questions";
import type { Route } from "./+types/quiz";

export function meta(_: Route.MetaArgs) {
	return [{ title: "DISC 测评 — 答题" }];
}

function shuffleOptions<T>(arr: T[], seed: number): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = ((seed * (i + 7)) ^ (seed >> 2)) % (i + 1);
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

export default function Quiz() {
	const navigate = useNavigate();
	const { answers, currentQuestion, answer, goNext, submit } = useQuiz();

	const question = QUIZ_QUESTIONS[currentQuestion];
	const totalQuestions = QUIZ_QUESTIONS.length;
	const progress = ((currentQuestion + 1) / totalQuestions) * 100;
	const isLastQuestion = currentQuestion === totalQuestions - 1;
	const currentAnswer = answers[currentQuestion];

	const shuffledOptions = useMemo(
		() => shuffleOptions(question.options, question.id * 31),
		[question]
	);

	const handleNext = () => {
		if (isLastQuestion) {
			submit();
		} else {
			goNext();
		}
	};

	return (
		<div className="flex min-h-svh flex-col bg-background">
			{/* Top Nav */}
			<header className="flex items-center gap-3 px-5 pt-12 pb-4">
				<button
					className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
					onClick={() => navigate("/")}
					type="button"
				>
					<span className="material-symbols-outlined text-xl">arrow_back</span>
				</button>
				<div className="flex-1" />
				<span className="font-mono font-semibold text-muted-foreground text-sm">
					{currentQuestion + 1} / {totalQuestions}
				</span>
			</header>

			{/* Progress Bar */}
			<div className="px-5 pb-6">
				<div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
					<div
						className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Question */}
			<main className="flex-1 overflow-y-auto px-5 pb-32">
				<div className="mb-4 flex min-h-[80px] flex-col justify-start">
					<p className="mb-3 font-mono font-semibold text-primary text-xs uppercase tracking-widest">
						{question.category}
					</p>
					<h2 className="font-bold text-foreground text-xl leading-snug">
						{question.scenario}
					</h2>
				</div>

				{/* Options */}
				<div className="flex flex-col gap-3">
					{shuffledOptions.map((option) => {
						const isSelected = currentAnswer === option.type;
						const color = DISC_COLORS[option.type];
						return (
							<button
								className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-150 ${
									isSelected
										? "border-primary bg-secondary shadow-[0_4px_12px_rgba(0,88,190,0.12)]"
										: "border-border bg-white hover:border-primary/30 hover:bg-secondary/50"
								}`}
								key={option.type}
								onClick={() => answer(currentQuestion, option.type)}
								type="button"
							>
								<div className="mb-1.5 flex items-start gap-3">
									<div
										className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
											isSelected
												? "border-primary bg-primary"
												: "border-border bg-white"
										}`}
									>
										{isSelected && (
											<span className="material-symbols-outlined text-sm text-white">
												check
											</span>
										)}
									</div>
									<p className="text-foreground text-sm leading-relaxed">
										{option.text}
									</p>
								</div>
								<p
									className="pl-8 font-mono font-semibold text-[10px] uppercase tracking-widest"
									style={{ color: color.hex }}
								>
									{option.subtitle}
								</p>
							</button>
						);
					})}
				</div>
			</main>

			{/* Bottom Action Bar */}
			<footer className="fixed right-0 bottom-0 left-0 border-border border-t bg-white/95 px-5 pt-4 pb-8 backdrop-blur-sm">
				<div className="mx-auto flex max-w-lg items-center gap-3">
					<button
						className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-accent"
						type="button"
					>
						<span className="material-symbols-outlined text-xl">
							help_outline
						</span>
					</button>
					<button
						className={`flex flex-1 items-center justify-center gap-2 rounded-2xl py-3.5 font-semibold transition-all duration-150 ${
							currentAnswer
								? "bg-primary text-white shadow-[0_8px_16px_rgba(0,88,190,0.2)] hover:opacity-90"
								: "cursor-not-allowed bg-secondary text-muted-foreground"
						}`}
						disabled={!currentAnswer}
						onClick={handleNext}
						type="button"
					>
						{isLastQuestion ? "提交结果" : "下一题"}
						<span className="material-symbols-outlined text-xl">
							arrow_forward
						</span>
					</button>
				</div>
			</footer>
		</div>
	);
}
