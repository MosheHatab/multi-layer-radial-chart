import { useSyncExternalStore } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function isSupported(): boolean {
	return typeof window !== "undefined" && typeof window.matchMedia === "function";
}

function subscribe(onChange: () => void): () => void {
	if (!isSupported()) {
		return () => {};
	}
	const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
	mediaQuery.addEventListener("change", onChange);
	return () => {
		mediaQuery.removeEventListener("change", onChange);
	};
}

function getSnapshot(): boolean {
	return isSupported() ? window.matchMedia(REDUCED_MOTION_QUERY).matches : false;
}

function getServerSnapshot(): boolean {
	return false;
}

/**
 * Reactively report whether the user prefers reduced motion.
 * SSR-safe via `useSyncExternalStore`: defaults to `false` and only
 * subscribes when `matchMedia` is available.
 */
export function useReducedMotion(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
