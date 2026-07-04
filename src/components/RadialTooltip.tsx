import type { JSX } from "react";

import type { NormalizedDatum } from "../types";

export interface RadialTooltipProps {
	/** Datum to describe, or `null` to render nothing. */
	datum: NormalizedDatum | null;
	/** X position (px) relative to the chart container. */
	x: number;
	/** Y position (px) relative to the chart container. */
	y: number;
}

/** Lightweight hover tooltip positioned relative to the chart container. */
export function RadialTooltip(props: RadialTooltipProps): JSX.Element | null {
	const { datum, x, y } = props;

	if (!datum) {
		return null;
	}

	return (
		<div className="rc-tooltip" role="tooltip" style={{ left: x, top: y }}>
			<span className="rc-tooltip-label">{datum.label}</span>
			<span className="rc-tooltip-value">
				{datum.value}/{datum.max} ({datum.percent}%)
			</span>
		</div>
	);
}
