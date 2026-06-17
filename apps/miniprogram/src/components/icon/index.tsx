import { Image } from "@tarojs/components";
import type { CSSProperties } from "react";

interface IconProps {
	color?: string;
	name: string;
	size?: number;
	style?: CSSProperties;
}

export function toBase64(str: string): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	let result = "";
	let i = 0;
	while (i < str.length) {
		const byte1 = str.charCodeAt(i++) & 0xff;
		const byte2 = i < str.length ? str.charCodeAt(i++) & 0xff : Number.NaN;
		const byte3 = i < str.length ? str.charCodeAt(i++) & 0xff : Number.NaN;

		const enc1 = byte1 >> 2;
		const enc2 = ((byte1 & 3) << 4) | (Number.isNaN(byte2) ? 0 : byte2 >> 4);
		const enc3 = Number.isNaN(byte2)
			? 64
			: ((byte2 & 15) << 2) | (Number.isNaN(byte3) ? 0 : byte3 >> 6);
		const enc4 = Number.isNaN(byte3) ? 64 : byte3 & 63;

		result +=
			chars.charAt(enc1) +
			chars.charAt(enc2) +
			(enc3 === 64 ? "=" : chars.charAt(enc3)) +
			(enc4 === 64 ? "=" : chars.charAt(enc4));
	}
	return result;
}

export function Icon({ name, size = 24, color = "#151c27", style }: IconProps) {
	let path = "";
	const viewBox = "0 0 24 24";

	switch (name) {
		case "bolt":
			path = "M19 11h-6V3l-7 10h6v8l7-10z";
			break;
		case "groups":
			path =
				"M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z";
			break;
		case "balance":
			path =
				"M12 2a1 1 0 0 1 1 1v1.07c2.8.4 5 2.8 5 5.76V11.23l2.87 2.87c.18.17.18.46 0 .63l-.63.63a.45.45 0 0 1-.63 0L17 12.63V17c0 1.66-1.34 3-3 3h-4c-1.66 0-3-1.34-3-3v-4.37l-2.62 2.62a.45.45 0 0 1-.63 0l-.63-.63c-.18-.17-.18-.46 0-.63L6 11.23V8.83c0-2.96 2.2-5.36 5-5.76V3a1 1 0 0 1 1-1zm3.5 7c.83 0 1.5-.67 1.5-1.5S16.33 6 15.5 6s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-7 0C9.33 9 10 8.33 10 7.5S9.33 6 8.5 6s-1.5.67-1.5 1.5S7.67 9 8.5 9z";
			break;
		case "fact_check":
			path =
				"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
			break;
		case "psychology":
			path =
				"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z";
			break;
		case "forum":
			path =
				"M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z";
			break;
		case "insights":
			path =
				"M21 5.41L19.59 4 13 10.59 9.71 7.3 2 15l1.41 1.41 6.3-6.29 3.29 3.29L21 5.41zM2 19h19v2H2v-2z";
			break;
		case "diversity_3":
			path =
				"M12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-6 7.5c0-2.3 3.6-3.5 6-3.5s6 1.2 6 3.5V18H6v-2.5zm12-7c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-12 0c1.1 0 2-.9 2-2S5.1 4 4 4s-2 .9-2 2 .9 2 2 2zm18 7.5V18h-4v-2.5c0-1.2-.5-2.2-1.3-2.9 1.8-.1 5.3 1 5.3 2.9zM4 15.5c0-1.9 3.5-3 5.3-2.9-.8.7-1.3 1.7-1.3 2.9V18H4v-2.5z";
			break;
		case "arrow_back":
			path = "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z";
			break;
		case "info":
			path =
				"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z";
			break;
		case "workspace_premium":
			path =
				"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 13h-2V7h2v8zm-1 3.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z";
			break;
		case "corporate_fare":
			path =
				"M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm0-4H4V5h6v2zm10 12h-8v-2h8v2zm0-4h-8v-2h8v2zm0-4h-8V9h8v2z";
			break;
		case "trending_up":
			path =
				"M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z";
			break;
		case "person":
			path =
				"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z";
			break;
		case "history":
			path =
				"M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z";
			break;
		case "quiz":
			path =
				"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 9h-4v4h-2v-4H7v-2h4V6h2v4h4v2z";
			break;
		case "play_arrow":
			path = "M8 5v14l11-7z";
			break;
		case "trash":
		case "delete":
			path =
				"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z";
			break;
		case "search":
			path =
				"M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z";
			break;
		case "favorite":
		case "volunteer_activism":
			path =
				"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z";
			break;
		case "check_circle":
			path =
				"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z";
			break;
		case "rocket_launch":
			path =
				"M12 2C8 6 8 10 9 14l-3 3v2h2l3-3c4 1 8 1 12-3 0-5-4-9-9-9zM9 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z";
			break;
		case "lightbulb":
		case "tips_and_updates":
			path =
				"M12 2C7.58 2 4 5.58 4 10c0 2.76 1.4 5.2 3.54 6.64L7.54 19c0 .55.45 1 1 1h6.92c.55 0 1-.45 1-1l0-2.36C18.6 15.2 20 12.76 20 10c0-4.42-3.58-8-8-8zm3.5 16.5H8.5V17h7v1.5zm0-2.5H8.5v-1h7v1z";
			break;
		case "palette":
			path =
				"M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.22-1.19-.59-1.65-.1-.13-.16-.3-.16-.48 0-.41.34-.75.75-.75h1.9c2.92 0 5.6-2.38 5.6-5.3C22 6.35 17.51 2 12 2zm-5 9c-.83 0-1.5-.67-1.5-1.5S6.17 8 7 8s1.5.67 1.5 1.5S7.83 11 7 11zm3-3c-.83 0-1.5-.67-1.5-1.5S9.17 5 10 5s1.5.67 1.5 1.5S10.83 8 10 8zm4 0c-.83 0-1.5-.67-1.5-1.5S13.17 5 14 5s1.5.67 1.5 1.5S14.83 8 14 8zm3 3c-.83 0-1.5-.67-1.5-1.5S16.17 8 17 8s1.5.67 1.5 1.5S17.83 11 17 11z";
			break;
		case "event":
		case "event_available":
			path =
				"M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z";
			break;
		case "support_agent":
			path =
				"M12 2c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z";
			break;
		case "assignment":
		case "assignment_turned_in":
			path =
				"M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm5 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V7h10v2z";
			break;
		case "admin_panel_settings":
			path =
				"M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3zm0 10.99h6c-.53 4.12-3.28 7.79-6 8.94V13H6V6.39l6-2.25v8.86z";
			break;
		case "developer_mode":
			path =
				"M7 5h10v2h2V3c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v4h2V5zm10 14H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2zM15.54 9.54L14 8l-4 4 4 4 1.54-1.54L13.08 12l2.46-2.46z";
			break;
		case "analytics":
			path =
				"M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z";
			break;
		case "account_balance":
			path =
				"M4 10h3v7H4zm6 0h3v7h-3zm6 0h3v7h-3zM2 22h20v-2H2zm10-19L2 9v2h20V9z";
			break;
		case "verified":
			path =
				"M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7l-3.61.81.34 3.7L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z";
			break;
		case "stars":
			path =
				"M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.98-.42L12 5l1.86 4.54 4.98.42-3.73 3.23 1.12 4.81z";
			break;
		case "radar":
			path =
				"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z";
			break;
		case "download":
			path =
				"M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z";
			break;
		case "share":
			path =
				"M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z";
			break;
		case "spa":
			path =
				"M15.4 10.4c.5-1 1-2.4.9-3.9 1.4.3 2.7 1.1 3.5 2.2-1.1.4-2.8.9-4.4 1.7zM3.1 8.7c.8-1.1 2.1-1.9 3.5-2.2-.1 1.5.4 2.9.9 3.9-1.6-.8-3.3-1.3-4.4-1.7zM12 3c-.9 3.3-3.4 6-6.5 7 2.9.8 5.3 2.8 6.5 5.5 1.2-2.7 3.6-4.7 6.5-5.5-3.1-1-5.6-3.7-6.5-7z";
			break;
		case "hearing":
			path =
				"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z";
			break;
		case "chat":
			path =
				"M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z";
			break;
		case "event_note":
		default:
			break;
	}

	const svgString = `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"><path d="${path}" fill="${color}"/></svg>`;
	const src = `data:image/svg+xml;base64,${toBase64(svgString)}`;

	return (
		<Image
			src={src}
			style={{
				width: `${size}rpx`,
				height: `${size}rpx`,
				display: "block",
				...style,
			}}
		/>
	);
}
