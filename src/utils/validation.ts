import { toFraction, toPercent } from "../core/scale";
import type { NormalizedDatum, RadialDatum, RingPattern } from "../types";

const FALLBACK_COLOR = "#3b82f6";
const FALLBACK_LABEL = "Series";

function isDev(): boolean {
	try {
		return typeof process !== "undefined" && process.env?.NODE_ENV !== "production";
	} catch {
		return false;
	}
}

function warn(message: string): void {
	if (isDev()) {
		console.warn(`[multi-layer-radial-chart] ${message}`);
	}
}

function normalizePattern(pattern: RingPattern | undefined): RingPattern {
	return pattern === "dashed" ? "dashed" : "solid";
}

/** Validate and normalize a single datum, emitting dev-only warnings. */
export function normalizeDatum(datum: RadialDatum, index: number): NormalizedDatum {
	const label =
		typeof datum.label === "string" && datum.label.length > 0
			? datum.label
			: `${FALLBACK_LABEL} ${index + 1}`;

	if (label !== datum.label) {
		warn(`data[${index}].label is missing or empty; using "${label}".`);
	}

	const color =
		typeof datum.color === "string" && datum.color.length > 0 ? datum.color : FALLBACK_COLOR;
	if (color !== datum.color) {
		warn(`data[${index}].color is missing; using "${FALLBACK_COLOR}".`);
	}

	const value = Number.isFinite(datum.value) ? datum.value : 0;
	if (value !== datum.value) {
		warn(`data[${index}].value is not a finite number; treating it as 0.`);
	}

	const max = Number.isFinite(datum.max) ? datum.max : 0;
	if (max <= 0) {
		warn(`data[${index}].max must be greater than 0; the ring will render empty.`);
	}
	if (value > max && max > 0) {
		warn(`data[${index}].value (${value}) exceeds max (${max}); clamping to 100%.`);
	}

	return {
		value,
		max,
		color,
		label,
		trackColor: datum.trackColor,
		pattern: normalizePattern(datum.pattern),
		fraction: toFraction(value, max),
		percent: toPercent(value, max),
	};
}

/**
 * Validate the full data array. Non-array inputs yield an empty result
 * (with a dev warning) so the component degrades gracefully.
 */
export function validateData(data: readonly RadialDatum[]): NormalizedDatum[] {
	if (!Array.isArray(data)) {
		warn("`data` must be an array of RadialDatum; received a non-array value.");
		return [];
	}
	return data.map(normalizeDatum);
}
