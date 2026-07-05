const HEX_RADIX = 16;
const SHORT_HEX_LENGTH = 3;
const FULL_HEX_LENGTH = 6;
const MAX_CHANNEL = 255;

/** WCAG 2.x relative-luminance constants (sRGB linearisation + coefficients). */
const SRGB_LINEAR_THRESHOLD = 0.03928;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_GAMMA_OFFSET = 0.055;
const SRGB_GAMMA_SCALE = 1.055;
const SRGB_GAMMA_EXPONENT = 2.4;
const LUMINANCE_RED = 0.2126;
const LUMINANCE_GREEN = 0.7152;
const LUMINANCE_BLUE = 0.0722;

/** Luminance above which a color is "light" (WCAG 4.5:1 black/white crossover). */
const CONTRAST_LUMINANCE_THRESHOLD = 0.179;

interface Rgb {
	readonly red: number;
	readonly green: number;
	readonly blue: number;
}

/**
 * Parses a 3- or 6-digit hex color string into its channels.
 * Returns null for unrecognised formats (named colors, rgb(), hsl(), etc.).
 */
function hexToRgb(hex: string): Rgb | null {
	const clean = hex.replace(/^#/, "");
	if (clean.length === SHORT_HEX_LENGTH) {
		return {
			red: parseInt(clean[0] + clean[0], HEX_RADIX),
			green: parseInt(clean[1] + clean[1], HEX_RADIX),
			blue: parseInt(clean[2] + clean[2], HEX_RADIX),
		};
	}
	if (clean.length === FULL_HEX_LENGTH) {
		return {
			red: parseInt(clean.slice(0, 2), HEX_RADIX),
			green: parseInt(clean.slice(2, 4), HEX_RADIX),
			blue: parseInt(clean.slice(4, 6), HEX_RADIX),
		};
	}
	return null;
}

/**
 * Converts a [0-255] channel value to a linearised sRGB component,
 * following the WCAG 2.x relative-luminance algorithm.
 */
function toLinear(channel: number): number {
	const normalised = channel / MAX_CHANNEL;
	return normalised <= SRGB_LINEAR_THRESHOLD
		? normalised / SRGB_LINEAR_DIVISOR
		: Math.pow((normalised + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_SCALE, SRGB_GAMMA_EXPONENT);
}

/**
 * Returns `"#ffffff"` when `hex` is a dark color, `"#000000"` when it is light.
 * Falls back to `"#ffffff"` for any color format that cannot be parsed (named
 * colors, `rgb()`, `hsl()`, etc.).
 */
export function contrastingColor(hex: string): string {
	const rgb = hexToRgb(hex);
	if (!rgb) {
		return "#ffffff";
	}
	const luminance =
		LUMINANCE_RED * toLinear(rgb.red) +
		LUMINANCE_GREEN * toLinear(rgb.green) +
		LUMINANCE_BLUE * toLinear(rgb.blue);
	return luminance > CONTRAST_LUMINANCE_THRESHOLD ? "#000000" : "#ffffff";
}

/**
 * Returns an `rgba(...)` shadow color that contrasts with `hex`, so a cast
 * shadow stays visible on both light and dark ring colors (a light "shadow"
 * on dark rings, a dark shadow on light rings). Mirrors how UI kits pick a
 * contrasting overlay color from a base color.
 */
export function contrastShadow(hex: string): string {
	return contrastingColor(hex) === "#ffffff"
		? "rgba(255, 255, 255, 0.8)"
		: "rgba(0, 0, 0, 0.55)";
}
