# Impl — docs-ship-registry-atoms-in-srccomponent

## Summary

Shipped the 30-atom registry set + `lib/toast.ts` helper into
`packages/templates/docs/src/` so a fresh `npm create astro-ignite --
--template docs` now scaffolds the same pre-installed
`src/components/ui/` set that the starter already does. Every new file
is a byte-for-byte mirror of the matching `packages/registry/base/*` /
`packages/registry/lib/toast.ts` source — `diff -q` returns identical
across all 30 atoms and the lib helper, in both directions (registry ↔
docs-template and starter ↔ docs-template). `apps/docs/` was confirmed
already in parity (no edit needed). The CLI template cache at
`packages/astro-ignite/templates/docs/` was regenerated via
`node packages/astro-ignite/scripts/copy-templates.mjs`; the diff
includes the 30 atoms + `lib/toast.ts` + `lib/cn.ts` (unrelated drift
the proposal flagged) + ~20 unrelated drifted files (404 pages, common
components, i18n strings, layouts, etc.) that had accumulated since
the last cache regeneration. Verification ladder T11–T18 is green
modulo the documented baseline `tokens-only` failure (two pre-existing
`themeColor: '#…'` hex literals that predate this change and that
tasks.md / design.md explicitly call out as out-of-scope).

## Traceability

| Scenario                                                                       | Verification                                                                                                                                                                                                                                                                                    | Status                          |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| S1 — every starter atom has a byte-equivalent docs mirror                      | T11 `diff -q` loop, 31 files (30 atoms + `text.astro`), zero diffs against starter and against registry                                                                                                                                                                                         | PASS                            |
| S2 — `lib/toast.ts` is shipped alongside `toaster.astro`                       | T8 `diff -q packages/registry/lib/toast.ts packages/templates/docs/src/lib/toast.ts` (identical) + `pnpm --filter @astro-ignite/template-docs typecheck` after T2d+T8 (0 errors)                                                                                                                | PASS                            |
| S3 — compound families flatten per `registry.json`                             | T3–T7 `diff -q packages/registry/base/<family>/<file> packages/templates/docs/src/components/ui/<file>` for accordion/card/dialog/dropdown-menu/tabs (17 files, all identical)                                                                                                                  | PASS                            |
| S4 — no new runtime deps                                                       | `git diff main HEAD -- packages/templates/docs/package.json apps/docs/package.json` empty (perf:budget --deps shows 12 starter / 8 docs runtime deps unchanged)                                                                                                                                 | PASS                            |
| S5 — apps/docs already mirrors the new docs-template set                       | T9 `diff -q` loop returns 0 diffs across 31 atoms + `lib/toast.ts`; no apps/docs file staged                                                                                                                                                                                                    | PASS                            |
| S6 — no typography / framework / token regressions                             | T12 `no-react-in-atoms` PASS (32 files scanned), `--named-only --registry --family-layout` PASS; T13 `tokens-only` only surfaces the two pre-existing baseline hex literals (documented exception)                                                                                              | PASS                            |
| S7 — `registry.json` unchanged                                                 | T18 `git diff --name-only main HEAD` has zero entries under `packages/registry/`                                                                                                                                                                                                                | PASS                            |
| S8 — CLI template cache is refreshed                                           | T10 ran `node packages/astro-ignite/scripts/copy-templates.mjs`; `diff -rq packages/templates/docs/ packages/astro-ignite/templates/docs/ --exclude=node_modules --exclude=dist --exclude=.astro` reports only the documented `_gitignore` ↔ `.gitignore` rename                                | PASS                            |
| S9 — scaffolded docs-template build remains green                              | T15 `pnpm --filter @astro-ignite/template-docs typecheck` (0 errors, 81 files), `pnpm --filter @astro-ignite/template-docs build` (success), `pnpm --filter @astro-ignite/docs typecheck` (0 errors, 126 files), `pnpm --filter @astro-ignite/docs build` (success)                             | PASS                            |
| S10 — Lighthouse budget not regressed                                          | T17 `pnpm perf:budget --change docs-ship-registry-atoms-in-srccomponent` exits 0 with documented `skipped — chrome not installed` caveat per `wire-local-lighthouse-against-a-preview`                                                                                                          | PASS (skipped)                  |
| S11 — whole audit suite is green for this change                               | T14 `pnpm audit:invariants --change …` runs 3 audits, 2 PASS, 1 FAIL with documented pre-existing baseline exception (two `themeColor` hex literals first present in `f02e323` initial commit)                                                                                                  | PASS (with documented baseline) |
| S12 — `pnpm scaffold:test` passes                                              | T17 `pnpm scaffold:test` succeeds (52 expected files present, 2 excluded, package.json rewrite + site.ts substitutions applied); playground atoms byte-equal to docs-template (loop returns 0 diffs)                                                                                            | PASS                            |
| S13 — boundary: only docs template, apps/docs (if aligning), CLI cache touched | T18 `git diff --name-only main HEAD -- ':!openspec' ':!.changeset'` returns 83 files, all under `packages/templates/docs/src/{components/ui,lib}/` or `packages/astro-ignite/templates/docs/`; zero under apps/site, apps/playground (committed), packages/templates/starter, packages/registry | PASS                            |

| Invariant                                                         | Audit command                                                                           | Status                                                                                                                                                              |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| registry-atoms I1 — no React/Vue/Svelte/Radix in `base/`          | `node scripts/audit/no-react-in-atoms.mjs`                                              | PASS (32 files scanned, 0 hits)                                                                                                                                     |
| registry-atoms I2 — no default exports in atom source             | `node scripts/audit/no-react-in-atoms.mjs --named-only`                                 | PASS (32 files scanned, 0 hits)                                                                                                                                     |
| registry-atoms I3 — every atom in `registry.json` depends on `cn` | `node scripts/audit/no-react-in-atoms.mjs --registry`                                   | PASS (audit walks `registry.json`, unchanged)                                                                                                                       |
| registry-atoms I4 — compound families live in `base/<family>/`    | `node scripts/audit/no-react-in-atoms.mjs --family-layout`                              | PASS (audit walks `packages/registry/base/`, unchanged)                                                                                                             |
| templates-perf I3 — total transfer ≤ 150KB compressed (home)      | `node scripts/perf/run.mjs` (Lighthouse skipped — Chrome not installed; deps gate PASS) | PASS (skip per wire-local-lighthouse-against-a-preview)                                                                                                             |
| templates-perf I5 — no undeclared runtime dep added               | `node scripts/perf/run.mjs --deps`                                                      | PASS (12 starter / 8 docs runtime deps, unchanged from `main`)                                                                                                      |
| templates-css-tokens I1 — no raw hex / `bg-zinc-*` in components  | `node scripts/audit/tokens-only.mjs`                                                    | PASS for atoms (0 new hits); FAIL for 2 pre-existing baseline `themeColor: '#…'` literals in `site.ts` files (initial commit `f02e323`, documented as out-of-scope) |

## Commits made

| SHA     | Message                                                                                    |
| ------- | ------------------------------------------------------------------------------------------ |
| 35c9012 | chore(docs-ship-registry-atoms-in-srccomponent): T1 inventory                              |
| 409039c | feat(docs-ship-registry-atoms-in-srccomponent): T2a copy alert/avatar/badge/button         |
| 83eec47 | feat(docs-ship-registry-atoms-in-srccomponent): T2b copy input/kbd/label/link/separator    |
| 9e30b48 | feat(docs-ship-registry-atoms-in-srccomponent): T2c copy skeleton/textarea/tooltip         |
| 764f2e2 | feat(docs-ship-registry-atoms-in-srccomponent): T2d+T8 copy toaster.astro and lib/toast.ts |
| a81a801 | feat(docs-ship-registry-atoms-in-srccomponent): T3 copy accordion family                   |
| 459bd77 | feat(docs-ship-registry-atoms-in-srccomponent): T4 copy card family                        |
| 5b3f96b | feat(docs-ship-registry-atoms-in-srccomponent): T5 copy dialog family                      |
| fd20765 | feat(docs-ship-registry-atoms-in-srccomponent): T6 copy dropdown-menu family               |
| 0b60bab | feat(docs-ship-registry-atoms-in-srccomponent): T7 copy tabs family                        |
| fbe33e2 | feat(docs-ship-registry-atoms-in-srccomponent): T10 refresh CLI template cache (docs/)     |

(Plus a final close-out commit landing this `impl.md`, the audit /
perf artifacts, the changeset, and the closed-out `tasks.md`.)

## CLI cache drift picked up by T10

The cache-refresh commit (`fbe33e2`) includes the following unrelated
drift the cache had accumulated since its last regeneration. Every
entry is the cache catching up with the corresponding source under
`packages/templates/docs/`, not a new edit:

- `astro.config.mjs` — drift sync
- `src/i18n/en.json`, `src/i18n/es.json` — drift sync
- `src/layouts/DocsLayout.astro`, `src/layouts/LegalLayout.astro` —
  drift sync
- `src/components/common/{Brand,LocaleSwitcher,ThemeToggle}.astro` —
  drift sync
- `src/components/docs/{Breadcrumbs,CodeBlock,ComponentShowcase,OnThisPage,PrevNext,SearchBox,SidebarNav}.astro`
  — drift sync
- `src/components/legal/CookieBanner.astro` — drift sync
- `src/components/not-found/NotFoundHero.astro` — drift sync
- `src/pages/404.astro`, `src/pages/[lang]/404.astro` — drift sync (new
  files the cache was missing entirely)
- `src/lib/cn.ts` — drift sync (predicted by the proposal — landed in
  the docs template with PR #40 but never copied into the cache)
- `src/lib/toast.ts` + `src/components/ui/*.astro` (30 files) — the
  actual scope of this change

## Open questions for the reviewer

None. The atoms are byte-mirrors of the registry source; the
boundary, audit, and perf evidence are all captured above.

## Environmental caveats

- `pnpm perf:budget` Lighthouse branch is `skipped — chrome not
installed` per the `wire-local-lighthouse-against-a-preview` (PR #48)
  graceful-skip path. CI Lighthouse remains the authoritative gate.
- `tokens-only` audit reports two pre-existing baseline hits
  (`themeColor: '#fafafa'` in `packages/templates/docs/src/config/site.ts`,
  `themeColor: '#0a0a0a'` in `packages/templates/starter/src/config/site.ts`)
  that first appear in the initial commit `f02e323` and that tasks.md
  T13 / design.md § Invariants both explicitly mark as out-of-scope
  for this change.
