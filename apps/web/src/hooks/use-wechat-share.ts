import { env } from "@PersonalityTest/env/web";
import { useEffect } from "react";

interface WechatShareConfig {
	desc: string;
	imgUrl: string;
	/** Share link. Defaults to current page URL (without hash). */
	link?: string;
	title: string;
}

interface WxInstance {
	config: (params: object) => void;
	error: (cb: (err: unknown) => void) => void;
	ready: (cb: () => void) => void;
	updateAppMessageShareData: (params: object) => void;
	updateTimelineShareData: (params: object) => void;
}

declare const wx: WxInstance | undefined;

const WE_CHAT_UA_RE = /MicroMessenger/i;

function isWeChat(): boolean {
	return (
		typeof navigator !== "undefined" && WE_CHAT_UA_RE.test(navigator.userAgent)
	);
}

function loadJSSDK(): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		if (typeof wx !== "undefined") {
			resolve();
			return;
		}
		const existingScript = document.getElementById("wx-jssdk");
		if (existingScript) {
			existingScript.addEventListener("load", () => resolve());
			existingScript.addEventListener("error", reject);
			return;
		}
		const script = document.createElement("script");
		script.id = "wx-jssdk";
		script.src = "//res.wx.qq.com/open/js/jweixin-1.6.0.js";
		script.onload = () => resolve();
		script.onerror = () => reject(new Error("Failed to load WeChat JSSDK"));
		document.head.appendChild(script);
	});
}

export function useWechatShare(config: WechatShareConfig): void {
	const { title, desc, imgUrl, link } = config;

	useEffect(() => {
		if (!isWeChat()) {
			return;
		}

		let cancelled = false;

		const run = async () => {
			try {
				await loadJSSDK();
				if (cancelled) {
					return;
				}

				// Signature URL must be current page URL without hash (WeChat requirement)
				const signUrl = location.href.split("#")[0];
				const shareLink = (link ?? location.href).split("#")[0];

				const res = await fetch(
					`${env.VITE_SERVER_URL}/api/auth/wechat/jssdk-signature?url=${encodeURIComponent(signUrl)}`,
					{ credentials: "include" }
				);
				if (!res.ok || cancelled) {
					return;
				}

				const data = (await res.json()) as {
					appId: string;
					timestamp: number;
					nonceStr: string;
					signature: string;
				};
				if (cancelled) {
					return;
				}

				const wxInstance = (globalThis as unknown as { wx: WxInstance }).wx;
				if (!wxInstance) {
					return;
				}

				wxInstance.config({
					debug: false,
					appId: data.appId,
					timestamp: data.timestamp,
					nonceStr: data.nonceStr,
					signature: data.signature,
					jsApiList: ["updateAppMessageShareData", "updateTimelineShareData"],
				});

				wxInstance.ready(() => {
					if (cancelled) {
						return;
					}
					wxInstance.updateAppMessageShareData({
						title,
						desc,
						link: shareLink,
						imgUrl,
					});
					wxInstance.updateTimelineShareData({
						title,
						link: shareLink,
						imgUrl,
					});
				});

				wxInstance.error(() => {
					// Silent failure — WeChat will fall back to default share behavior
				});
			} catch {
				// Silent failure — non-critical feature
			}
		};

		run();

		return () => {
			cancelled = true;
		};
	}, [title, desc, imgUrl, link]);
}
