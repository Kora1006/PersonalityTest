export type DiscType = "D" | "I" | "S" | "C";

export const typeQuotes: Record<DiscType, string[]> = {
	D: [
		"你是把混乱变成系统的人",
		"在你面前没有问题，只有待解决的挑战",
		"领导力是你天生的语言",
	],
	I: [
		"走进房间，气氛就变了",
		"你的热情是团队最好的燃料",
		"影响力是你最强的超能力",
	],
	S: ["稳定，是最高级的力量", "你是团队真正的锚点", "持续比爆发更有价值"],
	C: [
		"细节里住着魔鬼，你比魔鬼更熟悉那里",
		"数据不会说谎，你也不会",
		"精确，是你给世界最好的礼物",
	],
};

export function getRandomQuote(type: DiscType): string {
	const quotes = typeQuotes[type];
	return quotes[Math.floor(Math.random() * quotes.length)];
}
