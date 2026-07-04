# /radial-code-review

Run a focused code review of the current changes against this library's engineering rules. This is an advisory review only - it does not gate commits and installs no git hooks.

## How to run

1. Determine the diff scope: default to the branch changes vs the base branch; fall back to uncommitted changes if there is no base.
2. Read every changed file in full (not just the hunks) so context is not lost.
3. Evaluate each checklist item below. For every finding, report: severity (Blocking / Major / Minor), file:line, the rule it violates, and a concrete fix.
4. End with a short verdict: PASS (no Blocking/Major) or CHANGES REQUESTED, plus a one-line summary.

## Checklist

### Typing & API
- [ ] No `any` (explicit or implicit). Precise interfaces/types/generics; `readonly` where appropriate.
- [ ] Public types are exported from `src/types.ts` and re-exported by `src/index.ts`.

### Architecture / separation of concerns
- [ ] Math/trigonometry lives in `src/core/**` or `src/utils/math.ts` - none inline in components.
- [ ] Components are declarative; side effects are isolated in `src/hooks/**`.
- [ ] Container vs presentational split respected (`RadialChart` orchestrates; `RadialRing` is pure).

### React correctness
- [ ] Rules of Hooks respected - no hooks inside `.map()`/loops/conditionals/early returns.
- [ ] PascalCase components rendered as JSX, never called as functions.
- [ ] Effect dependency arrays are correct; no stale closures.

### Performance & cleanup
- [ ] Every `requestAnimationFrame` is cancelled on cleanup.
- [ ] Every `ResizeObserver` / `matchMedia` listener is disconnected/removed on cleanup.
- [ ] No unnecessary re-renders (memoization where it matters; stable callbacks/keys).

### Accessibility
- [ ] `<svg>` has `role="img"` + meaningful `aria-label`.
- [ ] Each ring has `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax` + `<title>`.
- [ ] Color is not the only indicator (legend labels/values and/or `pattern`).
- [ ] `prefers-reduced-motion` is honored.

### Robustness / edge cases
- [ ] Input validation handles empty data, `max <= 0`, negative values, `value > max`, NaN.
- [ ] Responsive path handles zero/unknown container size gracefully.
- [ ] SSR-safe: browser APIs guarded (`window`, `ResizeObserver`, `matchMedia`, `rAF`).

### Style / hygiene
- [ ] No magic numbers in logic (constants in `core/constants.ts`).
- [ ] Functions <= 250 lines, files <= 400 lines.
- [ ] Meaningful identifier names.
- [ ] `npm run lint`, `npm run typecheck`, and `npm run test` pass.
