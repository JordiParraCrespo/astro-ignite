# Delta: templates-perf — restructure-starter-template-component-o

This change is a path-level restructure: filename and directory
moves, plus one rename (`Nav.astro` → `Header.astro`). It introduces
no new runtime dependencies, no new JavaScript, and no new CSS. The
rendered DOM trees under `<BaseLayout>` are byte-for-byte equivalent
across the move; Astro compilation, Tailwind utility scanning, and
Beasties critical-CSS extraction all see the same input.

The performance budget therefore stays exactly where it was. This
delta does not loosen any threshold; it formalises the
non-regression requirement so the implementer's perf run captures the
new baseline at the new file paths.

## ADDED Requirements

### Requirement: Path-only restructures do not regress the perf budget

A change whose `design.md` describes only file moves / renames /
deletes (no new components, no new dependencies, no new client
scripts) SHALL produce a perf run whose Lighthouse mobile scores
(Performance / Accessibility / Best Practices / SEO) and Core Web
Vitals (LCP / INP / CLS / TBT) match or improve on the previous
recorded baseline for the affected template.

The implementer captures the run output under
`openspec/changes/<change-name>/runs/<ts>/perf.txt`. The reviewer
compares against the previous baseline in
`openspec/progress/history.md` ("perf baseline" entries) or the most
recent template-touching change's perf report.

#### Scenario: This change's perf run

- **GIVEN** the post-restructure tree
- **WHEN** `pnpm perf:budget` runs against the starter
- **THEN** Performance, Accessibility, Best Practices, and SEO are
  each ≥ 95 on `/`, `/blog`, `/projects`, `/about`, `/contact`; LCP,
  INP, CLS, TBT, and total compressed transfer on `/` stay inside
  the existing budget — i.e. ≤ 2.0 s LCP, ≤ 200 ms INP, ≤ 0.05 CLS,
  ≤ 200 ms TBT, ≤ 150 KB total transfer.

#### Scenario: A future path-only restructure regresses LCP

- **GIVEN** a future contributor moves the LCP candidate into a
  different folder (and the rename accidentally pulls in an extra
  script via `index.astro`-style auto-routing)
- **WHEN** the perf run executes
- **THEN** the LCP regression flips the check red and the change is
  rejected until the underlying regression is fixed (the structural
  move is not the cause — an introduced runtime concern is).

## MODIFIED Requirements

_None._ I1, I2, I3, I4, and I5 stand at their existing thresholds.

## REMOVED Requirements

_None._

## Notes

- **Why this delta at all.** The harness rule
  `require_perf_budget_to_close_when` already mandates a perf run
  for changes that match `^templates-`. This delta records the
  expectation that **structural restructures should be a no-op for
  perf** so the reviewer has explicit grounds to reject any
  regression that creeps in via a hidden runtime addition. The
  capability spec stays minimal; this delta does not add a new
  audit script.
- **Audit / verification.** `pnpm perf:budget` runs
  `scripts/perf/run.mjs` against `/`, `/blog`, plus
  `--transfer`/`--critical-css`/`--deps`. The implementer captures
  the per-page report under `runs/<ts>/perf.txt`. The reviewer's
  `pnpm audit:invariants --change …` already dispatches perf for
  templates-touching changes.
- **No new dep gate.** This change explicitly does not introduce a
  new runtime dep (scenario S13 in proposal.md). The
  `--deps` mode of `scripts/perf/run.mjs` confirms this.
