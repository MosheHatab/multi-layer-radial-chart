import { type RefObject, useEffect, useRef, useState } from "react";

export interface ElementSize {
	readonly width: number;
	readonly height: number;
}

const INITIAL_SIZE: ElementSize = { width: 0, height: 0 };

/**
 * Track an element's content-box size via `ResizeObserver`.
 * Returns a ref to attach and the latest measured size. SSR-safe: when
 * `ResizeObserver` is unavailable the size simply stays at its initial value.
 */
export function useElementSize<T extends HTMLElement>(): [RefObject<T | null>, ElementSize] {
	const ref = useRef<T>(null);
	const [size, setSize] = useState<ElementSize>(INITIAL_SIZE);

	useEffect(() => {
		const element = ref.current;
		if (!element || typeof ResizeObserver === "undefined") {
			return;
		}

		// ResizeObserver fires once with the initial size on observe(), so no
		// synchronous setState is needed here.
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (!entry) {
				return;
			}
			const { width, height } = entry.contentRect;
			setSize({ width, height });
		});

		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, []);

	return [ref, size];
}
