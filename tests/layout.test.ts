import { describe, expect, it } from "vitest";

import { computeRingLayout } from "../src/core/layout";
import { MIN_RADIUS } from "../src/core/constants";

describe("computeRingLayout", () => {
	it("returns an empty array for non-positive count or size", () => {
		expect(computeRingLayout(0, 200, 6)).toEqual([]);
		expect(computeRingLayout(3, 0, 6)).toEqual([]);
	});

	it("produces one entry per ring", () => {
		const rings = computeRingLayout(3, 200, 6);
		expect(rings).toHaveLength(3);
	});

	it("orders radii from outer (largest) to inner (smallest)", () => {
		const rings = computeRingLayout(4, 320, 8);
		for (let index = 1; index < rings.length; index += 1) {
			expect(rings[index].radius).toBeLessThan(rings[index - 1].radius);
		}
	});

	it("never emits a radius below the minimum", () => {
		const rings = computeRingLayout(10, 120, 6);
		for (const ring of rings) {
			expect(ring.radius).toBeGreaterThanOrEqual(MIN_RADIUS);
		}
	});

	it("keeps the outermost ring inside the viewBox", () => {
		const size = 200;
		const rings = computeRingLayout(3, size, 6);
		const outer = rings[0];
		expect(outer.radius + outer.strokeWidth / 2).toBeLessThanOrEqual(size / 2 + 0.001);
	});

	it("honors an explicit ring width", () => {
		const rings = computeRingLayout(3, 300, 6, 10);
		for (const ring of rings) {
			expect(ring.strokeWidth).toBe(10);
		}
	});
});
