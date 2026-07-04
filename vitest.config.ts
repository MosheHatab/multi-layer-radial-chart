import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: false,
		setupFiles: ["./tests/setup.ts"],
		css: true,
		include: ["tests/**/*.{test,spec}.{ts,tsx}"],
		// Run all files in a single worker without isolation. The setup import
		// (jsdom + jest-dom) is heavy, so this avoids per-file worker-start
		// timeouts on constrained machines while keeping tests deterministic.
		isolate: false,
		pool: "forks",
		fileParallelism: false,
	},
});
