export const DISC_COLORS = {
	D: {
		hex: "#ef4444",
		gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
		label: "支配型",
		gradientClass: "disc-gradient-d",
		textClass: "text-disc-d",
		bgClass: "bg-disc-d",
		icon: "bolt",
	},
	I: {
		hex: "#f59e0b",
		gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
		label: "影响型",
		gradientClass: "disc-gradient-i",
		textClass: "text-disc-i",
		bgClass: "bg-disc-i",
		icon: "group",
	},
	S: {
		hex: "#10b981",
		gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
		label: "稳健型",
		gradientClass: "disc-gradient-s",
		textClass: "text-disc-s",
		bgClass: "bg-disc-s",
		icon: "balance",
	},
	C: {
		hex: "#3b82f6",
		gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
		label: "谨慎型",
		gradientClass: "disc-gradient-c",
		textClass: "text-disc-c",
		bgClass: "bg-disc-c",
		icon: "fact_check",
	},
} as const;

export type DiscType = keyof typeof DISC_COLORS;
