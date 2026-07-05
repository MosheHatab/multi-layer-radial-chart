import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { RadialChart } from "../components/RadialChart";
import { useCountUp } from "../hooks/useCountUp";
import { useRadialChart } from "../hooks/useRadialChart";
import type { NormalizedDatum, RadialChartProps, RadialDatum } from "../types";

const HEADLESS_SIZE = 260;
const HEADLESS_GAP = 8;

const activityData: RadialDatum[] = [
	{ value: 82, max: 100, color: "#fb2576", label: "Move", trackColor: "rgba(251,37,118,0.15)" },
	{ value: 45, max: 60, color: "#22d3ee", label: "Exercise", trackColor: "rgba(34,211,238,0.15)" },
	{ value: 9, max: 12, color: "#a3e635", label: "Stand", trackColor: "rgba(163,230,53,0.15)" },
];

const activityDataSet2: RadialDatum[] = [
	{ value: 96, max: 180, color: "#f472b6", label: "TSLA", trackColor: "rgba(244,114,182,0.15)" },
	{ value: 187, max: 250, color: "#34d399", label: "AAPL", trackColor: "rgba(52,211,153,0.15)" },
	{ value: 412, max: 500, color: "#818cf8", label: "MSFT", trackColor: "rgba(129,140,248,0.15)" },
	{ value: 138, max: 200, color: "#fbbf24", label: "NVDA", trackColor: "rgba(251,191,36,0.15)" },
	
];

const meta: Meta<typeof RadialChart> = {
	title: "Charts/RadialChart",
	component: RadialChart,
	tags: ["autodocs"],
	parameters: { layout: "centered" },
	args: {
		data: activityData,
		size: 280,
		animate: true,
		animationDurationMs: 900,
		rounded: true,
		clockwise: true,
		gap: 6,
		maxSweepDegrees: 360,
		showLegend: true,
		showTooltip: true,
	},
	argTypes: {
		maxSweepDegrees: { control: { type: "range", min: 90, max: 360, step: 10 } },
		animationDurationMs: { control: { type: "range", min: 0, max: 2000, step: 100 } },
		gap: { control: { type: "range", min: 0, max: 24, step: 1 } },
		size: { control: { type: "range", min: 120, max: 480, step: 10 } },
	},
};

export default meta;

type Story = StoryObj<typeof RadialChart>;

export const ActivityRings: Story = {};

export const Gauge: Story = {
	args: {
		maxSweepDegrees: 270,
		startAngle: 135,
		data: [
			{ value: 68, max: 100, color: "#6366f1", label: "Progress" },
			{ value: 23, max: 100, color: "#ffff00", label: "Handled" }
		],
	},
};

export const Semicircle: Story = {
	args: { maxSweepDegrees: 180, startAngle: 180 },
};

export const DashedPatterns: Story = {
	args: {
		rounded: false,
		data: [
			{ value: 70, max: 100, color: "#f59e0b", label: "Budget", pattern: "dashed" },
			{ value: 30, max: 100, color: "#10b981", label: "Savings", pattern: "solid" },
		],
	},
};

export const WithCenterContent: Story = {
	render: (args) => (
		<RadialChart {...args}>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					fontFamily: "var(--font-mono)",
				}}
			>
				<span style={{ fontSize: 32, fontWeight: 600 }}>82%</span>
				<span
					style={{
						fontSize: 11,
						letterSpacing: "0.18em",
						textTransform: "uppercase",
						opacity: 0.6,
					}}
				>
					Daily goal
				</span>
			</div>
		</RadialChart>
	),
	args: { showLegend: false },
};

/** Per-ring linear/radial gradient fills for the progress arcs. */
export const Gradients: Story = {
	args: {
		showLegend: false,
		showTooltip: false,
		data: [
			{
				value: 82,
				max: 100,
				color: "#fb2576",
				label: "Move",
				gradient: {
					type: "linear",
					angle: 45,
					stops: [
						{ offset: 0, color: "#f472b6" },
						{ offset: 1, color: "#8b5cf6" },
					],
				},
			},
			{
				value: 55,
				max: 60,
				color: "#22d3ee",
				label: "Exercise",
				gradient: {
					type: "linear",
					angle: 120,
					stops: [
						{ offset: 0, color: "#22d3ee" },
						{ offset: 1, color: "#3b82f6" },
					],
				},
			},
			{
				value: 9,
				max: 12,
				color: "#a3e635",
				label: "Stand",
				gradient: {
					type: "radial",
					stops: [
						{ offset: 0, color: "#bef264" },
						{ offset: 1, color: "#16a34a" },
					],
				},
			},
		],
	},
};

function CountUpCenter({ target }: { target: number }): React.JSX.Element {
	const value = useCountUp(target, { durationMs: 1200 });
	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
			<span style={{ fontSize: 34, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
				{value}%
			</span>
			<span style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.6 }}>
				Complete
			</span>
		</div>
	);
}

function averagePercent(data: readonly RadialDatum[]): number {
	if (data.length === 0) {
		return 0;
	}
	const sum = data.reduce((acc, datum) => acc + datum.value / datum.max, 0);
	return Math.round((sum / data.length) * 100);
}

/**
 * Animated count-up number rendered in the centre via the `useCountUp` hook.
 * The centre shows the *average* completion across all rings, so the `%` stays
 * accurate regardless of how many series are provided.
 */
export const CenterCountUp: Story = {
	args: { showLegend: false },
	render: (args) => (
		<RadialChart {...args} data={activityDataSet2}>
			<CountUpCenter target={averagePercent(activityDataSet2)} />
		</RadialChart>
	),
};

/** Values above `max` overrun the ring as an overlapping extra lap. */
export const Overflow: Story = {
	args: {
		allowOverflow: true,
		showLegend: true,
		showTooltip: false,
		data: [
			{ value: 135, max: 100, color: "#FFD700", label: "Move" },
			{ value: 18, max: 77, color: "#005493", label: "Sleep", trackColor: "#005493CC" },
			{ value: 100, max: 60, color: "#FFC0CB", label: "Exercise" },
			{ value: 9, max: 50, color: "#b155ef", label: "Stand" },
		],
	},
};

/**
 * Goal markers (`threshold`) are ideal for target-vs-actual dashboards: the
 * tick marks the goal, the arc shows where you actually are. This quarterly
 * KPI view makes each outcome obvious at a glance — Sign-ups blew past target,
 * while Sales and Retention are still short of theirs.
 */
export const ThresholdMarkers: Story = {
	args: {
		showLegend: true,
		showTooltip: true,
		data: [
			{ value: 74, max: 100, color: "#6366f1", label: "Sales ($k)", threshold: 90 },
			{ value: 128, max: 150, color: "#22c55e", label: "Sign-ups", threshold: 100 },
			{ value: 52, max: 100, color: "#f59e0b", label: "Retention %", threshold: 70 },
		],
	},
};

interface PerDatumArgs {
	moveValue: number;
	exerciseValue: number;
	standValue: number;
	animate: boolean;
	showLegend: boolean;
	showTooltip: boolean;
}

/** Exposes an individual control per ring so each value can be tuned live. */
export const PlaygroundControls: StoryObj<PerDatumArgs> = {
	args: {
		moveValue: 82,
		exerciseValue: 45,
		standValue: 9,
		animate: true,
		showLegend: true,
		showTooltip: true,
	},
	argTypes: {
		moveValue: { control: { type: "range", min: 0, max: 100, step: 1 } },
		exerciseValue: { control: { type: "range", min: 0, max: 60, step: 1 } },
		standValue: { control: { type: "range", min: 0, max: 12, step: 1 } },
	},
	render: (args) => (
		<RadialChart
			size={280}
			animate={args.animate}
			showLegend={args.showLegend}
			showTooltip={args.showTooltip}
			data={[
				{ label: "Move", value: args.moveValue, max: 100, color: "#fb2576" },
				{ label: "Exercise", value: args.exerciseValue, max: 60, color: "#22d3ee" },
				{ label: "Stand", value: args.standValue, max: 12, color: "#a3e635" },
			]}
		/>
	),
};

function InteractiveChart(props: RadialChartProps): React.JSX.Element {
	const [selected, setSelected] = useState<NormalizedDatum | null>(null);
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
			<RadialChart {...props} onSegmentClick={(datum) => setSelected(datum)} />
			<p
				style={{
					fontFamily: "var(--font-mono)",
					fontSize: 13,
					minHeight: 20,
					textAlign: "center",
				}}
			>
				{selected
					? `Selected: ${selected.label} — ${selected.percent}%`
					: "Click a ring, or Tab to focus and press Enter"}
			</p>
		</div>
	);
}

/**
 * Rings become clickable and keyboard-focusable when `onSegmentClick` is set.
 * Tab to a ring and press Enter/Space, or click it, to select it. `onSegmentHover`
 * fires on pointer enter/move (and the tooltip shares the same hover events).
 */
export const Interactivity: Story = {
	args: { showTooltip: true, showLegend: false },
	render: (args) => <InteractiveChart {...args} />,
};

/**
 * Headless usage via `useRadialChart`: the hook returns validated geometry
 * (radii, stroke widths and ready-to-use SVG `d` strings) and renders nothing
 * itself, so you can draw the rings with your own SVG markup.
 */
function HeadlessChart(): React.JSX.Element {
	const { center, rings } = useRadialChart(activityData, {
		size: HEADLESS_SIZE,
		gap: HEADLESS_GAP,
	});
	return (
		<svg
			width={HEADLESS_SIZE}
			height={HEADLESS_SIZE}
			viewBox={`0 0 ${HEADLESS_SIZE} ${HEADLESS_SIZE}`}
			role="img"
			aria-label="Headless radial chart built with useRadialChart"
		>
			{rings.map((ring) => (
				<g key={ring.datum.label}>
					<path
						d={ring.trackPath}
						fill="none"
						stroke="rgba(148, 163, 184, 0.25)"
						strokeWidth={ring.strokeWidth}
						strokeLinecap="round"
					/>
					<path
						d={ring.progressPath}
						fill="none"
						stroke={ring.datum.color}
						strokeWidth={ring.strokeWidth}
						strokeLinecap="round"
					/>
				</g>
			))}
			<text
				x={center}
				y={center}
				textAnchor="middle"
				dominantBaseline="central"
				fontSize={30}
				fontWeight={700}
				fill="currentColor"
			>
				{averagePercent(activityData)}%
			</text>
		</svg>
	);
}

export const Headless: Story = {
	render: () => <HeadlessChart />,
};

function AnimatedDemo(props: RadialChartProps): React.JSX.Element {
	const [data, setData] = useState<RadialDatum[]>(activityData);
	const randomize = (): void => {
		setData((current) =>
			current.map((datum) => ({ ...datum, value: Math.round(Math.random() * datum.max) })),
		);
	};
	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
			<RadialChart {...props} data={data} />
			<button
				type="button"
				onClick={randomize}
				style={{
					cursor: "pointer",
					border: "none",
					background: "var(--color-brand)",
					color: "#ffffff",
					fontFamily: "var(--font-mono)",
					fontSize: 11,
					fontWeight: 600,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					padding: "8px 16px",
				}}
			>
				Randomize values
			</button>
		</div>
	);
}

/** Click the button to push new values and watch the rAF tween animate. */
export const AnimatedOnClick: Story = {
	render: (args) => <AnimatedDemo {...args} />,
};
