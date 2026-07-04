import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { RadialChart } from "../components/RadialChart";
import type { RadialChartProps, RadialDatum } from "../types";

const activityData: RadialDatum[] = [
	{ value: 82, max: 100, color: "#fb2576", label: "Move", trackColor: "rgba(251,37,118,0.15)" },
	{ value: 45, max: 60, color: "#22d3ee", label: "Exercise", trackColor: "rgba(34,211,238,0.15)" },
	{ value: 9, max: 12, color: "#a3e635", label: "Stand", trackColor: "rgba(163,230,53,0.15)" },
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
