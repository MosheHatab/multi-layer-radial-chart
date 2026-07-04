# Multi-Layer Radial Chart

Animated, Apple-Watch-style activity rings for React — rendered with pure SVG, zero chart dependencies.

<!-- Add a GIF/screenshot of the demo here once deployed, e.g. ./docs/demo.gif -->

### [Live Demo](https://multi-layer-radial-chart.vercel.app) · [Component Explorer (Storybook)](https://mosehatab.github.io/multi-layer-radial-chart/)

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
| `animate`             | `boolean`                 | `true`         | Animate value transitions.                              |
| `animationDurationMs` | `number`                  | `800`          | Tween duration.                                         |
| `clockwise`           | `boolean`                 | `true`         | Draw arcs clockwise.                                    |
| `maxSweepDegrees`     | `number`                  | `360`          | Total sweep; `270` gauge, `180` semicircle.             |
| `showLegend`          | `boolean`                 | `false`        | Render the built-in legend.                             |
| `showTooltip`         | `boolean`                 | `false`        | Show a hover tooltip per ring.                          |
| `className`           | `string`                  | —              | Class applied to the outer container.                   |
| `children`            | `ReactNode`               | —              | Content rendered in the chart's center.                 |

Each `RadialDatum` is `{ value, max, color, label, trackColor?, pattern? }` where `pattern` is `"solid" | "dashed"`.

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

- **Demo → Vercel:** builds with `npm run build:demo` to `dist-demo/` (see `vercel.json`). Import the repo in Vercel once; it auto-deploys on push.
- **Storybook → GitHub Pages:** the `Deploy Storybook` workflow publishes `storybook-static/` (enable Pages with source "GitHub Actions" once).

## License

[MIT](./LICENSE) © 2026 Moshe Hatab
