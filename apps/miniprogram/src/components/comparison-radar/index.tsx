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
	maxScale: number,
	progress: number
) {
	const pts = AXES.map(({ type, angle }) => {
		const r = maxR * (Math.max(scores[type], 5) / maxScale) * progress;
		return toXY(cx, cy, angle, r);
	});

	const startPt = pts[0]!;

	ctx.beginPath();
	ctx.moveTo(startPt.x, startPt.y);
	for (let i = 1; i < pts.length; i++) {
		const p = pts[i]!;
		ctx.lineTo(p.x, p.y);
	}
	ctx.closePath();
	ctx.setFillStyle(fillColor);
	ctx.fill();

	ctx.beginPath();
	ctx.moveTo(startPt.x, startPt.y);
	for (let i = 1; i < pts.length; i++) {
		const p = pts[i]!;
		ctx.lineTo(p.x, p.y);
	}
	ctx.closePath();
	ctx.setStrokeStyle(strokeColor);
	ctx.setLineWidth(2);
	ctx.stroke();

	pts.forEach((p) => {
		const pt = p!;
		ctx.beginPath();
		ctx.arc(pt.x, pt.y, 4, 0, 2 * Math.PI);
		ctx.setFillStyle(strokeColor);
		ctx.fill();
	});
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

export function ComparisonRadar({
	myScores,
	friendScores,
	size = 300,
	canvasId = "comparison-radar",
}: ComparisonRadarProps) {
	const cx = size / 2;
	const cy = size / 2;
	const maxR = size * 0.35;

	useEffect(() => {
		const ctx = Taro.createCanvasContext(canvasId);
		const start = Date.now();
		const DURATION = 800;
		let animId: any = null;

		// Calculate max scale dynamically for comparison
		const myMax = Math.max(myScores.D, myScores.I, myScores.S, myScores.C);
		const friendMax = Math.max(
			friendScores.D,
			friendScores.I,
			friendScores.S,
			friendScores.C
		);
		const maxVal = Math.max(myMax, friendMax);
		const maxScale = Math.max(50, Math.ceil(maxVal / 10) * 10);

		function animate() {
			const elapsed = Date.now() - start;
			const t = Math.min(elapsed / DURATION, 1);
			const progress = 1 - (1 - t) ** 3;

			ctx.clearRect(0, 0, size, size);

			// Grid rings
			ctx.setStrokeStyle("rgba(71,85,105,0.25)");
			ctx.setLineWidth(1);
			for (const pct of [25, 50, 75, 100]) {
				const r = maxR * (pct / 100);
				ctx.beginPath();
				ctx.arc(cx, cy, r, 0, 2 * Math.PI);
				ctx.stroke();
			}

			// Axis lines + labels
			AXES.forEach(({ angle, label }) => {
				const end = toXY(cx, cy, angle, maxR);
				ctx.setStrokeStyle("rgba(71,85,105,0.25)");
				ctx.setLineWidth(1);
				ctx.beginPath();
				ctx.moveTo(cx, cy);
				ctx.lineTo(end.x, end.y);
				ctx.stroke();

				const lp = toXY(cx, cy, angle, maxR + 16);
				ctx.setFontSize(12);
				ctx.setFillStyle("#727785");
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
				maxScale,
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
				maxScale,
				progress
			);

			ctx.draw();

			if (t < 1) {
				animId = requestAnimFrame(animate);
			}
		}

		animId = requestAnimFrame(animate);

		return () => {
			if (animId) {
				cancelAnimFrame(animId);
			}
		};
	}, [myScores, friendScores, canvasId, size, cx, cy, maxR]);

	return (
		<View
			style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
		>
			<Canvas
				canvasId={canvasId}
				id={canvasId}
				style={{ width: `${size}px`, height: `${size}px` }}
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
