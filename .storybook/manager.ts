import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const BRAND = "#fb2576";
const INK = "#0b0b0f";

const theme = create({
	base: "dark",
	brandTitle: "multi-layer-radial-chart",
	brandUrl: "https://github.com/MosheHatab/multi-layer-radial-chart",
	colorPrimary: BRAND,
	colorSecondary: BRAND,
	appBg: INK,
	appContentBg: INK,
	appPreviewBg: INK,
	barSelectedColor: BRAND,
	barHoverColor: BRAND,
	fontBase: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, sans-serif',
	fontCode: '"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
});

addons.setConfig({ theme });
