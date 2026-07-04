import type { JSX } from "react";

import type { NormalizedDatum } from "../types";

export interface RadialChartLabelsProps {
	/** Normalized data to list in the legend. */
	data: readonly NormalizedDatum[];
}

/**
 * Built-in legend. Renders each ring's label plus value and percentage so the
 * chart is readable without relying on color alone (accessibility).
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
						style={{ backgroundColor: datum.color }}
						aria-hidden="true"
					/>
					<span className="rc-legend-label">{datum.label}</span>
					<span className="rc-legend-value">
						{datum.value}/{datum.max} ({datum.percent}%)
					</span>
				</li>
			))}
		</ul>
	);
}
