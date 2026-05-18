# Capability delta: templates-perf

Applies to `openspec/specs/templates-perf/spec.md`. The leader merges
this delta into the long-lived spec after the change is APPROVED.

This delta is written for the **DROP-Beasties** branch of the decision
captured in this change's `design.md`. If the LCP measurement supports
RETAIN, the implementer rewrites this delta as a MODIFIED Requirement
that keeps the rule but removes the language tying it to the now-deleted
"layered CSS" model (the new strategy is single-layer Tailwind regardless
of whether Beasties stays).

## REMOVED Requirements

### Requirement: Beasties extracts critical CSS at build time

**Reason for removal.** The "Beasties extracts critical CSS at build
time" requirement was justified by the layered CSS strategy in
`templates-css-tokens` (above-the-fold = scoped `<style>` blocks) —
inlining the critical CSS for those `<style>` blocks was the whole point.
This change deletes that layered strategy: starter components now ship
their styling via Tailwind utilities that resolve tokens declared in
`global.css`. The Tailwind output produced by the v4 compiler is small
enough on the migrated starter that the LCP delta with vs. without
Beasties measured in this change's `design.md` is ≤ 50 ms — below the
budget tolerance.

The change removes Beasties from `packages/templates/starter/astro.config.mjs`
and `packages/templates/starter/package.json`. The same removal is
mirrored into `apps/site/`.

Future templates that demonstrate a meaningful LCP benefit from inlining
critical CSS MAY re-introduce Beasties (or its successor) — they would
add the requirement back via a new change, citing measurement.

## Invariants (audit table) — delta

Remove the I4 row from the long-lived spec's invariants table:

| Id     | Statement                                          | Audit                                          |
| ------ | -------------------------------------------------- | ---------------------------------------------- |
| ~~I4~~ | ~~Critical CSS inlined (Beasties output present)~~ | ~~`node scripts/perf/run.mjs --critical-css`~~ |

The `scripts/perf/run.mjs --critical-css` flag SHOULD remain accepted
by the runner as a deprecated no-op (print a one-line notice on stderr,
exit 0) so older change `design.md` files do not break their audit
invocations.

## Unchanged but explicitly reaffirmed

The remaining `templates-perf` requirements stay in force and are
critically important to this migration:

- **Lighthouse mobile scores** (Performance / Accessibility / Best
  Practices / SEO ≥ 95) and the LCP / INP / CLS / TBT / total-transfer
  budget table — the reviewer rejects the migration if any threshold
  regresses.
- **No new runtime deps without justification** — the migration
  removes a dep (Beasties) and adds none.

The reviewer runs `pnpm perf:budget` against the migrated starter and
compares against the day-1 baseline captured in
`openspec/progress/history.md`. The CSS transfer delta is expected to
land within ≤ +10 KB on `/` relative to the pre-migration baseline;
anything beyond that requires a written explanation in the run notes.

## Scenarios — delta

### Scenario: A future template wants to bring Beasties back

- **GIVEN** a contributor proposes adding Beasties (or any
  inline-critical-CSS integration) to a new template
- **WHEN** they open a change request
- **THEN** their `design.md` MUST include a measured LCP comparison
  (median-of-5 on the home page, mobile simulated 4G) showing a
  ≥ 100 ms LCP improvement attributable to the integration; otherwise
  the dep is rejected on the existing "No new runtime deps without
  justification" requirement.

(This scenario lives in this delta because removing the requirement
without adding any guidance about when to re-add it would invite a
future contributor to revive the integration on a hunch.)
