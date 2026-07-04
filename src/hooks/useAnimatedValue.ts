import { useEffect, useRef, useState } from "react";

import { easeOutCubic, lerp } from "../utils/math";

/**
 * Tween a numeric value toward `target` using `requestAnimationFrame`.
 *
 * When `enabled` is false, `durationMs <= 0`, or `requestAnimationFrame` is
 * unavailable (SSR), the value snaps to `target`. Changing `target` mid-flight
 * restarts the tween from the currently displayed value for a smooth handoff.
 */
export function useAnimatedValue(target: number, durationMs: number, enabled: boolean): number {
	const [value, setValue] = useState(target);
	const displayedRef = useRef(target);
	const fromRef = useRef(target);
	const startRef = useRef<number | null>(null);
	const frameRef = useRef<number | null>(null);

	useEffect(() => {
		const canAnimate =
			enabled && durationMs > 0 && typeof requestAnimationFrame !== "undefined";

		if (!canAnimate) {
			displayedRef.current = target;
			// Intentional one-shot snap when animation is disabled or unsupported.
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setValue(target);
			return;
		}

		fromRef.current = displayedRef.current;
		startRef.current = null;

		const tick = (now: number): void => {
			if (startRef.current === null) {
				startRef.current = now;
			}
			const elapsed = now - startRef.current;
			const progress = Math.min(1, elapsed / durationMs);
			const next = lerp(fromRef.current, target, easeOutCubic(progress));

			displayedRef.current = next;
			setValue(next);

			if (progress < 1) {
				frameRef.current = requestAnimationFrame(tick);
			}
		};

		frameRef.current = requestAnimationFrame(tick);
		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
				frameRef.current = null;
			}
		};
	}, [target, durationMs, enabled]);

	return value;
}
