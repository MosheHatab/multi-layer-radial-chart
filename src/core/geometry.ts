import type { Point } from "../types";
import { clamp, degToRad, roundTo } from "../utils/math";
import { DEGREES_IN_CIRCLE, DEGREES_IN_HALF_CIRCLE, PATH_PRECISION } from "./constants";

/* eslint-disable id-length -- x1/y1/x2/y2 are the canonical SVG gradient attribute names */
/** The four unit-square endpoints of a linear gradient at a given angle. */
export interface GradientVector {
	readonly x1: number;
	readonly y1: number;
	readonly x2: number;
	readonly y2: number;
}

const GRADIENT_MIDPOINT = 0.5;

/**
 * Compute the `x1/y1/x2/y2` for an SVG `linearGradient` (in objectBoundingBox
 * units) so its direction matches `angleDeg` (0 = left→right, 90 = top→bottom).
 */
export function gradientVector(angleDeg: number): GradientVector {
	const angleRad = degToRad(angleDeg);
	const deltaX = Math.cos(angleRad) * GRADIENT_MIDPOINT;
	const deltaY = Math.sin(angleRad) * GRADIENT_MIDPOINT;
	return {
		x1: roundTo(GRADIENT_MIDPOINT - deltaX, PATH_PRECISION),
		y1: roundTo(GRADIENT_MIDPOINT - deltaY, PATH_PRECISION),
		x2: roundTo(GRADIENT_MIDPOINT + deltaX, PATH_PRECISION),
		y2: roundTo(GRADIENT_MIDPOINT + deltaY, PATH_PRECISION),
	};
}
/* eslint-enable id-length */

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

/** A radial line segment spanning a ring's stroke, used for goal markers. */
export interface MarkerLine {
	readonly inner: Point;
	readonly outer: Point;
}

const STROKE_HALVES = 2;

/**
 * Compute the inner/outer endpoints of a radial tick placed at `fraction`
 * along a ring (spanning the stroke width plus an optional `overhang` on each
 * side), for drawing a goal marker.
 */
export function markerLine(
	cx: number,
	cy: number,
	radius: number,
	strokeWidth: number,
	fraction: number,
	startAngle: number,
	clockwise: boolean,
	sweepDegrees: number = DEGREES_IN_CIRCLE,
	overhang: number = 0,
): MarkerLine {
	const direction = clockwise ? 1 : -1;
	const angle = startAngle + sweepDegrees * clamp(fraction, 0, 1) * direction;
	const halfStroke = strokeWidth / STROKE_HALVES + overhang;
	return {
		inner: polarToCartesian(cx, cy, radius - halfStroke, angle),
		outer: polarToCartesian(cx, cy, radius + halfStroke, angle),
	};
}

function format(value: number): string {
	return String(roundTo(value, PATH_PRECISION));
}

/**
 * Build an SVG path `d` for the sub-arc between two fractions (`0..1`) of a
 * sweep. Used to isolate the leading tip of an overflow lap so a shadow can be
 * drawn only there (underneath the full lap), keeping the rest seamless.
 */
export function describeArcSegment(
	cx: number,
	cy: number,
	radius: number,
	startFraction: number,
	endFraction: number,
	startAngle: number,
	clockwise: boolean,
	sweepDegrees: number = DEGREES_IN_CIRCLE,
): string {
	const startClamped = clamp(startFraction, 0, 1);
	const endClamped = clamp(endFraction, 0, 1);
	if (endClamped <= startClamped || radius <= 0) {
		return "";
	}

	const direction = clockwise ? 1 : -1;
	const sweepFlag = clockwise ? 1 : 0;
	const fromAngle = startAngle + sweepDegrees * startClamped * direction;
	const toAngle = startAngle + sweepDegrees * endClamped * direction;
	const startPoint = polarToCartesian(cx, cy, radius, fromAngle);
	const endPoint = polarToCartesian(cx, cy, radius, toAngle);
	const largeArcFlag =
		sweepDegrees * (endClamped - startClamped) > DEGREES_IN_HALF_CIRCLE ? 1 : 0;

	return (
		`M ${format(startPoint.x)} ${format(startPoint.y)} ` +
		`A ${format(radius)} ${format(radius)} 0 ${largeArcFlag} ${sweepFlag} ${format(endPoint.x)} ${format(endPoint.y)}`
	);
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
