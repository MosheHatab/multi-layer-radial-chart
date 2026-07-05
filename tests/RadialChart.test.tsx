import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RadialChart } from "../src/components/RadialChart";
import type { RadialDatum } from "../src/types";

const sampleData: RadialDatum[] = [
	{ value: 75, max: 100, color: "#ef4444", label: "Move" },
	{ value: 40, max: 60, color: "#22c55e", label: "Exercise" },
	{ value: 8, max: 12, color: "#3b82f6", label: "Stand" },
];

describe("RadialChart", () => {
	it("renders one progressbar per datum", () => {
		render(<RadialChart data={sampleData} size={240} animate={false} />);
		const bars = screen.getAllByRole("progressbar");
		expect(bars).toHaveLength(sampleData.length);
	});

	it("exposes accessible values on each ring", () => {
		render(<RadialChart data={sampleData} size={240} animate={false} />);
		const move = screen.getByLabelText(/Move: 75\/100 \(75%\)/);
		expect(move).toHaveAttribute("aria-valuenow", "75");
		expect(move).toHaveAttribute("aria-valuemin", "0");
		expect(move).toHaveAttribute("aria-valuemax", "100");
	});

	it("labels the chart as an image", () => {
		render(<RadialChart data={sampleData} size={240} animate={false} />);
		expect(screen.getByRole("img")).toHaveAccessibleName(/Radial progress chart/);
	});

	it("renders a legend when showLegend is set", () => {
		render(<RadialChart data={sampleData} size={240} animate={false} showLegend />);
		expect(screen.getByText("Exercise")).toBeInTheDocument();
		expect(screen.getByText("40/60 (67%)")).toBeInTheDocument();
	});

	it("handles empty data gracefully", () => {
		render(<RadialChart data={[]} size={240} animate={false} />);
		expect(screen.queryAllByRole("progressbar")).toHaveLength(0);
		expect(screen.getByRole("img")).toHaveAccessibleName("Radial chart with no data");
	});

	it("clamps values above max to 100%", () => {
		render(
			<RadialChart
				data={[{ value: 150, max: 100, color: "#000", label: "Over" }]}
				size={240}
				animate={false}
			/>,
		);
		const bar = screen.getByRole("progressbar");
		expect(bar).toHaveAttribute("aria-valuenow", "100");
	});

	it("renders a gradient def and references it when a datum has a gradient", () => {
		const { container } = render(
			<RadialChart
				data={[
					{
						value: 50,
						max: 100,
						color: "#000",
						label: "Grad",
						gradient: {
							type: "linear",
							angle: 90,
							stops: [
								{ offset: 0, color: "#f472b6" },
								{ offset: 1, color: "#8b5cf6" },
							],
						},
					},
				]}
				size={240}
				animate={false}
			/>,
		);
		const gradient = container.querySelector("linearGradient");
		expect(gradient).not.toBeNull();
		const progress = container.querySelector(".rc-ring-progress");
		expect(progress?.getAttribute("stroke")).toMatch(/^url\(#/);
	});

	it("renders centered children content", () => {
		render(
			<RadialChart data={sampleData} size={240} animate={false}>
				<strong>72%</strong>
			</RadialChart>,
		);
		expect(screen.getByText("72%")).toBeInTheDocument();
	});

	it("renders an overflow lap when allowOverflow and value exceeds max", () => {
		const { container } = render(
			<RadialChart
				data={[{ value: 150, max: 100, color: "#000", label: "Over" }]}
				size={240}
				animate={false}
				allowOverflow
			/>,
		);
		expect(container.querySelector(".rc-ring-overflow")).not.toBeNull();
	});

	it("does not render an overflow lap by default", () => {
		const { container } = render(
			<RadialChart
				data={[{ value: 150, max: 100, color: "#000", label: "Over" }]}
				size={240}
				animate={false}
			/>,
		);
		expect(container.querySelector(".rc-ring-overflow")).toBeNull();
	});

	it("renders a threshold marker when a datum has a threshold", () => {
		const { container } = render(
			<RadialChart
				data={[{ value: 40, max: 100, color: "#000", label: "Goal", threshold: 80 }]}
				size={240}
				animate={false}
			/>,
		);
		expect(container.querySelector(".rc-ring-marker")).not.toBeNull();
	});
});
