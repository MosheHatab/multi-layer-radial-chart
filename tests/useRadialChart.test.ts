import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useRadialChart } from "../src/hooks/useRadialChart";
import type { RadialDatum } from "../src/types";

const sampleData: RadialDatum[] = [
	{ value: 75, max: 100, color: "#ef4444", label: "Move" },
	{ value: 40, max: 60, color: "#22c55e", label: "Exercise" },
];

describe("useRadialChart", () => {
	it("returns one geometry entry per datum with paths", () => {
		const { result } = renderHook(() => useRadialChart(sampleData, { size: 240 }));
		expect(result.current.rings).toHaveLength(sampleData.length);
		expect(result.current.center).toBe(120);
		for (const ring of result.current.rings) {
			expect(ring.radius).toBeGreaterThan(0);
			expect(ring.strokeWidth).toBeGreaterThan(0);
			expect(ring.trackPath.startsWith("M ")).toBe(true);
			expect(ring.progressPath.startsWith("M ")).toBe(true);
		}
	});

	it("outer ring has a larger radius than inner rings", () => {
		const { result } = renderHook(() => useRadialChart(sampleData, { size: 240 }));
		const [outer, inner] = result.current.rings;
		expect(outer.radius).toBeGreaterThan(inner.radius);
	});

	it("produces an empty progress path for a zero-value datum", () => {
		const data: RadialDatum[] = [{ value: 0, max: 100, color: "#000", label: "None" }];
		const { result } = renderHook(() => useRadialChart(data, { size: 200 }));
		expect(result.current.rings[0].progressPath).toBe("");
		expect(result.current.rings[0].trackPath).not.toBe("");
	});

	it("returns no rings for empty data", () => {
		const { result } = renderHook(() => useRadialChart([], { size: 200 }));
		expect(result.current.rings).toHaveLength(0);
	});
});
