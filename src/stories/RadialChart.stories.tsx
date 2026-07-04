import type { Meta, StoryObj } from "@storybook/react-vite";

import { RadialChart } from "../components/RadialChart";
import type { RadialDatum } from "../types";

const activityData: RadialDatum[] = [
	{ value: 82, max: 100, color: "#fb2576", label: "Move", trackColor: "rgba(251,37,118,0.15)" },
	{ value: 45, max: 60, color: "#22d3ee", label: "Exercise", trackColor: "rgba(34,211,238,0.15)" },
	{ value: 9, max: 12, color: "#a3e635", label: "Stand", trackColor: "rgba(163,230,53,0.15)" },
];

const meta: Meta<typeof RadialChart> = {
	title: "Charts/RadialChart",
	component: RadialChart,
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
		data: [{ value: 68, max: 100, color: "#6366f1", label: "Progress" }],
	},
};

export const Semicircle: Story = {
	args: { maxSweepDegrees: 180, startAngle: 180 },
};

export const DashedPatterns: Story = {
	args: {
		data: [
			{ value: 70, max: 100, color: "#f59e0b", label: "Budget", pattern: "dashed" },
			{ value: 30, max: 100, color: "#10b981", label: "Savings", pattern: "solid" },
		],
	},
};

export const WithCenterContent: Story = {
	render: (args) => (
		<RadialChart {...args}>
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
				<span style={{ fontSize: 32, fontWeight: 700 }}>82%</span>
				<span style={{ fontSize: 12, opacity: 0.6 }}>Daily goal</span>
			</div>
		</RadialChart>
	),
	args: { showLegend: false },
};
