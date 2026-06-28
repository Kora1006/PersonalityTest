import Taro from "@tarojs/taro";
import { storage } from "./storage";

const BASE_URL = process.env.TARO_APP_SERVER_URL ?? "http://127.0.0.1:3000";

interface RequestOptions {
	auth?: boolean;
	data?: unknown;
	method?: "GET" | "POST" | "PUT" | "DELETE";
	url: string;
}

export async function request<T>({
	url,
	method = "GET",
	data,
	auth = true,
}: RequestOptions): Promise<T> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	if (auth) {
		const token = storage.getToken();
		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}
	}

	const res = await Taro.request({
		url: `${BASE_URL}${url}`,
		method,
		data,
		header: headers,
	});

	if (res.statusCode >= 400) {
		const errMsg =
			res.data && typeof res.data === "object" && "error" in res.data
				? String((res.data as any).error)
				: `Request failed: ${res.statusCode}`;
		throw new Error(errMsg);
	}

	return res.data as T;
}

export const api = {
	post: <T>(url: string, data: unknown, auth = true) =>
		request<T>({ url, method: "POST", data, auth }),
	get: <T>(url: string, auth = true) =>
		request<T>({ url, method: "GET", auth }),
};
