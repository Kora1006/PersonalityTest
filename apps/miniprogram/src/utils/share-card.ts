import Taro from "@tarojs/taro";
import { DISC_COLORS, type DiscType } from "../data/disc-colors";
import { getRandomQuote } from "../data/type-quotes";

declare const wx: any;

const W = 750;
const H = 1334;

interface ShareCardInput {
	cardTheme?: { primaryColor: string; backgroundGradient: [string, string] };
	dominantType: DiscType;
	qrcodeBase64?: string;
	scores: { D: number; I: number; S: number; C: number };
}

const BASE_URL = process.env.TARO_APP_SERVER_URL ?? "http://localhost:3000";

// Fetch mini QR code as base64 from server
export async function fetchMiniQrcode(scene: string): Promise<string | null> {
	try {
		const token = (await import("./storage")).storage.getToken();
		const res = await Taro.request({
			url: `${BASE_URL}/api/auth/wechat/mini-qrcode?scene=${encodeURIComponent(scene)}&page=pages/index/index`,
			method: "GET",
			header: token ? { Authorization: `Bearer ${token}` } : {},
		});
		if (res.statusCode === 200 && res.data?.base64) {
			return `data:image/png;base64,${res.data.base64}`;
		}
	} catch {
		// ignore — qrcode is optional
	}
	return null;
}

// Draw a mini radar chart on an OffscreenCanvas 2D context
function drawMiniRadar(
	ctx: CanvasRenderingContext2D,
	scores: { D: number; I: number; S: number; C: number },
	cx: number,
	cy: number,
	radius: number
) {
	const axes = [
		{ type: "D" as DiscType, angle: -90 },
		{ type: "I" as DiscType, angle: 0 },
		{ type: "S" as DiscType, angle: 90 },
		{ type: "C" as DiscType, angle: 180 },
	];

	const toXY = (angle: number, r: number) => {
		const rad = (angle * Math.PI) / 180;
		return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
	};

	const maxVal = Math.max(scores.D, scores.I, scores.S, scores.C);
	const maxScale = Math.max(50, Math.ceil(maxVal / 10) * 10);

	// Grid rings (Perfect Circles)
	ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
	ctx.lineWidth = 1;
	for (let i = 1; i <= 4; i++) {
		const r = radius * (i / 4);
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, 2 * Math.PI);
		ctx.stroke();
	}

	// Axis lines
	for (const axis of axes) {
		const end = toXY(axis.angle, radius);
		ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	}

	// Data polygon
	const pts = axes.map(({ type, angle }) => {
		const val = scores[type];
		const r = radius * (Math.max(val, 5) / maxScale);
		return toXY(angle, r);
	});

	const startPt = pts[0];
	if (startPt) {
		ctx.beginPath();
		ctx.moveTo(startPt.x, startPt.y);
		for (const pt of pts.slice(1)) {
			ctx.lineTo(pt.x, pt.y);
		}
		ctx.closePath();
		ctx.fillStyle = "rgba(59, 130, 246, 0.15)";
		ctx.fill();
		ctx.strokeStyle = "#3b82f6";
		ctx.lineWidth = 2.5;
		ctx.stroke();
	}

	// Colored dots
	for (let i = 0; i < axes.length; i++) {
		const axis = axes[i];
		if (!axis) {
			continue;
		}
		const p = pts[i];
		if (!p) {
			continue;
		}
		ctx.beginPath();
		ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
		ctx.fillStyle = DISC_COLORS[axis.type].hex;
		ctx.fill();
		ctx.strokeStyle = "#ffffff";
		ctx.lineWidth = 1.5;
		ctx.stroke();
	}

	// Axis labels
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 26px sans-serif";
	for (const axis of axes) {
		const p = toXY(axis.angle, radius + 28);
		ctx.fillStyle = DISC_COLORS[axis.type].hex;
		ctx.fillText(axis.type, p.x, p.y);
	}
}

// biome-ignore lint/suspicious/noExplicitAny: WeChat mini-program OffscreenCanvas has no type definitions
function loadImage(canvas: any, src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = canvas.createImage();
		img.onload = () => resolve(img as unknown as HTMLImageElement);
		img.onerror = reject;
		img.src = src;
	});
}

// Wrap multi-line text within a given width
function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	x: number,
	y: number,
	maxWidth: number,
	lineHeight: number
) {
	const chars = text.split("");
	let line = "";
	let currentY = y;
	for (const char of chars) {
		const testLine = line + char;
		const { width } = ctx.measureText(testLine);
		if (width > maxWidth && line.length > 0) {
			ctx.fillText(line, x, currentY);
			line = char;
			currentY += lineHeight;
		} else {
			line = testLine;
		}
	}
	if (line) {
		ctx.fillText(line, x, currentY);
	}
}

export async function generateShareCard(
	input: ShareCardInput
): Promise<string> {
	const { dominantType, scores, qrcodeBase64, cardTheme } = input;
	const typeColor = cardTheme?.primaryColor ?? DISC_COLORS[dominantType].hex;
	const quote = getRandomQuote(dominantType);
	const typeLabel = DISC_COLORS[dominantType].label;

	// Create offscreen canvas
	// biome-ignore lint/correctness/noUndeclaredVariables: wx is global in WeChat Mini Programs
	// biome-ignore lint/suspicious/noExplicitAny: OffscreenCanvas is untyped
	const canvas: any = wx.createOffscreenCanvas({
		type: "2d",
		width: W,
		height: H,
	});
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

	// 1. Background gradient (Light Theme)
	const gradient = ctx.createLinearGradient(0, 0, 0, H);
	gradient.addColorStop(0, "#f3f5f9");
	gradient.addColorStop(1, "#e7ebf4");
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, W, H);

	// 2. White Card container in the center
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	if (ctx.roundRect) {
		ctx.roundRect(40, 40, 670, 1254, [24]);
	} else {
		ctx.rect(40, 40, 670, 1254);
	}
	ctx.fill();

	// Decorative type color accent bar at top of the card
	ctx.fillStyle = typeColor;
	ctx.fillRect(40, 40, 670, 8);

	// 3. Type letter (large, faint background)
	ctx.font = "bold 200px sans-serif";
	ctx.fillStyle = typeColor;
	ctx.globalAlpha = 0.08;
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(dominantType, 80, 80);
	ctx.globalAlpha = 1;

	// Solid Type letter
	ctx.font = "bold 120px sans-serif";
	ctx.fillStyle = typeColor;
	ctx.fillText(dominantType, 100, 100);

	// 4. Type label
	ctx.font = "bold 44px sans-serif";
	ctx.fillStyle = "#1e293b";
	ctx.fillText(typeLabel, 100, 240);

	// 5. Radar chart (centered, mid card)
	drawMiniRadar(ctx, scores, 375, 560, 200);

	// 6. Score bars (compact, below radar, no overlapping)
	const barStartY = 820;
	const barW = 400;
	const barH = 12;
	const barPad = 36;
	const types: DiscType[] = ["D", "I", "S", "C"];
	ctx.font = "bold 28px sans-serif";
	ctx.textBaseline = "middle";
	for (let i = 0; i < types.length; i++) {
		const t = types[i];
		if (!t) {
			continue;
		}
		const y = barStartY + i * (barH + barPad);
		const score = scores[t];
		// Track
		ctx.fillStyle = "rgba(226, 232, 240, 0.8)";
		ctx.beginPath();
		if (ctx.roundRect) {
			ctx.roundRect(170, y, barW, barH, [6]);
		} else {
			ctx.rect(170, y, barW, barH);
		}
		ctx.fill();
		// Fill
		ctx.fillStyle = DISC_COLORS[t].hex;
		const fillW = barW * (score / 100);
		ctx.beginPath();
		if (ctx.roundRect) {
			ctx.roundRect(170, y, fillW, barH, [6]);
		} else {
			ctx.rect(170, y, fillW, barH);
		}
		ctx.fill();
		// Label
		ctx.fillStyle = DISC_COLORS[t].hex;
		ctx.textAlign = "left";
		ctx.fillText(t, 100, y + barH / 2);
		// Value
		ctx.fillStyle = "#475569";
		ctx.textAlign = "right";
		ctx.fillText(`${score}%`, 640, y + barH / 2);
	}

	// 7. Quote
	ctx.font = "bold 32px sans-serif";
	ctx.fillStyle = "#1e293b";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	wrapText(ctx, `「${quote}」`, 100, 1010, 550, 48);

	// 8. Mini QR code (bottom right)
	if (qrcodeBase64) {
		try {
			const qrImg = await loadImage(canvas, qrcodeBase64);
			ctx.drawImage(qrImg as unknown as CanvasImageSource, 540, 1110, 130, 130);
			ctx.font = "20px sans-serif";
			ctx.fillStyle = "#64748b";
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.fillText("扫码测一测", 605, 1250);
		} catch (err) {
			console.error("Failed to load QR code in share card:", err);
		}
	}

	// 9. Brand watermark
	ctx.font = "bold 24px sans-serif";
	ctx.fillStyle = "rgba(100, 116, 139, 0.6)";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("DISC 职业性格测评", 100, 1220);

	// Export to temp file
	return new Promise((resolve, reject) => {
		// biome-ignore lint/correctness/noUndeclaredVariables: wx is global in WeChat Mini Programs
		wx.canvasToTempFilePath({
			canvas,
			fileType: "png",
			success: (res: { tempFilePath: string }) => resolve(res.tempFilePath),
			fail: reject,
		});
	});
}

export async function saveShareCardToAlbum(
	input: ShareCardInput
): Promise<void> {
	const filePath = await generateShareCard(input);
	await Taro.saveImageToPhotosAlbum({ filePath });
}
