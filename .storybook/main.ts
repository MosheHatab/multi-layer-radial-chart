import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	core: {
		disableTelemetry: true,
	},
	viteFinal(viteConfig) {
		// Storybook merges the project's vite.config.ts, which includes
		// vite-plugin-dts (declaration bundling for the library build). That
		// plugin is irrelevant to Storybook and fails in a clean checkout because
		// api-extractor expects ./dist/index.d.ts to already exist. Strip it here.
		const plugins = (viteConfig.plugins ?? []).filter((plugin) => {
			const name =
				plugin && typeof plugin === "object" && "name" in plugin
					? String((plugin as { name?: unknown }).name)
					: "";
			return !name.includes("dts");
		});
		return { ...viteConfig, plugins };
	},
};

export default config;
