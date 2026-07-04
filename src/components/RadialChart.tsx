import "./radialChart.css";

import { type JSX, useCallback, useMemo, useState } from "react";

import {
	DEFAULT_ANIMATION_MS,
	DEFAULT_GAP,
	DEFAULT_MAX_SWEEP,
	DEFAULT_START_ANGLE,
	MIN_SIZE,
} from "../core/constants";
import { computeRingLayout } from "../core/layout";
import { useElementSize } from "../hooks/useElementSize";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { NormalizedDatum, RadialChartProps } from "../types";
import { validateData } from "../utils/validation";
import { RadialChartLabels } from "./RadialChartLabels";
import { RadialRing } from "./RadialRing";
import { RadialTooltip } from "./RadialTooltip";

const HALF = 2;

interface TooltipState {
	datum: NormalizedDatum;
	x: number;
	y: number;
}

function buildChartLabel(data: readonly NormalizedDatum[]): string {
	if (data.length === 0) {
		return "Radial chart with no data";
	}
	const parts = data.map((datum) => `${datum.label} ${datum.percent}%`);
	return `Radial progress chart: ${parts.join(", ")}`;
}

/**
 * Multi-layer radial (activity-ring) chart. Renders one concentric ring per
 * datum with animated transitions, responsive sizing and accessible labels.
 */
export function RadialChart(props: RadialChartProps): JSX.Element {
	const {
		data,
		size,
		startAngle = DEFAULT_START_ANGLE,
		gap = DEFAULT_GAP,
		ringWidth,
		rounded = true,
		animate = true,
		animationDurationMs = DEFAULT_ANIMATION_MS,
		clockwise = true,
		maxSweepDegrees = DEFAULT_MAX_SWEEP,
		showLegend = false,
		showTooltip = false,
		className,
		children,
	} = props;

	const normalized = useMemo(() => validateData(data), [data]);
	const [containerRef, measured] = useElementSize<HTMLDivElement>();
	const prefersReducedMotion = useReducedMotion();
	const [tooltip, setTooltip] = useState<TooltipState | null>(null);

	const resolvedSize = size ?? Math.max(measured.width, MIN_SIZE);
	const center = resolvedSize / HALF;

	const rings = useMemo(
		() => computeRingLayout(normalized.length, resolvedSize, gap, ringWidth),
		[normalized.length, resolvedSize, gap, ringWidth],
	);

	const handleHover = useCallback(
		(datum: NormalizedDatum, clientX: number, clientY: number): void => {
			const container = containerRef.current;
			if (!container) {
				return;
			}
			const rect = container.getBoundingClientRect();
			setTooltip({ datum, x: clientX - rect.left, y: clientY - rect.top });
		},
		[containerRef],
	);

	const handleLeave = useCallback((): void => {
		setTooltip(null);
	}, []);

	const shouldAnimate = animate && !prefersReducedMotion;
	const containerClassName = ["rc-container", className].filter(Boolean).join(" ");

	return (
		<div className={containerClassName} ref={containerRef} style={{ width: size ?? "100%" }}>
			<div className="rc-chart" style={{ width: resolvedSize, height: resolvedSize }}>
				<svg
					className="rc-svg"
					viewBox={`0 0 ${resolvedSize} ${resolvedSize}`}
					width={resolvedSize}
					height={resolvedSize}
					role="img"
					aria-label={buildChartLabel(normalized)}
				>
					{rings.map((ring, index) => (
						<RadialRing
							key={`${normalized[index].label}-${index}`}
							center={center}
							radius={ring.radius}
							strokeWidth={ring.strokeWidth}
							datum={normalized[index]}
							startAngle={startAngle}
							clockwise={clockwise}
							rounded={rounded}
							animate={shouldAnimate}
							durationMs={animationDurationMs}
							maxSweepDegrees={maxSweepDegrees}
							onHover={showTooltip ? handleHover : undefined}
							onLeave={showTooltip ? handleLeave : undefined}
						/>
					))}
				</svg>
				{children ? <div className="rc-center">{children}</div> : null}
				{showTooltip && tooltip ? (
					<RadialTooltip datum={tooltip.datum} x={tooltip.x} y={tooltip.y} />
				) : null}
			</div>
			{showLegend ? <RadialChartLabels data={normalized} /> : null}
		</div>
	);
}
