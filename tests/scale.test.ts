import { describe, expect, it } from "vitest";

import { toFraction, toPercent, toRawFraction } from "../src/core/scale";

describe("toFraction", () => {
	it("computes a normal fraction", () => {
		expect(toFraction(50, 100)).toBe(0.5);
		expect(toFraction(25, 200)).toBe(0.125);
	});

	it("clamps values above max to 1", () => {
		expect(toFraction(150, 100)).toBe(1);
	});

	it("clamps negative values to 0", () => {
		expect(toFraction(-10, 100)).toBe(0);
	});

	it("returns 0 when max is zero or negative", () => {
		expect(toFraction(10, 0)).toBe(0);
		expect(toFraction(10, -5)).toBe(0);
	});

	it("returns 0 for non-finite inputs", () => {
		expect(toFraction(Number.NaN, 100)).toBe(0);
		expect(toFraction(10, Number.POSITIVE_INFINITY)).toBe(0);
	});
});

describe("toPercent", () => {
	it("returns a rounded integer percentage", () => {
		expect(toPercent(1, 3)).toBe(33);
		expect(toPercent(2, 3)).toBe(67);
		expect(toPercent(100, 100)).toBe(100);
	});

	it("returns 0 for invalid input", () => {
		expect(toPercent(10, 0)).toBe(0);
	});
});

describe("toRawFraction", () => {
	it("does not clamp values above max", () => {
		expect(toRawFraction(150, 100)).toBe(1.5);
		expect(toRawFraction(250, 100)).toBe(2.5);
	});

	it("clamps negative values to 0 but keeps normal fractions", () => {
		expect(toRawFraction(-10, 100)).toBe(0);
		expect(toRawFraction(50, 100)).toBe(0.5);
	});

	it("returns 0 for invalid input", () => {
		expect(toRawFraction(10, 0)).toBe(0);
		expect(toRawFraction(Number.NaN, 100)).toBe(0);
	});
});
