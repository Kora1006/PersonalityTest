import { Canvas, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useRef } from "react";

interface RadarCanvasProps {
	canvasId?: string;
	color?: string;
	scores: { D: number; I: number; S: number; C: number };
	size?: number;
}

const DISC_COLORS = {
	D: "#ef4444",
	I: "#f59e0b",
	S: "#10b981",
	C: "#3b82f6",
};

const AXES: { type: keyof typeof DISC_COLORS; angle: number; label: string }[] =
	[
		{ type: "D", angle: -90, label: "D" },
		{ type: "I", angle: 0, label: "I" },
		{ type: "S", angle: 90, label: "S" },
		{ type: "C", angle: 180, label: "C" },
	];

function hexToRgba(hex: string, alpha: number): string {
	const cleanHex = hex.replace("#", "");
	let r = 0;
	let g = 0;
	let b = 0;

	if (cleanHex.length === 3) {
		r = Number.parseInt(cleanHex.charAt(0) + cleanHex.charAt(0), 16);
		g = Number.parseInt(cleanHex.charAt(1) + cleanHex.charAt(1), 16);
		b = Number.parseInt(cleanHex.charAt(2) + cleanHex.charAt(2), 16);
	} else if (cleanHex.length === 6) {
		r = Number.parseInt(cleanHex.slice(0, 2), 16);
		g = Number.parseInt(cleanHex.slice(2, 4), 16);
		b = Number.parseInt(cleanHex.slice(4, 6), 16);
	} else {
		return hex;
	}

	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toXY(center: number, angle: number, radius: number) {
	const rad = (angle * Math.PI) / 180;
	return {
		x: center + radius * Math.cos(rad),
		y: center + radius * Math.sin(rad),
	};
}

function drawRadar(
	ctx: Taro.CanvasContext,
	scores: { D: number; I: number; S: number; C: number },
	size: number,
	progress = 1,
	color?: string
) {
	const center = size / 2;
	const maxRadius = size * 0.35;
	const labelOffset = maxRadius + 18;

	// Clear canvas
	ctx.clearRect(0, 0, size, size);

	// Dynamically calculate max scale for higher contrast/differentiation
	const maxVal = Math.max(scores.D, scores.I, scores.S, scores.C);
	const maxScale = Math.max(50, Math.ceil(maxVal / 10) * 10);

	// Draw grid rings
	const ringPcts = [25, 50, 75, 100];
	ctx.setStrokeStyle("rgba(71,85,105,0.25)");
	ctx.setLineWidth(1);

	for (const pct of ringPcts) {
		const r = maxRadius * (pct / 100);
		ctx.beginPath();
		ctx.arc(center, center, r, 0, 2 * Math.PI);
		ctx.stroke();
	}

	// Draw axis lines
	for (const { angle, label } of AXES) {
		const end = toXY(center, angle, maxRadius);
		ctx.setStrokeStyle("rgba(71,85,105,0.25)");
		ctx.setLineWidth(1);
		ctx.beginPath();
		ctx.moveTo(center, center);
		ctx.lineTo(end.x, end.y);
		ctx.stroke();

		// Labels
		const lp = toXY(center, angle, labelOffset);
		ctx.setFontSize(12);
		ctx.setFillStyle("#727785");
		ctx.setTextAlign("center");
		ctx.setTextBaseline("middle");
		ctx.fillText(label, lp.x, lp.y);
	}

	// Draw score polygon (animated by progress 0→1)
	const dataPoints = AXES.map(({ type, angle }) => {
		const rawScore = Math.max(scores[type], 5);
		const r = maxRadius * (rawScore / maxScale) * progress;
		return toXY(center, angle, r);
	});

	const startData = dataPoints[0]!;

	// Fill
	ctx.beginPath();
	ctx.moveTo(startData.x, startData.y);
	for (let i = 1; i < dataPoints.length; i++) {
		const p = dataPoints[i]!;
		ctx.lineTo(p.x, p.y);
	}
	ctx.closePath();

	let fillStyle = "rgba(59,130,246,0.15)";
	if (color) {
		fillStyle = hexToRgba(color, 0.15);
	}
	ctx.setFillStyle(fillStyle);
	ctx.fill();

	// Stroke
	ctx.beginPath();
	ctx.moveTo(startData.x, startData.y);
	for (let i = 1; i < dataPoints.length; i++) {
		const p = dataPoints[i]!;
		ctx.lineTo(p.x, p.y);
	}
	ctx.closePath();
	ctx.setStrokeStyle(color || "#3b82f6");
	ctx.setLineWidth(2);
	ctx.stroke();

	// Score dots with DISC colors
	AXES.forEach(({ type }, i) => {
		const p = dataPoints[i]!;
		ctx.beginPath();
		ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
		ctx.setFillStyle(DISC_COLORS[type]);
		ctx.fill();
	});

	ctx.draw();
}

const requestAnimFrame = (cb: () => void): any => {
	if (typeof requestAnimationFrame === "function") {
		return requestAnimationFrame(cb);
	}
	return setTimeout(cb, 16);
};

const cancelAnimFrame = (id: any) => {
	if (!id) {
		return;
	}
	if (typeof cancelAnimationFrame === "function") {
		cancelAnimationFrame(id);
	} else {
		clearTimeout(id);
	}
};

export function RadarCanvas({
	scores,
	size = 260,
	canvasId = "radar-canvas",
	color,
}: RadarCanvasProps) {
	const animFrameRef = useRef<any>(null);
	const startTimeRef = useRef<number>(0);
	const DURATION = 800;

	useEffect(() => {
		const ctx = Taro.createCanvasContext(canvasId);
		startTimeRef.current = Date.now();

		function animate() {
			const elapsed = Date.now() - startTimeRef.current;
			const progress = Math.min(elapsed / DURATION, 1);
			const eased = 1 - (1 - progress) ** 3;
			drawRadar(ctx, scores, size, eased, color);

			if (progress < 1) {
				animFrameRef.current = requestAnimFrame(animate);
			}
		}

		animFrameRef.current = requestAnimFrame(animate);

		return () => {
			if (animFrameRef.current !== null) {
				cancelAnimFrame(animFrameRef.current);
			}
		};
	}, [scores, canvasId, size, color]);

	return (
		<View
			style={{ width: `${size}px`, height: `${size}px`, position: "relative" }}
		>
			<Canvas
				canvasId={canvasId}
				id={canvasId}
				style={{ width: `${size}px`, height: `${size}px` }}
			/>
		</View>
	);
}
