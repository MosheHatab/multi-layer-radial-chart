import { describe, expect, it } from "vitest";

import { describeArc, polarToCartesian } from "../src/core/geometry";

describe("polarToCartesian", () => {
	const cx = 100;
	const cy = 100;
	const radius = 50;

	it("maps 0deg to the positive x-axis", () => {
		const point = polarToCartesian(cx, cy, radius, 0);
		expect(point.x).toBeCloseTo(150);
		expect(point.y).toBeCloseTo(100);
	});

	it("maps 90deg to the positive y-axis (SVG y grows downward)", () => {
		const point = polarToCartesian(cx, cy, radius, 90);
		expect(point.x).toBeCloseTo(100);
		expect(point.y).toBeCloseTo(150);
	});

	it("maps -90deg to the top (12 o'clock)", () => {
		const point = polarToCartesian(cx, cy, radius, -90);
		expect(point.x).toBeCloseTo(100);
		expect(point.y).toBeCloseTo(50);
	});

	it("maps 180deg to the negative x-axis", () => {
		const point = polarToCartesian(cx, cy, radius, 180);
		expect(point.x).toBeCloseTo(50);
		expect(point.y).toBeCloseTo(100);
	});
});

describe("describeArc", () => {
	const cx = 100;
	const cy = 100;
	const radius = 50;
	const startAngle = -90;

	it("returns an empty string for a zero (or negative) fraction", () => {
		expect(describeArc(cx, cy, radius, 0, startAngle, true)).toBe("");
		expect(describeArc(cx, cy, radius, -0.5, startAngle, true)).toBe("");
	});

	it("returns an empty string for a non-positive radius", () => {
		expect(describeArc(cx, cy, 0, 0.5, startAngle, true)).toBe("");
	});

	it("emits a single arc command for a half circle", () => {
		const path = describeArc(cx, cy, radius, 0.5, startAngle, true);
		const arcCount = (path.match(/A /g) ?? []).length;
		expect(arcCount).toBe(1);
		expect(path.startsWith("M ")).toBe(true);
	});

	it("uses the large-arc flag past the halfway point", () => {
		const smallArc = describeArc(cx, cy, radius, 0.4, startAngle, true);
		const bigArc = describeArc(cx, cy, radius, 0.6, startAngle, true);
		// path format: M x y A rx ry rot largeArc sweep x y
		expect(smallArc.split(" ")[7]).toBe("0");
		expect(bigArc.split(" ")[7]).toBe("1");
	});

	it("emits two arc commands for a full circle", () => {
		const path = describeArc(cx, cy, radius, 1, startAngle, true);
		const arcCount = (path.match(/A /g) ?? []).length;
		expect(arcCount).toBe(2);
	});

	it("does not use the full-circle special case for a partial sweep gauge", () => {
		const path = describeArc(cx, cy, radius, 1, startAngle, true, 270);
		const arcCount = (path.match(/A /g) ?? []).length;
		expect(arcCount).toBe(1);
	});
});
