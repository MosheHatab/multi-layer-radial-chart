# multi-layer-radial-chart

## 0.1.0

Initial release.

- Multi-layer radial (activity-ring) chart rendered with pure SVG.
- Animated value transitions via `requestAnimationFrame` (honors `prefers-reduced-motion`).
- Responsive sizing through `ResizeObserver`, or a fixed `size`.
- Strict TypeScript types, no `any`; math/geometry separated from the UI layer.
- Accessibility: `role="progressbar"` per ring, legend, and `pattern` support so color is not the only indicator.
- Gauge / semicircle layouts via `maxSweepDegrees`, optional legend and hover tooltip.
