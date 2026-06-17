import { themes } from "@PersonalityTest/api/data/themes/index";
import { ScrollView, Text, View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useMemo, useState } from "react";
import { Icon } from "../../components/icon";
import type { DiscType } from "../../data/disc-colors";
import {
	QUICK_QUESTION_COUNT,
	QUIZ_QUESTIONS_BY_THEME,
} from "../../data/quiz-questions";
import type { ThemeId } from "../../utils/quiz-store";
import { quizStore } from "../../utils/quiz-store";
import { storage } from "../../utils/storage";
import { syncLocalHistoryToServer, trpc } from "../../utils/trpc";
import "./index.scss";

function shuffleOptions<T>(arr: T[], seed: number): T[] {
	const out = [...arr];
	for (let i = out.length - 1; i > 0; i--) {
		const h = (seed * 1_664_525 + i * 22_695_477) % 2_147_483_647;
		const j = Math.abs(h) % (i + 1);
		const temp = out[i] as T;
		out[i] = out[j] as T;
		out[j] = temp;
	}
	return out;
}

export default function Quiz() {
	const mode = quizStore.getMode();

	const [currentIndex, setCurrentIndex] = useState(() =>
		quizStore.getCurrentQuestion()
	);
	const [answers, setAnswers] = useState<Record<number, DiscType>>({});
	const [themeId, setThemeId] = useState<ThemeId>(quizStore.getTheme());

	const questions = useMemo(() => {
		const all =
			QUIZ_QUESTIONS_BY_THEME[themeId] ?? QUIZ_QUESTIONS_BY_THEME.professional;
		return mode === "quick" ? all.slice(0, QUICK_QUESTION_COUNT) : all;
	}, [themeId, mode]);

	useLoad((options: { theme?: string; mode?: string } = {}) => {
		const paramTheme = (options.theme as ThemeId) || "professional";
		const paramMode = (options.mode as "full" | "quick") || "full";
		if (paramTheme !== quizStore.getTheme() || paramMode !== mode) {
			quizStore.reset(paramMode, paramTheme);
			setCurrentIndex(0);
			setAnswers({});
		} else {
			quizStore.setTheme(paramTheme);
		}
		setThemeId(paramTheme);
		Taro.setNavigationBarTitle({
			title: paramMode === "quick" ? "快速测评" : "DISC 测评",
		});
	});

	const question = questions[currentIndex]!;
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

	const handleNext = async () => {
		if (!currentAnswer) {
			return;
		}

		quizStore.setAnswer(currentIndex, currentAnswer);

		if (isLast) {
			for (const [idx, choice] of Object.entries(answers)) {
				quizStore.setAnswer(Number(idx), choice);
			}
			const result = quizStore.buildResult();
			quizStore.setLastResult(result);
			storage.addHistoryRecord(result);
			if (storage.getToken()) {
				await syncLocalHistoryToServer().catch(() => null);
			}

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
				<View className="header-left">
					<View className="back-btn" onClick={handleBack}>
						<Icon color="#0058be" name="arrow_back" size={36} />
					</View>
					<Text className="header-title">DISC 测评</Text>
				</View>
				<Text className="progress-text">
					第 {currentIndex + 1} / {total} 题
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

			{/* Question content */}
			<ScrollView className="quiz-content" scrollY>
				<View className="question-wrap">
					<Text className="question-text">
						{themes[themeId].questionPrefix}
						{question.scenario}
					</Text>

					{mode === "quick" && (
						<View className="quick-badge">
							<Text className="quick-badge-text">快速版</Text>
						</View>
					)}

					{/* Options list */}
					<View className="options-list">
						{shuffledOptions.map((option) => {
							const isSelected = currentAnswer === option.type;
							return (
								<View
									className={`option-card ${isSelected ? "option-selected" : ""}`}
									key={option.type}
									onClick={() => handleAnswer(option.type)}
								>
									<View className="option-flex">
										<View
											className={`radio ${isSelected ? "radio-checked" : ""}`}
										>
											{isSelected && <View className="radio-inner" />}
										</View>
										<View className="option-content">
											<Text className="option-text">{option.text}</Text>
										</View>
									</View>
								</View>
							);
						})}
					</View>
				</View>
				<View style={{ height: "100rpx" }} />
			</ScrollView>

			{/* Bottom Bar */}
			<View className="bottom-bar">
				<View
					className={`next-btn ${currentAnswer ? "next-btn-active" : "next-btn-disabled"}`}
					onClick={handleNext}
				>
					<Text className="next-btn-text">
						{isLast ? "提交结果" : "下一题"}
					</Text>
				</View>
			</View>
		</View>
	);
}
