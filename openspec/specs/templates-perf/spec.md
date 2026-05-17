# Capability: templates-perf

## Purpose

Every shipped template hits Lighthouse mobile thresholds on a clean
build. The hard gate is CI-enforced. Beasties extracts critical CSS at
build time; the runtime stays under 150KB compressed for the home page.

## Boundary

Owned by: every `packages/templates/<kind>/` build output. Drift is
detected by `pnpm perf:budget`.

Touched by: anything in `packages/registry/`, `apps/site`, `apps/docs`
that ships JS/CSS to the browser.

## Requirements

### Requirement: Lighthouse mobile scores

A clean build of each template SHALL meet the budget below on Lighthouse
mobile (simulated 4G, Slow CPU 4x).

#### Scenario: CI runs on a template change
- **GIVEN** a PR touches `packages/templates/starter/**`
- **WHEN** `pnpm perf:budget` runs
- **THEN** the home page and one inner page both meet every threshold
 ; the job fails if any does not.

### Requirement: No new runtime deps without justification

A change that adds a runtime dependency to a template SHALL include a
written justification in `design.md` (under "Rejected alternatives" or a
dedicated "Why this dep" subsection). The reviewer rejects if the
justification is missing.

#### Scenario: Adding a date library
- **GIVEN** a contributor wants to add `date-fns`
- **WHEN** they open the PR
- **THEN** `design.md` explains why native `Intl.DateTimeFormat` won't
 do; otherwise the reviewer rejects.

### Requirement: Beasties extracts critical CSS at build time

The Astro build SHALL run Beasties (or the equivalent inline-critical-CSS
step) so the first paint doesn't block on a stylesheet round-trip.

#### Scenario: Inspecting build output
- **GIVEN** `pnpm build`
- **WHEN** the output is inspected
- **THEN** the HTML contains an inlined `<style>` block with above-the-fold
 CSS, and the stylesheet link is `media="print" onload="..."` or
 equivalent deferral.

## Budget (Lighthouse mobile, simulated 4G)

| Metric | Threshold |
|--------|-----------|
| Performance score | ≥ 95 |
| Accessibility score | ≥ 95 |
| Best Practices score | ≥ 95 |
| SEO score | ≥ 95 |
| LCP | ≤ 2.0 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0.05 |
| TBT | ≤ 200 ms |
| Total transfer (compressed, home page) | ≤ 150 KB |

> These are the **floor**, not the target. Templates are expected to
> ship at 100s wherever possible. The day-1 baseline is captured in
> `progress/history.md` under "perf baseline". Thresholds tighten as
> the baseline improves; loosening requires a documented incident.

## Invariants (audit table)

| Id | Statement | Audit |
|----|-----------|-------|
| I1 | Lighthouse budget met on home page | `node scripts/perf/run.mjs --page /` |
| I2 | Lighthouse budget met on one inner page | `node scripts/perf/run.mjs --page /blog` |
| I3 | Total transfer ≤ 150KB compressed (home) | `node scripts/perf/run.mjs --transfer` |
| I4 | Critical CSS inlined (Beasties output present) | `node scripts/perf/run.mjs --critical-css` |
| I5 | No undeclared runtime dep added since last archive | `node scripts/perf/run.mjs --deps` |
