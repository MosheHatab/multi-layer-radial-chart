# multi-layer-radial-chart

## 1.0.1

### Patch Changes

- d273d11: Add `percentDecimals` prop for configurable legend percentage precision. Improve floating-point rounding in percent formatting.

## 1.0.0

### Major Changes

- 5c2fe08: First stable release.

  ### Added
  - Interactive rings: `onSegmentClick` / `onSegmentHover` / `onSegmentLeave` + keyboard focus.
  - Framework-agnostic `multi-layer-radial-chart/core` entry (no React).
  - Per-ring gradients, overflow laps, threshold markers.
  - `useCountUp` and headless `useRadialChart` hooks.

  ### Notes
  - Public API is now stable under semver.

## 0.1.0

Initial release.

- Multi-layer radial (activity-ring) chart rendered with pure SVG.
- Animated value transitions via `requestAnimationFrame` (honors `prefers-reduced-motion`).
- Responsive sizing through `ResizeObserver`, or a fixed `size`.
- Strict TypeScript types, no `any`; math/geometry separated from the UI layer.
- Accessibility: `role="progressbar"` per ring, legend, and `pattern` support so color is not the only indicator.
- Gauge / semicircle layouts via `maxSweepDegrees`, optional legend and hover tooltip.
