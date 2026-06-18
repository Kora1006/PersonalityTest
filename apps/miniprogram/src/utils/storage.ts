import Taro from "@tarojs/taro";

const HISTORY_KEY = "disc_history";
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const INVITATION_KEY = "pending_invitation";

export interface HistoryRecord {
	date: string;
	dominantType: string;
	id: string;
	note: string;
	scores: { D: number; I: number; S: number; C: number };
	theme?: "professional" | "relationship" | "leadership";
}

export const storage = {
	getHistory(): HistoryRecord[] {
		try {
			return Taro.getStorageSync<HistoryRecord[]>(HISTORY_KEY) || [];
		} catch {
			return [];
		}
	},

	saveHistory(records: HistoryRecord[]): void {
		Taro.setStorageSync(HISTORY_KEY, records);
	},

	addHistoryRecord(record: HistoryRecord): void {
		const records = storage.getHistory();
		storage.saveHistory([record, ...records]);
	},

	deleteHistoryRecord(id: string): void {
		const records = storage.getHistory().filter((r) => r.id !== id);
		storage.saveHistory(records);
	},

	getToken(): string | null {
		try {
			return Taro.getStorageSync<string>(TOKEN_KEY) || null;
		} catch {
			return null;
		}
	},

	setToken(token: string): void {
		Taro.setStorageSync(TOKEN_KEY, token);
	},

	clearToken(): void {
		Taro.removeStorageSync(TOKEN_KEY);
		Taro.removeStorageSync(USER_KEY);
	},

	getUser(): { id: string; name: string; email: string } | null {
		try {
			return Taro.getStorageSync(USER_KEY) || null;
		} catch {
			return null;
		}
	},

	setUser(user: { id: string; name: string; email: string }): void {
		Taro.setStorageSync(USER_KEY, user);
	},

	getPendingInvitation(): {
		invitationId: string;
		inviterResultId: string;
	} | null {
		try {
			return Taro.getStorageSync(INVITATION_KEY) || null;
		} catch {
			return null;
		}
	},

	setPendingInvitation(data: {
		invitationId: string;
		inviterResultId: string;
	}): void {
		Taro.setStorageSync(INVITATION_KEY, data);
	},

	clearPendingInvitation(): void {
		Taro.removeStorageSync(INVITATION_KEY);
	},
};
