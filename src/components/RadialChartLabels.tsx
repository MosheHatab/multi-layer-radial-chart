import type { CSSProperties, JSX } from "react";

import { CSS_GRADIENT_ANGLE_OFFSET, DEFAULT_GRADIENT_ANGLE, PERCENT_SCALE } from "../core/constants";
import type { NormalizedDatum, RingGradient } from "../types";

export interface RadialChartLabelsProps {
	/** Normalized data to list in the legend. */
	data: readonly NormalizedDatum[];
}

/**
 * Convert a `RingGradient` to a CSS `background` value so the legend swatch
 * mirrors the ring's actual fill. Supports linear (with angle) and radial.
 */
function gradientBackground(gradient: RingGradient): string {
	const stops = gradient.stops
		.map((stop) => `${stop.color} ${Math.round(stop.offset * PERCENT_SCALE)}%`)
		.join(", ");

	if (gradient.type === "radial") {
		return `radial-gradient(circle, ${stops})`;
	}

	const angle = (gradient.angle ?? DEFAULT_GRADIENT_ANGLE) + CSS_GRADIENT_ANGLE_OFFSET;
	return `linear-gradient(${angle}deg, ${stops})`;
}

function swatchStyle(datum: NormalizedDatum): CSSProperties {
	if (datum.gradient) {
		return { background: gradientBackground(datum.gradient) };
	}
	return { backgroundColor: datum.color };
}

/**
 * Returns the percentage to display in the legend.
 * When the value exceeds max (overflow case) show the real ratio (e.g. 135%)
 * rather than the capped 100% so readers can see the actual progress.
 */
function displayPercent(datum: NormalizedDatum): number {
	return datum.rawFraction > 1 ? Math.round(datum.rawFraction * PERCENT_SCALE) : datum.percent;
}

/**
 * Built-in legend. Renders each ring's label plus value and percentage so the
 * chart is readable without relying on color alone (accessibility).
 * When a datum has a gradient the swatch mirrors it.
 * When a value exceeds its max the percentage shown is the real ratio (>100%).
 */
export function RadialChartLabels(props: RadialChartLabelsProps): JSX.Element | null {
	const { data } = props;

	if (data.length === 0) {
		return null;
	}

	return (
		<ul className="rc-legend">
			{data.map((datum, index) => (
				<li className="rc-legend-item" key={`${datum.label}-${index}`}>
					<span
						className="rc-legend-swatch"
						style={swatchStyle(datum)}
						aria-hidden="true"
					/>
					<span className="rc-legend-label">{datum.label}</span>
					<span className="rc-legend-value">
						{datum.value}/{datum.max} ({displayPercent(datum)}%)
					</span>
				</li>
			))}
		</ul>
	);
}
