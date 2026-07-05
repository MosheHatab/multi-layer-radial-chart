import { DEFAULT_COUNT_UP_MS } from "../core/constants";
import { roundTo } from "../utils/math";
import { useAnimatedValue } from "./useAnimatedValue";

/** Options for {@link useCountUp}. */
export interface UseCountUpOptions {
	/** Tween duration in milliseconds. Default `800`. */
	durationMs?: number;
	/** Enable the animation. When `false` the value snaps. Default `true`. */
	animate?: boolean;
	/** Decimal places to keep. Default `0` (integer count-up). */
	decimals?: number;
}

const DEFAULT_DECIMALS = 0;

/**
 * Animate a number counting up (or down) toward `target`, ideal for the value
 * displayed in a chart's centre. Built on {@link useAnimatedValue}, so it is
 * SSR-safe and honors a disabled/reduced-motion state by snapping instantly.
 */
export function useCountUp(target: number, options: UseCountUpOptions = {}): number {
	const {
		durationMs = DEFAULT_COUNT_UP_MS,
		animate = true,
		decimals = DEFAULT_DECIMALS,
	} = options;

	const raw = useAnimatedValue(target, durationMs, animate);
	return roundTo(raw, decimals);
}
