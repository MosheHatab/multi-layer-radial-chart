import type { RingLayout } from "../types";
import { MIN_CENTER_HOLE, MIN_RADIUS, MIN_STROKE_WIDTH } from "./constants";

const RINGS_TO_DIAMETER = 2;

/**
 * Derive an automatic stroke width so `count` rings fit within `size`,
 * leaving a small centre hole and honoring the gap between rings.
 */
function autoStrokeWidth(count: number, size: number, gap: number): number {
	const usableRadius = size / RINGS_TO_DIAMETER - MIN_CENTER_HOLE;
	const totalGap = Math.max(count - 1, 0) * gap;
	const perRing = (usableRadius - totalGap) / count;
	return Math.max(perRing, MIN_STROKE_WIDTH);
}

/**
 * Compute the geometry (centre-line radius + stroke width) for each ring,
 * ordered outermost first. Radii are clamped to a minimum so inner rings
 * never collapse to a negative radius.
 */
export function computeRingLayout(
	count: number,
	size: number,
	gap: number,
	ringWidth?: number,
): RingLayout[] {
	if (count <= 0 || size <= 0) {
		return [];
	}

	const strokeWidth =
		ringWidth !== undefined && ringWidth > 0
			? ringWidth
			: autoStrokeWidth(count, size, gap);

	const outerRadius = size / RINGS_TO_DIAMETER - strokeWidth / RINGS_TO_DIAMETER;
	const step = strokeWidth + gap;

	const rings: RingLayout[] = [];
	for (let index = 0; index < count; index += 1) {
		const radius = outerRadius - index * step;
		rings.push({ radius: Math.max(radius, MIN_RADIUS), strokeWidth });
	}
	return rings;
}
