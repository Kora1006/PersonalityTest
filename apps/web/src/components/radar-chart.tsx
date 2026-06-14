import type { DiscType } from "@/data/disc-colors";

interface RadarChartProps {
	scores: Record<DiscType, number>;
	size?: number;
}

const CENTER = 150;
const MAX_RADIUS = 110;
const LABEL_OFFSET = MAX_RADIUS + 22;

const AXES: { type: DiscType; angle: number; label: string }[] = [
	{ type: "D", angle: -90, label: "D" },
	{ type: "I", angle: 0, label: "I" },
	{ type: "S", angle: 90, label: "S" },
	{ type: "C", angle: 180, label: "C" },
];

function toXY(angle: number, radius: number) {
	const rad = (angle * Math.PI) / 180;
	return {
		x: CENTER + radius * Math.cos(rad),
		y: CENTER + radius * Math.sin(rad),
	};
}

function ringPoints(pct: number) {
	const r = MAX_RADIUS * (pct / 100);
	return AXES.map(({ angle }) => {
		const p = toXY(angle, r);
		return `${p.x},${p.y}`;
	}).join(" ");
}

export function RadarChart({ scores, size = 260 }: RadarChartProps) {
	const dataPoints = AXES.map(({ type, angle }) => {
		const r = MAX_RADIUS * (Math.max(scores[type], 5) / 100);
		return toXY(angle, r);
	});
	const polygonPoints = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

	return (
		<svg height={size} role="img" viewBox="0 0 300 300" width={size}>
			<title>DISC 雷达图</title>
			{/* Grid rings */}
			{[25, 50, 75, 100].map((pct) => (
				<polygon
					fill="none"
					key={pct}
					points={ringPoints(pct)}
					stroke="#e5e7eb"
					strokeWidth="1"
				/>
			))}

			{/* Axis lines */}
			{AXES.map(({ angle, label }) => {
				const end = toXY(angle, MAX_RADIUS);
				const lp = toXY(angle, LABEL_OFFSET);
				return (
					<g key={label}>
						<line
							stroke="#e5e7eb"
							strokeWidth="1"
							x1={CENTER}
							x2={end.x}
							y1={CENTER}
							y2={end.y}
						/>
						<text
							dominantBaseline="central"
							fill="#727785"
							fontFamily="JetBrains Mono, monospace"
							fontSize="11"
							fontWeight="600"
							textAnchor="middle"
							x={lp.x}
							y={lp.y}
						>
							{label}
						</text>
					</g>
				);
			})}

			{/* Score fill */}
			<polygon
				fill="rgba(59, 130, 246, 0.1)"
				points={polygonPoints}
				stroke="none"
			/>

			{/* Score stroke with draw animation */}
			<polygon
				className="disc-radar-path"
				fill="none"
				points={polygonPoints}
				stroke="#3b82f6"
				strokeLinejoin="round"
				strokeWidth="2"
			/>

			{/* Score dots */}
			{AXES.map(({ type }, i) => {
				const p = dataPoints[i];
				return <circle cx={p.x} cy={p.y} fill="#3b82f6" key={type} r="4" />;
			})}
		</svg>
	);
}
