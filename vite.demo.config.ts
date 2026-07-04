import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	root: "demo",
	base: "/",
	plugins: [react(), tailwindcss()],
	build: {
		outDir: "../dist-demo",
		emptyOutDir: true,
	},
});
