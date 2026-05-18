# BLOCKED — migrate-starter-template-to-tailwind-css

Blocked at: 2026-05-18T23:00Z
Run dir: openspec/changes/migrate-starter-template-to-tailwind-css/runs/2026-05-18T22-59-42Z/

## Why this is blocked

The design mandates a measured Beasties LCP comparison (the A/B/C table
in `design.md` under "Beasties decision") before the change can be
opened for review. Tasks T6, T11, T20 in `tasks.md` require running
`pnpm perf:budget` to capture LCP / CLS / total-transfer figures with
and without Beasties on the migrated build.

The harness in this environment **cannot run Lighthouse**:

1. **No Chrome on PATH.** `which google-chrome / chrome / chromium`
   all return empty. The `scripts/doctor/chrome-installed.mjs` check
   emits the same warning.
2. **Lighthouse cannot be fetched.** `npx --no-install lighthouse
--version` fails because lighthouse is not installed locally, and
   the fallback `npx lighthouse` attempts a network install which
   fails with `EROFS: read-only file system` against `/home/dev/.npm/_cacache/`.
3. **`scripts/perf/run.mjs` is a deliberate placeholder.** The script
   itself emits `Lighthouse run — not yet wired to a preview server
target; see AGENTS.md step 6` and `Total transfer — not yet wired;
run after Lighthouse integration lands`. Even on a host with Chrome,
   the script does not actually run a Lighthouse audit; it only checks
   for the binary's presence and then exits with a "not yet wired"
   finding.

That means the Beasties decision the design requires me to record
**cannot be made from measurement** in this run. Without that decision
I cannot:

- Choose the DROP vs RETAIN branch of the spec deltas under
  `openspec/changes/migrate-starter-template-to-tailwind-css/specs/templates-perf/`.
- Decide whether to remove `astro-beasties` from
  `packages/templates/starter/astro.config.mjs` and `package.json`
  (and the `apps/site` mirror).
- Fill in the A/B/C measurement table in `design.md`.
- Pass T20 ("Final invariant + perf + e2e sweep — `pnpm perf:budget`
  must exit 0").

The implementer protocol forbids inventing design decisions
("Never improvise. Stop, write BLOCKED.md."), and the spec-driven flow
requires the design to reflect what was actually measured. Choosing
DROP or RETAIN without evidence would directly violate both rules.

## Secondary concerns

These are not blockers on their own, but combined with the perf
blocker they reinforce that this change should not proceed in this
environment:

- **Scope.** The migration touches 17 starter `.astro` files, 27
  `apps/site` files, `global.css`, `astro.config.mjs`, `package.json`,
  `scripts/audit/tokens-only.mjs`, two spec deltas, four documentation
  files, the CLI template cache, and a changeset. T7 requires
  before/after screenshots per component family; T19 requires
  `pnpm scaffold:test --full`. Even a clean mechanical migration is
  many hours of work, and several phases (visual diff, screenshots,
  e2e theme-toggle Playwright run) need a working browser.
- **e2e gate.** T20 requires `pnpm test:e2e --project=starter`. With
  no Chrome / Chromium on PATH the Playwright `chromium` project will
  fail at browser launch.
- **Audit dispatcher emits an empty table.** `pnpm audit:invariants
--change migrate-starter-template-to-tailwind-css` runs but produces
  zero rows in `audit.md`. The design's "Invariants this change touches"
  table doesn't appear to be matched by the parser in
  `scripts/audit/run-all.mjs`. This needs investigation before the
  invariant gate is meaningful for this change. (Not a direct blocker
  on the migration itself, but means we'd ship without a meaningful
  audit gate.)

## Questions for the human

1. **Should we wire the perf harness first?** The cleanest path is a
   precursor change that installs Chrome for Testing in the dev image,
   replaces the `scripts/perf/run.mjs` placeholder with a real
   Lighthouse run against a started preview server, and proves the
   budget gate works. Once that lands, the Beasties measurement
   table in this change's `design.md` can be filled in honestly.
2. **Or pre-decide DROP/RETAIN by policy?** If the project wants to
   move forward without a measurement, amend `design.md` to remove
   the A/B/C table and explicitly justify the decision on
   non-measurement grounds (e.g., "DROP — Tailwind v4 inlines the
   critical path; we accept the risk and will revisit on the next
   Lighthouse audit"). Then I can complete the rest of the migration.
3. **Or split the change?** Land the audit-script change
   (`--layered` → deprecated no-op) and the spec deltas first
   (templates-css-tokens drops the layered requirement; templates-perf
   keeps Beasties unchanged for now), then tackle the component
   migration in a follow-up once perf measurement is wired.

I have not modified any code under `packages/templates/`, `apps/site/`,
`scripts/`, or the spec deltas. The only file changes during this run
are `openspec/progress/current.md` (set the active feature) and this
BLOCKED.md.
