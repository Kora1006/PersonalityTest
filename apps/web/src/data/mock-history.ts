import type { HistoryRecord } from "@/lib/history";

export const MOCK_HISTORY: HistoryRecord[] = [
	{
		id: "mock-1",
		date: "2026-03-15",
		dominantType: "D",
		scores: { D: 42, I: 21, S: 25, C: 12 },
		note: "季度回顾测评",
	},
	{
		id: "mock-2",
		date: "2026-01-08",
		dominantType: "I",
		scores: { D: 17, I: 50, S: 17, C: 16 },
		note: "年初职业规划",
	},
	{
		id: "mock-3",
		date: "2025-11-22",
		dominantType: "S",
		scores: { D: 13, I: 25, S: 45, C: 17 },
		note: "",
	},
];
