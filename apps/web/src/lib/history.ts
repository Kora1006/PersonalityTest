import type { DiscType } from "@/data/disc-colors";

const HISTORY_KEY = "disc_history";

export interface HistoryRecord {
	date: string;
	dominantType: DiscType;
	id: string;
	note: string;
	scores: { D: number; I: number; S: number; C: number };
}

export const getHistory = (): HistoryRecord[] => {
	try {
		const raw = localStorage.getItem(HISTORY_KEY);
		return raw ? (JSON.parse(raw) as HistoryRecord[]) : [];
	} catch {
		return [];
	}
};

export const generateUUID = (): string => {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	// Fallback to Math.random-based UUID generator for non-secure contexts (HTTP)
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const appendHistory = (
	record: Omit<HistoryRecord, "id" | "date">
): HistoryRecord => {
	const existing = getHistory();
	const newRecord: HistoryRecord = {
		id: generateUUID(),
		date: new Date().toISOString().slice(0, 10),
		...record,
	};
	localStorage.setItem(HISTORY_KEY, JSON.stringify([newRecord, ...existing]));
	return newRecord;
};

export const deleteRecord = (id: string): HistoryRecord[] => {
	const updated = getHistory().filter((r) => r.id !== id);
	localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
	return updated;
};

export const initMockIfEmpty = (mock: HistoryRecord[]): HistoryRecord[] => {
	const existing = getHistory();
	if (existing.length > 0) {
		return existing;
	}
	localStorage.setItem(HISTORY_KEY, JSON.stringify(mock));
	return mock;
};

export const clearHistory = (): void => {
	localStorage.removeItem(HISTORY_KEY);
};
