import { DEGREES_IN_HALF_CIRCLE, EASE_CUBIC_EXPONENT, MAX_FRACTION_DIGITS } from "../core/constants";

/** Clamp `value` into the inclusive range `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}
	return value;
}

/** Linear interpolation from `start` to `end` by `ratio` (`0..1`). */
export function lerp(start: number, end: number, ratio: number): number {
	return start + (end - start) * ratio;
}

/** Convert degrees to radians. */
export function degToRad(degrees: number): number {
	return (degrees * Math.PI) / DEGREES_IN_HALF_CIRCLE;
}

/** Ease-out cubic easing curve for `ratio` in `0..1`. */
export function easeOutCubic(ratio: number): number {
	const inverted = 1 - clamp(ratio, 0, 1);
	return 1 - inverted ** EASE_CUBIC_EXPONENT;
}

/**
 * Round `value` to `decimals` decimal places, returning a clean finite number.
 * Uses `toFixed` rather than `Math.round(value * 10 ** decimals) / …` so the
 * result never carries a binary floating-point tail (e.g. `73.73000000000001`).
 */
export function roundTo(value: number, decimals: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}
	return Number(value.toFixed(clamp(decimals, 0, MAX_FRACTION_DIGITS)));
}
