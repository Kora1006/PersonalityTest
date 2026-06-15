import { Canvas, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect } from "react";

interface ComparisonRadarProps {
	canvasId?: string;
	friendScores: { D: number; I: number; S: number; C: number };
	myScores: { D: number; I: number; S: number; C: number };
	size?: number;
}

const MY_COLOR = { fill: "rgba(59,130,246,0.35)", stroke: "#3b82f6" };
const FRIEND_COLOR = { fill: "rgba(249,115,22,0.35)", stroke: "#f97316" };

const AXES = [
	{ type: "D" as const, angle: -90, label: "D" },
	{ type: "I" as const, angle: 0, label: "I" },
	{ type: "S" as const, angle: 90, label: "S" },
	{ type: "C" as const, angle: 180, label: "C" },
];

function toXY(cx: number, cy: number, angle: number, radius: number) {
	const rad = (angle * Math.PI) / 180;
	return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

function drawOneRadar(
	ctx: Taro.CanvasContext,
	cx: number,
	cy: number,
	maxR: number,
	scores: { D: number; I: number; S: number; C: number },
	fillColor: string,
	strokeColor: string,
	progress: number
) {
	const pts = AXES.map(({ type, angle }) => {
		const r = maxR * (Math.max(scores[type], 5) / 100) * progress;
		return toXY(cx, cy, angle, r);
	});

	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (let i = 1; i < pts.length; i++) {
		ctx.lineTo(pts[i].x, pts[i].y);
	}
	ctx.closePath();
	ctx.setFillStyle(fillColor);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(pts[0].x, pts[0].y);
	for (let i = 1; i < pts.length; i++) {
		ctx.lineTo(pts[i].x, pts[i].y);
	}
	ctx.closePath();
	ctx.setStrokeStyle(strokeColor);
	ctx.setLineWidth(2);
	ctx.stroke();

	pts.forEach((p) => {
		ctx.beginPath();
		ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
		ctx.setFillStyle(strokeColor);
		ctx.fill();
	});
}

export function ComparisonRadar({
	myScores,
	friendScores,
	size = 300,
	canvasId = "comparison-radar",
}: ComparisonRadarProps) {
	const cx = size / 2;
	const cy = size / 2;
	const maxR = size * 0.37;

	useEffect(() => {
		const ctx = Taro.createCanvasContext(canvasId);
		const start = Date.now();
		const DURATION = 800;

		function animate() {
			const elapsed = Date.now() - start;
			const t = Math.min(elapsed / DURATION, 1);
			const progress = 1 - (1 - t) ** 3;

			ctx.clearRect(0, 0, size, size);

			// Grid rings
			ctx.setStrokeStyle("rgba(71,85,105,0.4)");
			ctx.setLineWidth(1);
			for (const pct of [25, 50, 75, 100]) {
				const r = maxR * (pct / 100);
				ctx.beginPath();
				const ringPts = AXES.map(({ angle }) => toXY(cx, cy, angle, r));
				ctx.moveTo(ringPts[0].x, ringPts[0].y);
				ringPts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
				ctx.closePath();
				ctx.stroke();
			}

			// Axis lines + labels
			AXES.forEach(({ angle, label }) => {
				const end = toXY(cx, cy, angle, maxR);
				ctx.setStrokeStyle("rgba(71,85,105,0.4)");
				ctx.setLineWidth(1);
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(end.x, end.y);
				ctx.stroke();

				const lp = toXY(cx, cy, angle, maxR + 20);
				ctx.setFontSize(14);
				ctx.setFillStyle("#94a3b8");
				ctx.setTextAlign("center");
				ctx.setTextBaseline("middle");
				ctx.fillText(label, lp.x, lp.y);
			});

			// Friend radar first (under my radar)
			drawOneRadar(
				ctx,
				cx,
				cy,
				maxR,
				friendScores,
				FRIEND_COLOR.fill,
				FRIEND_COLOR.stroke,
				progress
			);
			// My radar on top
			drawOneRadar(
				ctx,
				cx,
				cy,
				maxR,
				myScores,
				MY_COLOR.fill,
				MY_COLOR.stroke,
				progress
			);

			ctx.draw();

			if (t < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);
	}, [myScores, friendScores, canvasId, size, cx, cy, maxR]);

	return (
		<View
			style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
		>
			<Canvas
				canvasId={canvasId}
				id={canvasId}
				style={{ width: `${size}px`, height: `${size}px` }}
				type="2d"
			/>
			<View
				style={{
					display: "flex",
					flexDirection: "row",
					gap: "32px",
					marginTop: "16px",
				}}
			>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<View
						style={{
							width: "24px",
							height: "8px",
							borderRadius: "4px",
							backgroundColor: MY_COLOR.stroke,
						}}
					/>
					<Text style={{ fontSize: "24px", color: "#94a3b8" }}>我</Text>
				</View>
				<View
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						gap: "8px",
					}}
				>
					<View
						style={{
							width: "24px",
							height: "8px",
							borderRadius: "4px",
							backgroundColor: FRIEND_COLOR.stroke,
						}}
					/>
					<Text style={{ fontSize: "24px", color: "#94a3b8" }}>好友</Text>
				</View>
			</View>
		</View>
	);
}
