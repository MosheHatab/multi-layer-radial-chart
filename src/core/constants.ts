/** Angular constants (degrees). */
export const DEGREES_IN_CIRCLE = 360;
export const DEGREES_IN_HALF_CIRCLE = 180;

/** Percentage scale (fraction -> percent). */
export const PERCENT_SCALE = 100;

/** Cubic easing exponent used by {@link easeOutCubic}. */
export const EASE_CUBIC_EXPONENT = 3;

/** Decimal precision for SVG path coordinates. */
export const PATH_PRECISION = 3;

/** Default configuration values for the chart. */
export const DEFAULT_START_ANGLE = -90;
export const DEFAULT_GAP = 6;
export const DEFAULT_ANIMATION_MS = 800;
export const DEFAULT_MAX_SWEEP = DEGREES_IN_CIRCLE;

/** Responsive fallback size (px) when the container has not been measured yet. */
export const MIN_SIZE = 120;

/** Layout guard rails (px). */
export const MIN_RADIUS = 1;
export const MIN_STROKE_WIDTH = 2;
export const MIN_CENTER_HOLE = 16;

/** Dash pattern applied when a datum uses `pattern: "dashed"`. */
export const DASH_ARRAY = "8 6";

/** Default direction (degrees) for a linear ring gradient. */
export const DEFAULT_GRADIENT_ANGLE = 0;

/**
 * Degrees added to a ring gradient's angle when mirroring it as a CSS
 * `linear-gradient` in the legend swatch. SVG uses 0deg = left→right while CSS
 * uses 0deg = bottom→top, so a +90deg offset keeps the two visually aligned.
 */
export const CSS_GRADIENT_ANGLE_OFFSET = 90;

/** Stroke width (px) of the inner (dark) goal/threshold marker tick. */
export const MARKER_WIDTH = 2;

/** Stroke width (px) of the outer (light) outline of the marker tick. */
export const MARKER_OUTLINE_WIDTH = 5;

/** How far (px) a marker tick extends beyond each edge of the ring stroke. */
export const MARKER_OVERHANG = 3;

/**
 * Angular length (degrees) of the shadow segment drawn under the leading tip
 * of an overflow lap. Only its blur that bleeds past the tip cap is visible
 * (the full lap covers the rest), so the shadow appears only at the end.
 */
export const OVERFLOW_SHADOW_DEGREES = 22;

/** Blur radius (px) of the overflow lap's leading-tip shadow. */
export const OVERFLOW_SHADOW_BLUR = 4;

/** Default tween duration (ms) for {@link useCountUp}. */
export const DEFAULT_COUNT_UP_MS = 800;

/** Theming CSS custom properties consumed by the component stylesheet. */
export const CSS_VAR_TRACK_COLOR = "--rc-track-color";
export const CSS_VAR_TRANSITION = "--rc-transition";
export const CSS_VAR_MARKER_COLOR = "--rc-marker-color";
