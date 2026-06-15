import Taro from "@tarojs/taro";
import { DISC_COLORS, type DiscType } from "../data/disc-colors";
import { getRandomQuote } from "../data/type-quotes";

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

	// Grid rings
	ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
	ctx.lineWidth = 1;
	for (const pct of [25, 50, 75, 100]) {
		const r = radius * (pct / 100);
		ctx.beginPath();
		const pts = axes.map((a) => toXY(a.angle, r));
		ctx.moveTo(pts[0].x, pts[0].y);
		pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
		ctx.closePath();
		ctx.stroke();
	}

	// Axis lines
	axes.forEach(({ angle }) => {
		const end = toXY(angle, radius);
		ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();
	});

	// Data polygon
	const pts = axes.map(({ type, angle }) => {
		const r = radius * (Math.max(scores[type], 5) / 100);
		return toXY(angle, r);
	});

	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
	ctx.closePath();
	ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
	ctx.fill();
	ctx.strokeStyle = "#3b82f6";
	ctx.lineWidth = 2;
	ctx.stroke();

	// Colored dots
	axes.forEach(({ type }, i) => {
		ctx.beginPath();
		ctx.arc(pts[i].x, pts[i].y, 5, 0, 2 * Math.PI);
		ctx.fillStyle = DISC_COLORS[type].hex;
		ctx.fill();
	});

	// Axis labels
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.font = "bold 24px sans-serif";
	axes.forEach(({ type, angle }) => {
		const p = toXY(angle, radius + 28);
		ctx.fillStyle = DISC_COLORS[type].hex;
		ctx.fillText(type, p.x, p.y);
	});
}

function loadImage(
	canvas: WechatMiniprogram.OffscreenCanvas,
	src: string
): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		// @ts-expect-error — WeChat canvas.createImage() API
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
	const bgFrom = cardTheme?.backgroundGradient[0] ?? "#0f172a";
	const bgTo = cardTheme?.backgroundGradient[1] ?? "#1e293b";

	// Create offscreen canvas
	// @ts-expect-error — wx global available in miniprogram
	const canvas: WechatMiniprogram.OffscreenCanvas = wx.createOffscreenCanvas({
		type: "2d",
		width: W,
		height: H,
	});
	// @ts-expect-error
	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

	// 1. Background gradient
	const gradient = ctx.createLinearGradient(0, 0, 0, H);
	gradient.addColorStop(0, bgFrom);
	gradient.addColorStop(1, bgTo);
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, W, H);

	// 2. Decorative type color accent bar at top
	ctx.fillStyle = typeColor;
	ctx.fillRect(0, 0, W, 8);

	// 3. Type letter (large)
	ctx.font = "bold 200px sans-serif";
	ctx.fillStyle = typeColor;
	ctx.globalAlpha = 0.15;
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText(dominantType, 40, 60);
	ctx.globalAlpha = 1;

	ctx.font = "bold 120px sans-serif";
	ctx.fillStyle = typeColor;
	ctx.fillText(dominantType, 60, 80);

	// 4. Type label
	ctx.font = "44px sans-serif";
	ctx.fillStyle = "#e2e8f0";
	ctx.fillText(typeLabel, 60, 230);

	// 5. Radar chart (centered, mid card)
	drawMiniRadar(ctx, scores, 375, 560, 200);

	// 6. Score bars (compact, below radar)
	const barStartY = 820;
	const barW = 420;
	const barH = 12;
	const barPad = 36;
	const types: DiscType[] = ["D", "I", "S", "C"];
	ctx.font = "28px sans-serif";
	ctx.textBaseline = "middle";
	types.forEach((t, i) => {
		const y = barStartY + i * (barH + barPad);
		const score = scores[t];
		// Track
		ctx.fillStyle = "rgba(71, 85, 105, 0.5)";
		ctx.beginPath();
		// @ts-expect-error — roundRect may not be in types but works in wx
		ctx.roundRect
			? ctx.roundRect(160, y, barW, barH, 6)
			: ctx.rect(160, y, barW, barH);
		ctx.fill();
		// Fill
		ctx.fillStyle = DISC_COLORS[t].hex;
		const fillW = barW * (score / 100);
		ctx.beginPath();
		ctx.roundRect
			? ctx.roundRect(160, y, fillW, barH, 6)
			: ctx.rect(160, y, fillW, barH);
		ctx.fill();
		// Label
		ctx.fillStyle = DISC_COLORS[t].hex;
		ctx.textAlign = "left";
		ctx.fillText(t, 100, y + barH / 2);
		// Value
		ctx.fillStyle = "#94a3b8";
		ctx.textAlign = "right";
		ctx.fillText(`${score}%`, 150, y + barH / 2);
	});

	// 7. Quote
	ctx.font = "bold 36px sans-serif";
	ctx.fillStyle = "#f8fafc";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	wrapText(ctx, `「${quote}」`, 60, 1010, 540, 52);

	// 8. Mini QR code (bottom right)
	if (qrcodeBase64) {
		try {
			const qrImg = await loadImage(canvas, qrcodeBase64);
			ctx.drawImage(qrImg as unknown as CanvasImageSource, 560, 1140, 140, 140);
			ctx.font = "20px sans-serif";
			ctx.fillStyle = "rgba(148, 163, 184, 0.7)";
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			ctx.fillText("扫码测一测", 630, 1286);
		} catch {
			// ignore qrcode load failure
		}
	}

	// 9. Brand watermark
	ctx.font = "24px sans-serif";
	ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
	ctx.textAlign = "left";
	ctx.textBaseline = "bottom";
	ctx.fillText("DISC 职业性格测评", 60, H - 40);

	// Export to temp file
	return new Promise((resolve, reject) => {
		// @ts-expect-error
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
