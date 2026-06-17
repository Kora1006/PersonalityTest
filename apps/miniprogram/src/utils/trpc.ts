import Taro from "@tarojs/taro";
import { storage } from "./storage";

const BASE_URL = process.env.TARO_APP_SERVER_URL ?? "http://localhost:3000";

function getAuthHeader(): Record<string, string> {
	const token = storage.getToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

// tRPC v11 HTTP client for WeChat Mini Program
export const trpc = {
	async query<T>(path: string, input?: unknown): Promise<T> {
		const inputStr =
			input === undefined ? undefined : JSON.stringify({ 0: input });
		const url = `${BASE_URL}/trpc/${path}?batch=1${inputStr ? `&input=${encodeURIComponent(inputStr)}` : ""}`;

		const res = await Taro.request({
			url,
			method: "GET",
			header: { "Content-Type": "application/json", ...getAuthHeader() },
		});

		if (res.statusCode >= 400) {
			throw new Error(`tRPC query failed: ${res.statusCode}`);
		}

		const results = res.data as Array<{
			result?: { data?: T };
			error?: { message?: string };
		}>;
		if (results[0]?.error) {
			throw new Error(results[0].error.message ?? "tRPC error");
		}
		return results[0]?.result?.data as T;
	},

	async mutate<T>(path: string, input?: unknown): Promise<T> {
		const res = await Taro.request({
			url: `${BASE_URL}/trpc/${path}?batch=1`,
			method: "POST",
			header: { "Content-Type": "application/json", ...getAuthHeader() },
			data: { 0: input },
		});

		if (res.statusCode >= 400) {
			throw new Error(`tRPC mutation failed: ${res.statusCode}`);
		}

		const results = res.data as Array<{
			result?: { data?: T };
			error?: { message?: string };
		}>;
		if (results[0]?.error) {
			throw new Error(results[0].error.message ?? "tRPC error");
		}
		return results[0]?.result?.data as T;
	},
};

export async function syncLocalHistoryToServer(): Promise<void> {
	const token = storage.getToken();
	if (!token) {
		return;
	}

	const local = storage.getHistory();
	if (local.length === 0) {
		return;
	}

	try {
		await trpc.mutate("assessments.syncHistory", local);
	} catch (err) {
		console.error("Failed to sync history to server:", err);
	}
}
