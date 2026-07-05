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
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				core: resolve(__dirname, "src/core.ts"),
			},
			formats: ["es", "cjs"],
			fileName: (format, entryName) =>
				`${entryName}.${format === "es" ? "js" : "cjs"}`,
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
