import type { ReactNode } from "react";

/** Visual pattern for a ring's progress stroke (color-independent differentiation). */
export type RingPattern = "solid" | "dashed";

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
	/** Show a hover tooltip per ring. Default `false`. */
	showTooltip?: boolean;
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
	/** Progress as a fraction in `[0, 1]`. */
	readonly fraction: number;
	/** Progress as an integer percentage in `[0, 100]`. */
	readonly percent: number;
}
