import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src"],
			exclude: ["src/stories/**", "tests/**"],
			tsconfigPath: "./tsconfig.build.json",
			bundleTypes: true,
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "MultiLayerRadialChart",
			formats: ["es", "cjs"],
			fileName: (format) => (format === "es" ? "index.js" : "index.cjs"),
		},
		rollupOptions: {
			external: ["react", "react-dom", "react/jsx-runtime"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
				assetFileNames: "multi-layer-radial-chart.[ext]",
			},
		},
		sourcemap: true,
	},
});
