import type { ReactNode } from "react";

/** Visual pattern for a ring's progress stroke (color-independent differentiation). */
export type RingPattern = "solid" | "dashed";

/** SVG-native gradient kind for a ring's progress stroke. */
export type RingGradientType = "linear" | "radial";

/** A single color stop within a {@link RingGradient}. */
export interface RingGradientStop {
	/** Stop position as a fraction in `[0, 1]`. */
	readonly offset: number;
	/** CSS color for this stop. */
	readonly color: string;
	/** Optional stop opacity in `[0, 1]`. Defaults to `1`. */
	readonly opacity?: number;
}

/**
 * A gradient fill for a ring's progress stroke. SVG natively supports `linear`
 * and `radial` gradients (a true conic gradient is not part of the SVG paint
 * spec, so it is intentionally not offered here).
 */
export interface RingGradient {
	/** Gradient kind. Defaults to `"linear"`. */
	readonly type?: RingGradientType;
	/** Direction in degrees for a linear gradient (0 = left→right). Default `0`. */
	readonly angle?: number;
	/** Ordered color stops (at least two recommended). */
	readonly stops: readonly RingGradientStop[];
}

/** A single data series rendered as one concentric ring. */
export interface RadialDatum {
	/** Current value. Values outside `[0, max]` are clamped for rendering. */
	readonly value: number;
	/** Upper bound for `value`. Must be greater than 0 to render progress. */
	readonly max: number;
	/** CSS color for the progress arc (any valid CSS color string). */
	readonly color: string;
	/** Human-readable label used for the legend, tooltip and accessible name. */
	readonly label: string;
	/** Optional CSS color for the background track. Defaults to a themed track. */
	readonly trackColor?: string;
	/** Optional stroke pattern for the progress arc. Defaults to `"solid"`. */
	readonly pattern?: RingPattern;
	/** Optional gradient fill for the progress arc. Overrides `color` when set. */
	readonly gradient?: RingGradient;
	/**
	 * Optional goal marker drawn as a tick on the track, expressed in the same
	 * units as `value` (i.e. relative to `max`). Ignored when outside `[0, max]`.
	 */
	readonly threshold?: number;
}

/** Public props for the {@link RadialChart} component. */
export interface RadialChartProps {
	/** The series to render, outermost ring first. */
	data: readonly RadialDatum[];
	/** Fixed pixel size. Omit to size responsively to the container width. */
	size?: number;
	/** Angle (degrees) where every arc begins. Default `-90` (12 o'clock). */
	startAngle?: number;
	/** Pixel gap between adjacent rings. */
	gap?: number;
	/** Fixed stroke width (px). Auto-derived from `size`/count when omitted. */
	ringWidth?: number;
	/** Round the arc line caps. Default `true`. */
	rounded?: boolean;
	/**
	 * Allow values above `max` to overrun the ring as an overlapping extra lap
	 * (Apple-Watch style). When `false` (default) progress is clamped at 100%.
	 */
	allowOverflow?: boolean;
	/** Animate value transitions. Default `true`. */
	animate?: boolean;
	/** Tween duration in milliseconds. Default `800`. */
	animationDurationMs?: number;
	/** Draw arcs clockwise. Default `true`. */
	clockwise?: boolean;
	/** Total sweep in degrees. Default `360`; e.g. `270` gauge, `180` semicircle. */
	maxSweepDegrees?: number;
	/** Render the built-in legend below the chart. Default `false`. */
	showLegend?: boolean;
	/**
	 * Decimal places for the percentage shown in the built-in legend.
	 * Default `0` (whole numbers). Formatted with `toFixed`, so values like
	 * `58.31%` render exactly rather than as `58.31000000000001%`.
	 */
	percentDecimals?: number;
	/** Show a hover tooltip per ring. Default `false`. */
	showTooltip?: boolean;
	/**
	 * Called when a ring is activated by click or keyboard (Enter/Space).
	 * Providing this makes each ring focusable and keyboard-operable.
	 */
	onSegmentClick?: (datum: NormalizedDatum, index: number) => void;
	/** Called when the pointer enters or moves over a ring. */
	onSegmentHover?: (datum: NormalizedDatum, index: number) => void;
	/** Called when the pointer leaves a previously hovered ring. */
	onSegmentLeave?: (datum: NormalizedDatum, index: number) => void;
	/** Extra class name applied to the outer container. */
	className?: string;
	/** Content rendered in the centre of the chart. */
	children?: ReactNode;
}

/** A 2D point in SVG user space. */
export interface Point {
	readonly x: number;
	readonly y: number;
}

/** Geometry for a single ring produced by the layout engine. */
export interface RingLayout {
	/** Centre-line radius of the ring stroke. */
	readonly radius: number;
	/** Stroke width of the ring. */
	readonly strokeWidth: number;
}

/** A datum after validation and normalization, ready for rendering. */
export interface NormalizedDatum {
	readonly value: number;
	readonly max: number;
	readonly color: string;
	readonly label: string;
	readonly trackColor?: string;
	readonly pattern: RingPattern;
	readonly gradient?: RingGradient;
	/** Progress as a fraction in `[0, 1]` (clamped). */
	readonly fraction: number;
	/** Unclamped progress as a fraction (`>= 0`); can exceed `1` for overflow. */
	readonly rawFraction: number;
	/** Progress as an integer percentage in `[0, 100]` (clamped). */
	readonly percent: number;
	/** Goal marker position as a fraction in `[0, 1]`, or `undefined` if unset. */
	readonly thresholdFraction?: number;
}
