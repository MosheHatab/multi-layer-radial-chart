import type { Point } from "../types";
import { clamp, degToRad, roundTo } from "../utils/math";
import { DEGREES_IN_CIRCLE, DEGREES_IN_HALF_CIRCLE, PATH_PRECISION } from "./constants";

/** Convert a polar coordinate (centre, radius, angle in degrees) to cartesian. */
export function polarToCartesian(
	cx: number,
	cy: number,
	radius: number,
	angleDeg: number,
): Point {
	const angleRad = degToRad(angleDeg);
	return {
		x: cx + radius * Math.cos(angleRad),
		y: cy + radius * Math.sin(angleRad),
	};
}

function format(value: number): string {
	return String(roundTo(value, PATH_PRECISION));
}

/**
 * Build an SVG path `d` for a fraction (`0..1`) of an arc that spans
 * `sweepDegrees` (default a full circle) starting at `startAngle`.
 *
 * A full circle cannot be drawn with a single elliptical arc, so when the
 * fraction fills a 360deg sweep the path is emitted as two half-arcs.
 */
export function describeArc(
	cx: number,
	cy: number,
	radius: number,
	fraction: number,
	startAngle: number,
	clockwise: boolean,
	sweepDegrees: number = DEGREES_IN_CIRCLE,
): string {
	const safeFraction = clamp(fraction, 0, 1);
	if (safeFraction <= 0 || radius <= 0) {
		return "";
	}

	const direction = clockwise ? 1 : -1;
	const sweepFlag = clockwise ? 1 : 0;
	const isFullCircle = sweepDegrees >= DEGREES_IN_CIRCLE && safeFraction >= 1;

	if (isFullCircle) {
		const midAngle = startAngle + DEGREES_IN_HALF_CIRCLE * direction;
		const startPoint = polarToCartesian(cx, cy, radius, startAngle);
		const midPoint = polarToCartesian(cx, cy, radius, midAngle);
		return (
			`M ${format(startPoint.x)} ${format(startPoint.y)} ` +
			`A ${format(radius)} ${format(radius)} 0 0 ${sweepFlag} ${format(midPoint.x)} ${format(midPoint.y)} ` +
			`A ${format(radius)} ${format(radius)} 0 0 ${sweepFlag} ${format(startPoint.x)} ${format(startPoint.y)}`
		);
	}

	const sweep = sweepDegrees * safeFraction * direction;
	const endAngle = startAngle + sweep;
	const startPoint = polarToCartesian(cx, cy, radius, startAngle);
	const endPoint = polarToCartesian(cx, cy, radius, endAngle);
	const largeArcFlag = Math.abs(sweep) > DEGREES_IN_HALF_CIRCLE ? 1 : 0;

	return (
		`M ${format(startPoint.x)} ${format(startPoint.y)} ` +
		`A ${format(radius)} ${format(radius)} 0 ${largeArcFlag} ${sweepFlag} ${format(endPoint.x)} ${format(endPoint.y)}`
	);
}
