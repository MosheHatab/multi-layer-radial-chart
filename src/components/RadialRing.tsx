import { type JSX, type PointerEvent, type Ref } from "react";

import { DASH_ARRAY } from "../core/constants";
import { describeArc } from "../core/geometry";
import { useAnimatedValue } from "../hooks/useAnimatedValue";
import type { NormalizedDatum } from "../types";

const ARIA_MIN = 0;
const ARIA_MAX = 100;

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
		animate,
		durationMs,
		maxSweepDegrees,
		onHover,
		onLeave,
		ref,
	} = props;

	const fraction = useAnimatedValue(datum.fraction, durationMs, animate);

	const trackPath = describeArc(center, center, radius, 1, startAngle, clockwise, maxSweepDegrees);
	const progressPath = describeArc(
		center,
		center,
		radius,
		fraction,
		startAngle,
		clockwise,
		maxSweepDegrees,
	);

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
					stroke={datum.color}
					strokeWidth={strokeWidth}
					strokeLinecap={lineCap}
					strokeDasharray={datum.pattern === "dashed" ? DASH_ARRAY : undefined}
					style={isInteractive ? { cursor: "pointer" } : undefined}
					onPointerEnter={isInteractive ? handlePointer : undefined}
					onPointerMove={isInteractive ? handlePointer : undefined}
					onPointerLeave={isInteractive ? onLeave : undefined}
				/>
			) : null}
		</g>
	);
}
