import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useMemo, useState } from "react";
import type { DiscType } from "../../data/disc-colors";
import { QUIZ_QUESTIONS } from "../../data/quiz-questions";
import { quizStore } from "../../utils/quiz-store";
import { storage } from "../../utils/storage";
import { trpc } from "../../utils/trpc";
import "./index.scss";

const QUICK_QUESTION_IDS = [1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12];

function shuffleOptions<T>(arr: T[], seed: number): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const j = ((seed * (i + 7)) ^ (seed >> 2)) % (i + 1);
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

const COLORS: Record<string, string> = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

export default function Quiz() {
	const mode = quizStore.getMode();
	const questions =
		mode === "quick"
			? QUIZ_QUESTIONS.filter((q) => QUICK_QUESTION_IDS.includes(q.id))
			: QUIZ_QUESTIONS;

	const [currentIndex, setCurrentIndex] = useState(() =>
		quizStore.getCurrentQuestion()
	);
	const [answers, setAnswers] = useState<Record<number, DiscType>>({});

	useLoad(() => {
		Taro.setNavigationBarTitle({
			title: mode === "quick" ? "快速测评" : "DISC 测评",
		});
	});

	const question = questions[currentIndex];
	const total = questions.length;
	const progress = ((currentIndex + 1) / total) * 100;
	const isLast = currentIndex === total - 1;
	const currentAnswer = answers[currentIndex];

	const shuffledOptions = useMemo(
		() => shuffleOptions(question.options, question.id * 31),
		[question]
	);

	const handleAnswer = (type: DiscType) => {
		setAnswers((prev) => ({ ...prev, [currentIndex]: type }));
	};

	const handleNext = () => {
		if (!currentAnswer) {
			return;
		}

		quizStore.setAnswer(currentIndex, currentAnswer);

		if (isLast) {
			// Submit: compute final result
			for (const [idx, choice] of Object.entries(answers)) {
				quizStore.setAnswer(Number(idx), choice);
			}
			const result = quizStore.buildResult();
			quizStore.setLastResult(result);
			storage.addHistoryRecord(result);

			// Handle pending invitation from QR code scan
			const pending = storage.getPendingInvitation();
			if (pending) {
				storage.clearPendingInvitation();
				const user = storage.getUser();
				if (user) {
					trpc
						.mutate("invitation.completeInvitation", {
							invitationId: pending.invitationId,
							inviteeId: user.id,
							inviteeResultId: result.id,
						})
						.then(() => {
							Taro.redirectTo({
								url: `/pages/comparison/index?myResultId=${result.id}&friendResultId=${pending.inviterResultId}`,
							});
						})
						.catch(() => {
							Taro.redirectTo({ url: "/pages/result/index" });
						});
					return;
				}
			}

			Taro.redirectTo({ url: "/pages/result/index" });
		} else {
			quizStore.setCurrentQuestion(currentIndex + 1);
			setCurrentIndex((prev) => prev + 1);
		}
	};

	const handleBack = () => {
		if (currentIndex > 0) {
			quizStore.setCurrentQuestion(currentIndex - 1);
			setCurrentIndex((prev) => prev - 1);
		} else {
			Taro.navigateBack();
		}
	};

	return (
		<View className="quiz-page">
			{/* Header */}
			<View className="quiz-header">
				<View className="back-btn" onClick={handleBack}>
					<Text className="back-icon">←</Text>
				</View>
				<Text className="progress-text">
					{currentIndex + 1} / {total}
				</Text>
			</View>

			{/* Progress Bar */}
			<View className="progress-bar-wrap">
				<View className="progress-bar-bg">
					<View
						className="progress-bar-fill"
						style={{ width: `${progress}%` }}
					/>
				</View>
			</View>

			{/* Question */}
			<ScrollView className="quiz-content" scrollY>
				<Text className="question-category">{question.category}</Text>
				<Text className="question-text">{question.scenario}</Text>

				{mode === "quick" && (
					<View className="quick-badge">
						<Text className="quick-badge-text">快速版</Text>
					</View>
				)}

				{/* Options */}
				{shuffledOptions.map((option) => {
					const isSelected = currentAnswer === option.type;
					return (
						<View
							className={`option-card ${isSelected ? "option-selected" : ""}`}
							key={option.type}
							onClick={() => handleAnswer(option.type)}
						>
							<View className="option-inner">
								<View className={`radio ${isSelected ? "radio-checked" : ""}`}>
									{isSelected && <Text className="radio-check">✓</Text>}
								</View>
								<Text className="option-text">{option.text}</Text>
							</View>
							<Text
								className="option-subtitle"
								style={{ color: COLORS[option.type] }}
							>
								{option.subtitle}
							</Text>
						</View>
					);
				})}

				<View style={{ height: "200rpx" }} />
			</ScrollView>

			{/* Bottom Bar */}
			<View className="bottom-bar">
				<View
					className={`next-btn ${currentAnswer ? "next-btn-active" : "next-btn-disabled"}`}
					onClick={handleNext}
				>
					<Text className="next-btn-text">
						{isLast ? "提交结果" : "下一题 →"}
					</Text>
				</View>
			</View>
		</View>
	);
}
