/**
 * Framework-agnostic core for `multi-layer-radial-chart`.
 *
 * This entry point ships only pure geometry, scaling, layout, validation and
 * color helpers — **no React**. Import it from Vue, Svelte, Solid, vanilla JS,
 * a `<canvas>` renderer or server code to compute radial-chart geometry and
 * render it with your own view layer:
 *
 * ```ts
 * import {
 *   validateData,
 *   computeRingLayout,
 *   describeArc,
 * } from "multi-layer-radial-chart/core";
 * ```
 */

export type { GradientVector, MarkerLine } from "./core/geometry";
export {
	describeArc,
	describeArcSegment,
	gradientVector,
	markerLine,
	polarToCartesian,
} from "./core/geometry";
export { computeRingLayout } from "./core/layout";
export { toFraction, toPercent, toRawFraction } from "./core/scale";
export type {
	NormalizedDatum,
	Point,
	RadialDatum,
	RingGradient,
	RingGradientStop,
	RingGradientType,
	RingLayout,
	RingPattern,
} from "./types";
export { contrastingColor, contrastShadow } from "./utils/color";
export { normalizeDatum, validateData } from "./utils/validation";
