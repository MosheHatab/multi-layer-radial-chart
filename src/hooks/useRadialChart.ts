import { useMemo } from "react";

import {
	DEFAULT_GAP,
	DEFAULT_MAX_SWEEP,
	DEFAULT_START_ANGLE,
} from "../core/constants";
import { describeArc } from "../core/geometry";
import { computeRingLayout } from "../core/layout";
import type { NormalizedDatum, RadialDatum } from "../types";
import { validateData } from "../utils/validation";

const HALF = 2;
const FULL_FRACTION = 1;

/** Options for {@link useRadialChart}. */
export interface UseRadialChartOptions {
	/** Square canvas size in pixels. Required for geometry. */
	size: number;
	/** Pixel gap between adjacent rings. Default `6`. */
	gap?: number;
	/** Fixed stroke width (px). Auto-derived from `size`/count when omitted. */
	ringWidth?: number;
	/** Angle (degrees) where every arc begins. Default `-90` (12 o'clock). */
	startAngle?: number;
	/** Draw arcs clockwise. Default `true`. */
	clockwise?: boolean;
	/** Total sweep in degrees. Default `360`. */
	maxSweepDegrees?: number;
}

/** Computed geometry for one ring, ready to render as raw SVG. */
export interface RadialRingGeometry {
	/** The normalized datum backing this ring. */
	readonly datum: NormalizedDatum;
	/** Centre-line radius of the ring stroke. */
	readonly radius: number;
	/** Stroke width of the ring. */
	readonly strokeWidth: number;
	/** SVG path `d` for the full background track. */
	readonly trackPath: string;
	/** SVG path `d` for the progress arc at the datum's current fraction. */
	readonly progressPath: string;
}

/** Result of {@link useRadialChart}. */
export interface UseRadialChartResult {
	/** Resolved square size in pixels. */
	readonly size: number;
	/** Centre coordinate (both axes) in SVG user space. */
	readonly center: number;
	/** Per-ring geometry, outermost ring first. */
	readonly rings: readonly RadialRingGeometry[];
}

/**
 * Headless engine for building a radial chart with your own SVG (or renderer).
 *
 * It validates the data and returns fully computed geometry — radii, stroke
 * widths and ready-to-use SVG path strings — without rendering anything itself.
 * Combine it with `useElementSize` for responsiveness and your own animation
 * (or {@link useAnimatedValue}) for transitions.
 */
export function useRadialChart(
	data: readonly RadialDatum[],
	options: UseRadialChartOptions,
): UseRadialChartResult {
	const {
		size,
		gap = DEFAULT_GAP,
		ringWidth,
		startAngle = DEFAULT_START_ANGLE,
		clockwise = true,
		maxSweepDegrees = DEFAULT_MAX_SWEEP,
	} = options;

	const normalized = useMemo(() => validateData(data), [data]);

	return useMemo<UseRadialChartResult>(() => {
		const center = size / HALF;
		const layout = computeRingLayout(normalized.length, size, gap, ringWidth);

		const rings = layout.map((ring, index) => {
			const datum = normalized[index];
			return {
				datum,
				radius: ring.radius,
				strokeWidth: ring.strokeWidth,
				trackPath: describeArc(
					center,
					center,
					ring.radius,
					FULL_FRACTION,
					startAngle,
					clockwise,
					maxSweepDegrees,
				),
				progressPath: describeArc(
					center,
					center,
					ring.radius,
					datum.fraction,
					startAngle,
					clockwise,
					maxSweepDegrees,
				),
			};
		});

		return { size, center, rings };
	}, [normalized, size, gap, ringWidth, startAngle, clockwise, maxSweepDegrees]);
}
