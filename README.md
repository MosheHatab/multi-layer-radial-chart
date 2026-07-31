# Multi-Layer Radial Chart

[![npm version](https://img.shields.io/npm/v/multi-layer-radial-chart.svg)](https://www.npmjs.com/package/multi-layer-radial-chart)
[![npm downloads](https://img.shields.io/npm/dm/multi-layer-radial-chart.svg)](https://www.npmjs.com/package/multi-layer-radial-chart)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/multi-layer-radial-chart)](https://bundlephobia.com/package/multi-layer-radial-chart)
[![CI](https://github.com/MosheHatab/multi-layer-radial-chart/actions/workflows/ci.yml/badge.svg)](https://github.com/MosheHatab/multi-layer-radial-chart/actions/workflows/ci.yml)
[![provenance](https://img.shields.io/npm/v/multi-layer-radial-chart?label=provenance&logo=npm)](https://www.npmjs.com/package/multi-layer-radial-chart#provenance)
[![license: MIT](https://img.shields.io/npm/l/multi-layer-radial-chart.svg)](./LICENSE)

Animated, Apple-Watch-style activity rings for React — rendered with pure SVG, zero chart dependencies.

> **Building for React Native / Expo?** Use the sibling package [`multi-layer-radial-chart-native`](https://www.npmjs.com/package/multi-layer-radial-chart-native) — the same engine and API, rendered with `react-native-svg`.

<p align="center">
  <a href="https://multi-layer-radial-chart-five.vercel.app/">
    <img src="https://raw.githubusercontent.com/MosheHatab/multi-layer-radial-chart/main/docs/demo.gif" alt="Multi-Layer Radial Chart — animated activity rings with live controls" width="720" />
  </a>
</p>

### [Live Demo](https://multi-layer-radial-chart-five.vercel.app/) · [Component Explorer (Storybook)](https://moshehatab.github.io/multi-layer-radial-chart/) · [Open in StackBlitz](https://stackblitz.com/github/MosheHatab/multi-layer-radial-chart/tree/main/examples/vite)

## Overview

A high-performance, dependency-free **React 19 + TypeScript** library for multi-layer radial (activity-ring) charts. It takes an array of `{ value, max, color, label }` items and renders concentric progress rings with smooth animated transitions. Built with a focus on clean architecture (math fully separated from the UI), performance (rAF-based tweening with proper cleanup), and robust, strict TypeScript (no `any`).

## Key Features

- **Pure SVG rendering:** crisp at any DPI, responsive via `viewBox`, no canvas or heavy chart libs.
- **Smooth animations:** `requestAnimationFrame` tweening with ease-out cubic; honors `prefers-reduced-motion`.
- **Fully responsive:** recalculates radius and stroke widths from the container size via `ResizeObserver`, or pass a fixed `size`.
- **Accessible by design:** each ring is a `role="progressbar"` with `aria-valuenow/min/max`; optional legend and `pattern` (dashed) support so color is never the only indicator.
- **Flexible layouts:** full circle, gauge (270°) or semicircle (180°) via `maxSweepDegrees`; optional hover tooltip and centered content via `children`.
- **Strictly typed & tree-shakeable:** precise interfaces, ESM + CJS builds, `sideEffects`-aware, ships its own tiny CSS.

## Architectural Highlights & Challenges Solved

> **Challenge:** An SVG elliptical arc (`A` command) cannot draw a full 360° circle — start and end points coincide, so the arc collapses and renders nothing.
> **Solution:** `describeArc` detects a full sweep and emits **two half-arcs** instead, while still supporting partial sweeps (gauges/semicircles) through a single `sweepDegrees` parameter. All of this lives in a pure, unit-tested `core/geometry` module with **zero React**, keeping trigonometry completely separate from the rendering layer.

> **Challenge:** Animating many rings without stale closures or leaked animation frames.
> **Solution:** A dedicated `useAnimatedValue` hook owns one `requestAnimationFrame` loop per ring, restarts cleanly from the currently displayed value when the target changes, and always cancels the frame on cleanup. Per-ring hooks live inside the `RadialRing` component (never inside a `.map()`), respecting the Rules of Hooks.

## Tech Stack

- **Frontend:** TypeScript, React 19, plain CSS + CSS variables (library); Tailwind CSS v4 (demo only)
- **Core APIs:** SVG, `requestAnimationFrame`, `ResizeObserver`, `matchMedia`
- **Tooling:** Vite (library mode), Vitest + Testing Library, ESLint (flat config + a local plugin), Prettier, Storybook, Changesets, size-limit

## Installation

```bash
npm install multi-layer-radial-chart
```

React 19 is a peer dependency.

## Usage

```tsx
import { RadialChart } from "multi-layer-radial-chart";
import "multi-layer-radial-chart/styles.css";

const data = [
  { value: 82, max: 100, color: "#fb2576", label: "Move" },
  { value: 45, max: 60, color: "#22d3ee", label: "Exercise" },
  { value: 9, max: 12, color: "#a3e635", label: "Stand" },
];

export function Dashboard() {
  return (
    <RadialChart data={data} showLegend showTooltip>
      <strong>82%</strong>
    </RadialChart>
  );
}
```

### Props

| Prop                  | Type                      | Default        | Description                                             |
| --------------------- | ------------------------- | -------------- | ------------------------------------------------------- |
| `data`                | `RadialDatum[]`           | —              | Series to render, outermost ring first.                 |
| `size`                | `number`                  | responsive     | Fixed pixel size; omit to size to the container width.  |
| `startAngle`          | `number`                  | `-90`          | Angle (deg) where arcs begin (`-90` = 12 o'clock).      |
| `gap`                 | `number`                  | `6`            | Pixel gap between rings.                                 |
| `ringWidth`           | `number`                  | auto           | Fixed stroke width; auto-derived when omitted.          |
| `rounded`             | `boolean`                 | `true`         | Round the arc line caps.                                |
| `allowOverflow`       | `boolean`                 | `false`        | Let values > `max` overrun as an overlapping extra lap. |
| `animate`             | `boolean`                 | `true`         | Animate value transitions.                              |
| `animationDurationMs` | `number`                  | `800`          | Tween duration.                                         |
| `clockwise`           | `boolean`                 | `true`         | Draw arcs clockwise.                                    |
| `maxSweepDegrees`     | `number`                  | `360`          | Total sweep; `270` gauge, `180` semicircle.             |
| `showLegend`          | `boolean`                 | `false`        | Render the built-in legend.                             |
| `percentDecimals`     | `number`                  | `0`            | Decimal places for legend percentages.                  |
| `showTooltip`         | `boolean`                 | `false`        | Show a hover tooltip per ring.                          |
| `onSegmentClick`      | `(datum, index) => void`  | —              | Click/keyboard activate a ring (makes rings focusable). |
| `onSegmentHover`      | `(datum, index) => void`  | —              | Fires on pointer enter/move over a ring.                |
| `onSegmentLeave`      | `(datum, index) => void`  | —              | Fires when the pointer leaves a ring.                   |
| `className`           | `string`                  | —              | Class applied to the outer container.                   |
| `children`            | `ReactNode`               | —              | Content rendered in the chart's center.                 |

Each `RadialDatum` is `{ value, max, color, label, trackColor?, pattern?, gradient?, threshold? }` where `pattern` is `"solid" | "dashed"`.

### Overflow (values past 100%)

Set `allowOverflow` so a value greater than its `max` overruns the ring as an overlapping extra lap (Apple-Watch style) instead of clamping at 100%:

```tsx
<RadialChart allowOverflow data={[{ value: 135, max: 100, color: "#fb2576", label: "Move" }]} />
```

### Goal markers (`threshold`)

Give a datum a `threshold` (in the same units as `value`) to draw a tick on its track marking a goal. Style it with the `--rc-marker-color` CSS variable:

```tsx
<RadialChart data={[{ value: 82, max: 100, color: "#fb2576", label: "Move", threshold: 90 }]} />
```

### Interactivity (`onSegmentClick` / `onSegmentHover`)

Provide `onSegmentClick` to make each ring clickable **and** keyboard-focusable (Tab to focus, Enter/Space to activate). `onSegmentHover` / `onSegmentLeave` report pointer enter/leave and are independent of the built-in tooltip:

```tsx
<RadialChart
  data={data}
  onSegmentClick={(datum, index) => console.log("clicked", index, datum.label)}
  onSegmentHover={(datum) => setActive(datum.label)}
/>
```

Focused rings show a `:focus-visible` outline you can theme with the `--rc-focus-color` CSS variable.

### Gradient rings

Give any datum a `gradient` to fill its progress arc with an SVG-native linear or radial gradient (it overrides `color`):

```tsx
const data = [
  {
    value: 82,
    max: 100,
    label: "Move",
    color: "#fb2576", // fallback if gradient is ignored
    gradient: {
      type: "linear", // "linear" | "radial"
      angle: 45,       // degrees, linear only (0 = left→right)
      stops: [
        { offset: 0, color: "#f472b6" },
        { offset: 1, color: "#8b5cf6" },
      ],
    },
  },
];
```

> Note: SVG paint supports `linear` and `radial` gradients natively. A true *conic* (angular) gradient is not part of the SVG spec, so it is intentionally not offered.

### Center content & count-up

Anything you pass as `children` is centered inside the rings. Use the `useCountUp` hook for an animated number:

```tsx
import { RadialChart, useCountUp } from "multi-layer-radial-chart";

function Ring({ percent }: { percent: number }) {
  const value = useCountUp(percent, { durationMs: 1200 });
  return (
    <RadialChart data={[{ value: percent, max: 100, color: "#6366f1", label: "Goal" }]}>
      <strong>{value}%</strong>
    </RadialChart>
  );
}
```

### Headless usage (`useRadialChart`)

Need full control over the markup? `useRadialChart` computes all the geometry (radii, stroke widths and ready-to-use SVG path strings) and renders nothing, so you can build your own SVG:

```tsx
import { useRadialChart } from "multi-layer-radial-chart";

function CustomRings({ data }: { data: RadialDatum[] }) {
  const { size, rings } = useRadialChart(data, { size: 240, gap: 6 });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      {rings.map((ring, i) => (
        <g key={i}>
          <path d={ring.trackPath} fill="none" stroke="#eee" strokeWidth={ring.strokeWidth} />
          <path
            d={ring.progressPath}
            fill="none"
            stroke={ring.datum.color}
            strokeWidth={ring.strokeWidth}
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
```

The library also exports the lower-level building blocks — `useAnimatedValue`, `useElementSize`, `useReducedMotion`, `describeArc`, `gradientVector`, `polarToCartesian`, `computeRingLayout`, `toFraction`, `toPercent` — for advanced compositions.

### Framework-agnostic core (`multi-layer-radial-chart/core`)

The math is fully decoupled from React. Import the `/core` subpath to get the pure geometry, scaling, layout, validation and color helpers with **zero React** in the dependency graph — use it from Vue, Svelte, Solid, vanilla JS, a `<canvas>` renderer, or on the server:

```ts
import { validateData, computeRingLayout, describeArc } from "multi-layer-radial-chart/core";

const data = [{ value: 82, max: 100, color: "#fb2576", label: "Move" }];
const rings = validateData(data);
const layout = computeRingLayout(rings.length, 240, 6);
const path = describeArc(120, 120, layout[0].radius, rings[0].fraction, -90, true);
// → feed `path` into any SVG/Canvas renderer
```

The `/core` entry exports `describeArc`, `describeArcSegment`, `polarToCartesian`, `gradientVector`, `markerLine`, `computeRingLayout`, `toFraction`, `toPercent`, `toRawFraction`, `validateData`, `normalizeDatum`, `contrastingColor`, `contrastShadow`, and all non-React types (`RadialDatum`, `NormalizedDatum`, `RingGradient`, `Point`, `RingLayout`, …).

## Accessibility

- The chart `<svg>` carries `role="img"` and a summary `aria-label` describing every ring.
- Each ring is a `role="progressbar"` with `aria-valuenow` / `aria-valuemin` / `aria-valuemax` and a `<title>` of `"{label}: {value}/{max} ({percent}%)"`.
- Color is never the only differentiator — the optional legend exposes labels/values, and `pattern: "dashed"` distinguishes rings without relying on color.
- Animation honors `prefers-reduced-motion` (via `useReducedMotion`) — rings snap instead of tweening.
- When `onSegmentClick` is set, rings become keyboard-focusable (Tab, then Enter/Space) with a themeable `:focus-visible` outline (`--rc-focus-color`).

## Project structure

```
src/
  core/          # pure math — geometry, scale, layout, constants (no React)
  utils/         # math, color (WCAG contrast), validation (no React)
  hooks/         # useAnimatedValue, useCountUp, useReducedMotion, useElementSize, useRadialChart
  components/    # RadialChart, RadialRing, RadialChartLabels, RadialTooltip
  types.ts       # public types
  index.ts       # main entry
  core.ts        # framework-agnostic /core entry
demo/            # Vite + Tailwind playground (the live demo)
src/stories/     # Storybook stories (the component explorer)
```

The `core/` + `utils/` math layer is shared **verbatim** with the React Native port ([`multi-layer-radial-chart-native`](https://www.npmjs.com/package/multi-layer-radial-chart-native)); only the hooks and components differ per platform.

## Development

```bash
# Clone the repository
git clone https://github.com/MosheHatab/multi-layer-radial-chart.git

# Install dependencies
npm install

# Run the demo playground
npm run dev

# Storybook
npm run storybook

# Verify everything
npm run typecheck && npm run lint && npm run test && npm run build && npm run size
```

> Optional: the repository includes the `ui-ux-pro-max` design skill under `.cursor/skills/` (used only for designing the demo). Its scripts require Python 3 (`python --version`; on Windows `winget install Python.Python.3.12`). It is not needed to build or use the library.

## Deployment

- **Demo → Vercel:** builds with `npm run build:demo` to `dist-demo/` (see `vercel.json`). Import the repo in Vercel once; it auto-deploys on push. Live at [multi-layer-radial-chart-five.vercel.app](https://multi-layer-radial-chart-five.vercel.app/).
- **Storybook → GitHub Pages:** the `Deploy Storybook` workflow publishes `storybook-static/` (enable Pages with source "GitHub Actions" once). Live at [moshehatab.github.io/multi-layer-radial-chart](https://moshehatab.github.io/multi-layer-radial-chart/).

## Publishing to npm

The package is versioned with [Changesets](https://github.com/changesets/changesets). Pick one of the two flows below — don't mix them.

**Automated (recommended):** commit a changeset and let CI do the rest.

```bash
npm run changeset   # describe the change; pick the semver bump
git commit -am "feat: ..." && git push
```

On push to `main`, the `Release` workflow opens a **"Version Packages"** PR. Merging that PR bumps the version, updates `CHANGELOG.md`, and publishes to npm (requires the `NPM_TOKEN` repository secret).

**Manual (from local):** build, validate, and publish in one step.

```bash
npm run version       # applies pending changesets + updates CHANGELOG.md (skip for first publish)
npm run publish:safe  # build → publint + are-the-types-wrong → npm publish
git commit -am "release" && git push   # commit the version bump / changelog
```

`publish:safe` is idempotent-friendly: `npm publish` refuses to overwrite an existing version, and CI's `changeset publish` skips versions already on npm — so pushing after a manual publish never double-publishes. Package exports/types can be validated anytime without publishing via `npm run check:package`.

## License

[MIT](./LICENSE) © 2026 Moshe Hatab
