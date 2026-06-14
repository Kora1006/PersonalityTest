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

export const appendHistory = (
	record: Omit<HistoryRecord, "id" | "date">
): HistoryRecord => {
	const existing = getHistory();
	const newRecord: HistoryRecord = {
		id: crypto.randomUUID(),
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
