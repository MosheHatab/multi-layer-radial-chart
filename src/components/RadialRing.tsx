import { type JSX, type PointerEvent, type Ref, useId } from "react";

import {
	DASH_ARRAY,
	DEFAULT_GRADIENT_ANGLE,
	MARKER_OUTLINE_WIDTH,
	MARKER_OVERHANG,
	MARKER_WIDTH,
	OVERFLOW_SHADOW_BLUR,
	OVERFLOW_SHADOW_DEGREES,
} from "../core/constants";
import { describeArc, describeArcSegment, gradientVector, markerLine } from "../core/geometry";
import { useAnimatedValue } from "../hooks/useAnimatedValue";
import type { NormalizedDatum, RingGradient } from "../types";
import { contrastShadow } from "../utils/color";
import { clamp } from "../utils/math";

const ARIA_MIN = 0;
const ARIA_MAX = 100;
const FULL_OPACITY = 1;
const FULL_FRACTION = 1;

/** Static blur style for the overflow tip shadow (depends only on constants). */
const OVERFLOW_SHADOW_STYLE = { filter: `blur(${OVERFLOW_SHADOW_BLUR}px)` };

function RingGradientDef({ id, gradient }: { id: string; gradient: RingGradient }): JSX.Element {
	const stops = gradient.stops.map((stop, index) => (
		<stop
			key={`${id}-${index}`}
			offset={stop.offset}
			stopColor={stop.color}
			stopOpacity={stop.opacity ?? FULL_OPACITY}
		/>
	));

	if (gradient.type === "radial") {
		return <radialGradient id={id}>{stops}</radialGradient>;
	}

	const vector = gradientVector(gradient.angle ?? DEFAULT_GRADIENT_ANGLE);
	return (
		<linearGradient id={id} x1={vector.x1} y1={vector.y1} x2={vector.x2} y2={vector.y2}>
			{stops}
		</linearGradient>
	);
}

export interface RadialRingProps {
	/** Centre coordinate (both axes) in SVG user space. */
	center: number;
	/** Centre-line radius of this ring. */
	radius: number;
	/** Stroke width of this ring. */
	strokeWidth: number;
	/** Normalized datum for this ring. */
	datum: NormalizedDatum;
	/** Angle (degrees) where the arc begins. */
	startAngle: number;
	/** Draw the arc clockwise. */
	clockwise: boolean;
	/** Round the stroke line caps. */
	rounded: boolean;
	/** Allow the arc to overrun as an overlapping extra lap when past 100%. */
	allowOverflow: boolean;
	/** Animate transitions of the progress value. */
	animate: boolean;
	/** Tween duration in milliseconds. */
	durationMs: number;
	/** Total sweep in degrees (360 = full circle). */
	maxSweepDegrees: number;
	/** Pointer-hover callback (enables tooltip reporting). */
	onHover?: (datum: NormalizedDatum, clientX: number, clientY: number) => void;
	/** Pointer-leave callback. */
	onLeave?: () => void;
	/** Optional forwarded ref (React 19 ref-as-prop). */
	ref?: Ref<SVGGElement>;
}

/**
 * A single concentric ring: a background track plus an animated progress arc.
 * Pure/presentational - all geometry comes from `core/`.
 */
export function RadialRing(props: RadialRingProps): JSX.Element {
	const {
		center,
		radius,
		strokeWidth,
		datum,
		startAngle,
		clockwise,
		rounded,
		allowOverflow,
		animate,
		durationMs,
		maxSweepDegrees,
		onHover,
		onLeave,
		ref,
	} = props;

	const targetFraction = allowOverflow ? datum.rawFraction : datum.fraction;
	const animatedFraction = useAnimatedValue(targetFraction, durationMs, animate);
	const baseFraction = Math.min(animatedFraction, FULL_FRACTION);
	const overflowFraction = allowOverflow ? clamp(animatedFraction - FULL_FRACTION, 0, 1) : 0;

	const gradientId = useId();
	const strokePaint = datum.gradient ? `url(#${gradientId})` : datum.color;

	const trackPath = describeArc(center, center, radius, 1, startAngle, clockwise, maxSweepDegrees);
	const progressPath = describeArc(
		center,
		center,
		radius,
		baseFraction,
		startAngle,
		clockwise,
		maxSweepDegrees,
	);
	const overflowPath =
		overflowFraction > 0
			? describeArc(center, center, radius, overflowFraction, startAngle, clockwise, maxSweepDegrees)
			: "";

	const marker =
		datum.thresholdFraction !== undefined
			? markerLine(
					center,
					center,
					radius,
					strokeWidth,
					datum.thresholdFraction,
					startAngle,
					clockwise,
					maxSweepDegrees,
					MARKER_OVERHANG,
				)
			: null;

	// Shadow segment: a short sub-arc at the leading tip, drawn UNDER the full
	// overflow lap. The lap (same width, on top) covers all of it except the
	// blur that bleeds past the tip cap — so the depth shadow appears only at
	// the end, never at the 12 o'clock start (which stays seamless).
	// Contrast color keeps the end visible on dark rings too (light on dark).
	const shadowFraction = OVERFLOW_SHADOW_DEGREES / maxSweepDegrees;
	const overflowShadowPath =
		overflowFraction > 0
			? describeArcSegment(
					center,
					center,
					radius,
					Math.max(overflowFraction - shadowFraction, 0),
					overflowFraction,
					startAngle,
					clockwise,
					maxSweepDegrees,
				)
			: "";
	const overflowShadowColor = contrastShadow(datum.color);

	const accessibleName = `${datum.label}: ${datum.value}/${datum.max} (${datum.percent}%)`;
	const lineCap = rounded ? "round" : "butt";
	const isInteractive = typeof onHover === "function";

	const handlePointer = (event: PointerEvent<SVGPathElement>): void => {
		onHover?.(datum, event.clientX, event.clientY);
	};

	return (
		<g
			ref={ref}
			role="progressbar"
			aria-label={accessibleName}
			aria-valuenow={datum.percent}
			aria-valuemin={ARIA_MIN}
			aria-valuemax={ARIA_MAX}
		>
			<title>{accessibleName}</title>
			{datum.gradient ? (
				<defs>
					<RingGradientDef id={gradientId} gradient={datum.gradient} />
				</defs>
			) : null}
			{trackPath ? (
				<path
					className="rc-ring-track"
					d={trackPath}
					fill="none"
					stroke={datum.trackColor ?? "var(--rc-track-color)"}
					strokeWidth={strokeWidth}
					strokeLinecap={lineCap}
				/>
			) : null}
			{progressPath ? (
				<path
					className="rc-ring-progress"
					d={progressPath}
					fill="none"
					stroke={strokePaint}
					strokeWidth={strokeWidth}
					strokeLinecap={lineCap}
					strokeDasharray={datum.pattern === "dashed" ? DASH_ARRAY : undefined}
					style={isInteractive ? { cursor: "pointer" } : undefined}
					onPointerEnter={isInteractive ? handlePointer : undefined}
					onPointerMove={isInteractive ? handlePointer : undefined}
					onPointerLeave={isInteractive ? onLeave : undefined}
				/>
			) : null}
			{overflowPath ? (
				<g className="rc-ring-overflow">
					{/*
					 * Shadow segment first (under the lap): a short contrast-colored
					 * arc at the tip, blurred. The lap drawn on top covers all of it
					 * except the blur past the tip cap → depth shadow only at the end.
					 */}
					{overflowShadowPath ? (
						<path
							d={overflowShadowPath}
							fill="none"
							stroke={overflowShadowColor}
							strokeWidth={strokeWidth}
							strokeLinecap={lineCap}
							style={OVERFLOW_SHADOW_STYLE}
						/>
					) : null}
					{/*
					 * Overflow (second lap) arc — one continuous arc on top of the
					 * base ring (same color/radius, seamless at the 12 o'clock start).
					 * It looks like a ring sitting on top of the first, with the
					 * shadow showing at the leading end (where the ring now is).
					 */}
					<path
						d={overflowPath}
						fill="none"
						stroke={strokePaint}
						strokeWidth={strokeWidth}
						strokeLinecap={lineCap}
						strokeDasharray={datum.pattern === "dashed" ? DASH_ARRAY : undefined}
					/>
				</g>
			) : null}
			{marker ? (
				<g className="rc-ring-marker">
					{/* Light outline — visible on dark backgrounds and dark ring colors */}
					<line
						x1={marker.inner.x}
						y1={marker.inner.y}
						x2={marker.outer.x}
						y2={marker.outer.y}
						stroke="var(--rc-marker-outline)"
						strokeWidth={MARKER_OUTLINE_WIDTH}
						strokeLinecap="round"
					/>
					{/* Dark tick on top — visible on light backgrounds */}
					<line
						x1={marker.inner.x}
						y1={marker.inner.y}
						x2={marker.outer.x}
						y2={marker.outer.y}
						stroke="var(--rc-marker-color)"
						strokeWidth={MARKER_WIDTH}
						strokeLinecap="round"
					/>
				</g>
			) : null}
		</g>
	);
}
