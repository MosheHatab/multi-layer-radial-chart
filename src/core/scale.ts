import { clamp } from "../utils/math";
import { PERCENT_SCALE } from "./constants";

/**
 * Normalize a `value`/`max` pair to a fraction in `[0, 1]`.
 * Guards against non-finite inputs and non-positive `max` (returns 0).
 */
export function toFraction(value: number, max: number): number {
	if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
		return 0;
	}
	return clamp(value / max, 0, 1);
}

/** Normalize a `value`/`max` pair to an integer percentage in `[0, 100]`. */
export function toPercent(value: number, max: number): number {
	return Math.round(toFraction(value, max) * PERCENT_SCALE);
}
