# Delta: templates-perf — docs-match-starter-perf-sitemap-config

This change brings the docs template to parity with the starter
template on a single build-config knob: `build.inlineStylesheets:
'always'`. The starter already ships this and records the FCP /
Speed Index rationale in its own config; the docs template did not,
and shipped Astro's `inlineStylesheets: 'auto'` default instead. The
delta below records the parity expectation so future templates
(and reviewers of future template-touching changes) treat
inline-stylesheets-always as a shipped default, not a starter-only
optimisation.

The delta does not loosen any existing threshold. I1, I2, I3, I4,
and I5 keep their current values; the perf budget for the docs
template is exactly the same as for starter.

## ADDED Requirements

### Requirement: Every shipped template sets `build.inlineStylesheets: 'always'`

Every template under `packages/templates/<kind>/` SHALL set
`build.inlineStylesheets: 'always'` in its `astro.config.mjs` (or
equivalent config entry-point). This forces Astro to inline every
first-party stylesheet into the emitted HTML, eliminating the
render-blocking `<link rel="stylesheet">` round-trip on first paint.

The trade-off (a few KB of CSS duplicated into every HTML page in
exchange for one fewer blocking request) is accepted as the
shipped default for content-light templates. Templates that legitimately
need the `'auto'` heuristic (e.g. a hypothetical asset-heavy template
where the per-route CSS bundle materially exceeds the per-page HTML
payload) MUST document the rationale in their `astro.config.mjs` as
an inline comment and in `docs/BENCHMARKS.md` (or the equivalent
template-level perf note).

#### Scenario: A template ships without the inline-stylesheets flag

- **GIVEN** a contributor adds a new template at
  `packages/templates/<kind>/` whose `astro.config.mjs` either omits
  `build.inlineStylesheets` or sets it to `'auto'`
- **WHEN** `pnpm audit:invariants --change <name>` runs (with
  `templates-perf` in the change's capabilities)
- **THEN** the audit fails unless the template's `astro.config.mjs`
  declares the `'auto'` exception with the documented rationale.

#### Scenario: The docs template after this change

- **GIVEN** the post-change tree
- **WHEN** `packages/templates/docs/astro.config.mjs` is read
- **THEN** the `build` block contains `inlineStylesheets: 'always'`
  (verbatim string literal `'always'`).

#### Scenario: `apps/docs/` mirror

- **GIVEN** the post-change tree
- **WHEN** `apps/docs/astro.config.mjs` is read
- **THEN** the `build` block contains `inlineStylesheets: 'always'`
  byte-equivalent to the template.

### Requirement: Built HTML for a template carries no first-party `<link rel="stylesheet">`

For any template that sets `build.inlineStylesheets: 'always'`,
every emitted `dist/**/*.html` file SHALL contain at least one
inline `<style>` block AND zero `<link rel="stylesheet"
href="/_astro/*.css">` tags for first-party bundles. Font preload
`<link>` hints (`<link rel="preload" as="font" …>`) are unaffected;
this requirement covers only the stylesheet-link form pointing at
first-party CSS chunks.

#### Scenario: Inspecting the docs build output

- **GIVEN** `pnpm --filter @astro-ignite/template-docs build` has run
- **WHEN** every `dist/**/*.html` file is inspected
- **THEN** each page contains at least one inline `<style>` block,
  and the regex `/<link[^>]+rel=["']stylesheet["'][^>]+href=["']\/_astro\//`
  matches zero times across the entire `dist/` output.

#### Scenario: Inspecting the apps/docs build output

- **GIVEN** `pnpm --filter @astro-ignite/docs build` has run
- **WHEN** every `dist/**/*.html` file is inspected
- **THEN** the same assertions hold as for the template build.

## MODIFIED Requirements

_None._ I1, I2, I3, I4, and I5 stand at their existing thresholds.
The new requirement above is strictly stricter than I4 (which
required Beasties-style critical-CSS inlining on the routes Beasties
processed); after this change every route is required to inline its
CSS.

## REMOVED Requirements

_None._

## Notes

- **Audit hook.** The per-template `inlineStylesheets` assertion is
  cheap to verify with a small grep in `scripts/audit/` (one regex
  per `astro.config.mjs` plus the documented-exception escape hatch).
  The implementer either adds the assertion as a new small audit
  script under `scripts/audit/` and registers it in
  `scripts/audit/run-all.mjs` for changes whose capabilities include
  `templates-perf`, or runs the assertion inline in this change's
  `runs/<ts>/audit.md` for the change-scoped verification. Either is
  acceptable provided `pnpm audit:invariants --change …` exercises
  it in CI.
- **Perf budget.** The harness rule `require_perf_budget_to_close_when`
  already mandates a perf run for changes that match `^templates-`.
  This delta records the expectation that `inlineStylesheets:
'always'` should be a no-op (or modest improvement) for total
  compressed transfer on `/`, and an outright improvement for FCP /
  Speed Index. The implementer captures the per-page report under
  `runs/<ts>/perf.txt`.
- **No new dep gate.** This change explicitly does not introduce a
  new runtime dep (scenario S7 in proposal.md). The `--deps` mode of
  `scripts/perf/run.mjs` confirms this.
