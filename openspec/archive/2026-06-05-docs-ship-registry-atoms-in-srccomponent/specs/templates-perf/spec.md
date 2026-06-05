# Delta: templates-perf — docs-ship-registry-atoms-in-srccomponent

This change ships 30 atom source files plus `lib/toast.ts` into the
docs template (`packages/templates/docs/`) and refreshes the CLI
template cache (`packages/astro-ignite/templates/docs/`). It does not
introduce any new runtime dependency, does not change the rendered
output of any docs-template page or layout, and does not modify the
build pipeline or the `<style>` budget.

Atoms not yet imported by any template-internal page or layout
contribute zero bytes to the build output — Astro's compiler
tree-shakes unused `.astro` files. The home-page transfer budget,
LCP, INP, CLS, and TBT are therefore expected to be unchanged from
baseline. The templates-perf audit table's invariants either remain
green by construction (I1, I2, I4) or are guarded explicitly by this
change's task list (I3 transfer budget, I5 deps check).

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

- **Why no spec delta?** The capability spec defines a Lighthouse
  mobile budget (≥ 95 on Performance / Accessibility / Best Practices
  / SEO; LCP / INP / CLS / TBT / total-transfer thresholds). This
  change ships only unused source files; the rendered output is
  byte-identical pre/post, so the budget table is neither tightened
  nor loosened. No new "Beasties extracts critical CSS" requirement
  is added — the existing one continues to apply unchanged.
- **Invariant status:**
  - **I1** (Lighthouse budget on home page) — preserved. Build output
    for `/` is byte-equivalent pre/post; the Lighthouse score derived
    from it is the same. T17 re-measures via `pnpm perf:budget`.
  - **I2** (Lighthouse budget on inner page) — preserved. Same
    reasoning as I1 for an inner page (e.g. `/quick-start` or
    `/introduction`). T17 re-measures.
  - **I3** (total transfer ≤ 150KB compressed, home) — preserved.
    Atoms with no importer contribute zero bytes to the home-page
    payload; the home-page transfer figure is the same.
  - **I4** (Beasties extracts critical CSS) — preserved. The build
    pipeline is unchanged; Beasties continues to inline critical CSS
    on the same surfaces.
  - **I5** (no undeclared runtime dep added since last archive) —
    preserved. No package is added to
    `packages/templates/docs/package.json` or
    `apps/docs/package.json`. The only imports the new atoms make are
    `@/lib/cn` and (for `toaster.astro`) `@/lib/toast`, both
    template-local owned files. T17's `pnpm perf:budget --change …`
    invocation runs the deps check.
- **Audits this change runs as guards (parseable by
  `scripts/audit/run-all.mjs --change`):**
  - `node scripts/perf/run.mjs --deps` — `templates-perf` I5.
  - `node scripts/perf/run.mjs --transfer` — `templates-perf` I3.
  - `pnpm perf:budget --change docs-ship-registry-atoms-in-srccomponent`
    — full Lighthouse measurement when Chrome is available; graceful
    skip otherwise per `wire-local-lighthouse-against-a-preview`.
    The two `--deps` and `--transfer` checks confirm the budget did not
    silently shift; the full perf-budget run is the authoritative
    measurement and is captured under `runs/<ts>/perf.md`.
- **Why this change is included under templates-perf at all.** The
  feature-list rule
  `require_perf_budget_to_close_when: change.capabilities matches
/^(templates|registry)-/` already triggers a perf-budget run from
  `registry-atoms` alone. Listing `templates-perf` explicitly in
  `capabilities` makes the I5 (no new deps) guarantee a first-class
  reviewer check rather than an emergent property of the registry-
  atoms audit, and it makes the "rendered output unchanged" property
  enumerated in the design's § Performance budget applicability
  reviewable against this delta's notes.
- **CLI template cache regeneration is not measured.** The cache at
  `packages/astro-ignite/templates/docs/` is a publish-time artefact
  consumed by `pnpm pack`; it is not a runtime payload that ships to
  a user's browser. Refreshing it has no effect on any Lighthouse
  metric.
