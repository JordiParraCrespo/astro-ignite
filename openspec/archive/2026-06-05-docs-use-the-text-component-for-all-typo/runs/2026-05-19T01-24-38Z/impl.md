# Implementation Log — docs-use-the-text-component-for-all-typo

Run dir: `openspec/changes/docs-use-the-text-component-for-all-typo/runs/2026-05-19T01-24-38Z/`

## Summary

Mirrored the starter precedent (#33) onto the docs template and its
scaffolded copy in `apps/docs/`. Installed the `<Text>` atom into the
docs template (it did not previously have a `ui/` folder), then routed
every hand-rolled `<h1>`–`<h2>` / `<p>` body-copy surface in the docs
template's layouts (`DocsLayout`, `LegalLayout`), components
(`ComponentShowcase`, `SidebarNav`, `CookieBanner`), and the `apps/docs`
mirror plus the apps-only marketing pages (`pages/components/index`,
`pages/blocks/index`, `pages/design`, `pages/components/kbd`, plus
`[lang]/` parallels). Atom contract unchanged — every surface mapped to
an existing variant (T2c was a no-op). The docs template additionally
gained `src/lib/cn.ts` (the atom imports `@/lib/cn`; the design's "see
`packages/templates/docs/src/lib/cn.ts`" sentence assumed the file
existed when it did not, so design.md was amended in T1's commit to add
the NEW entry).

## Scenario → audit / verification traceability

| Scenario                                             | Evidence                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S1** — Text atom installed in docs template        | New file `packages/templates/docs/src/components/ui/text.astro`. `diff -u packages/registry/base/text.astro packages/templates/docs/src/components/ui/text.astro` → empty. Same for starter and apps mirrors.                                                                                                                                                                                                     |
| **S2** — Pages use `<Text>` or delegate-only layouts | Template pages: confirmed delegate-only via T1 inventory + final grep (zero `<h*>` / `<p>` in `packages/templates/docs/src/pages/`). Apps marketing pages refactored: `components/index.astro`, `blocks/index.astro`, `components/kbd.astro`, `design.astro`, `[lang]/` parallels.                                                                                                                                |
| **S3** — `<Text>` in visible-typography components   | `ComponentShowcase`, `SidebarNav`, `CookieBanner` refactored in both template + apps copies. Plus the apps-only `components/blocks/not-found-state.astro`.                                                                                                                                                                                                                                                        |
| **S4** — Layouts route header through `<Text>`       | `DocsLayout.astro` + `LegalLayout.astro` refactored in both template + apps copies. `<style is:global>.docs-prose` and `.legal-prose` blocks untouched.                                                                                                                                                                                                                                                           |
| **S5** — Atom lockstep extension                     | No extension required (T2c no-op). Registry, starter, docs template, and apps mirror are all byte-identical to the registry source.                                                                                                                                                                                                                                                                               |
| **S6** — No typography utility soup                  | T16 grep against `packages/templates/docs/src/` and `apps/docs/src/` returns **zero hits**.                                                                                                                                                                                                                                                                                                                       |
| **S7** — `tokens-only` (I1)                          | ❌ **2 pre-existing baseline** hits (`themeColor: '#fafafa'` in `packages/templates/docs/src/config/site.ts:68` and `themeColor: '#0a0a0a'` in `packages/templates/starter/src/config/site.ts:107`). Both predate this change (same as starter precedent — see `openspec/changes/starter-use-the-text-component-for-all-t/runs/2026-05-18T09-59-13Z/impl.md` open question 1). Zero new I1 violations introduced. |
| **S8** — `tokens-only --layered`                     | Same as S7 — re-runs I1; layered heuristic side has no opinion on docs template chrome (`Hero.astro` / `Header.astro` / `Nav.astro` don't exist in this template).                                                                                                                                                                                                                                                |
| **S9** — `no-react-in-atoms`                         | ✅ PASS — scanned 32 atom files; no framework imports, no default exports, registry deps + family layout intact.                                                                                                                                                                                                                                                                                                  |
| **S10** — `audit:invariants --change`                | Same 2 baseline hits (S7) + `no-react-in-atoms` PASS. Captured in `audit.md`.                                                                                                                                                                                                                                                                                                                                     |
| **S11** — Perf budget                                | Dep counts ✅ (template-docs 8, starter 12 — unchanged). Lighthouse skipped — no Chrome binary in sandbox (same environmental caveat as starter precedent's perf.md). Captured in `perf.md`.                                                                                                                                                                                                                      |
| **S12** — `apps/docs/` mirrors the template sweep    | Apps mirror enumerated in T1 inventory; every template surface plus apps-only `not-found-state.astro` + marketing pages.                                                                                                                                                                                                                                                                                          |
| **S13** — Boundary                                   | `git diff --name-only main -- ':!openspec' ':!.changeset'` lists 20 files, all under `packages/templates/docs/` or `apps/docs/`. Zero `apps/site/**`, zero `apps/playground/**`, zero other-template `src/**`.                                                                                                                                                                                                    |

## Invariant → audit traceability

| Invariant                                                   | Audit                                          | Status                                                                                        |
| ----------------------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `templates-css-tokens` I1 (no raw zinc / hex)               | `node scripts/audit/tokens-only.mjs`           | ❌ **2 pre-existing baseline hits** (`themeColor` hex in two `site.ts` files). Zero new hits. |
| `templates-css-tokens` I4 (above-the-fold scoped `<style>`) | `node scripts/audit/tokens-only.mjs --layered` | Re-runs I1 — same 2 baseline hits. Layered heuristic side passes.                             |
| `registry-atoms` I1 (no React/Vue/Svelte in `base/`)        | `… no-react-in-atoms.mjs`                      | ✅ PASS.                                                                                      |
| `registry-atoms` I2 (no default exports in atom `.ts`)      | `… --named-only`                               | ✅ PASS.                                                                                      |
| `registry-atoms` I3 (`cn` in `registryDependencies`)        | `… --registry`                                 | ✅ PASS.                                                                                      |
| `registry-atoms` I4 (compound families layout)              | `… --family-layout`                            | ✅ PASS — `text` is a single-file atom.                                                       |

## Open questions for the reviewer

1. **`themeColor` hex baseline.** Two pre-existing hex literals in
   `packages/templates/docs/src/config/site.ts:68` and
   `packages/templates/starter/src/config/site.ts:107` trip
   `tokens-only.mjs` I1. Same baseline as the starter precedent
   (which the reviewer accepted as out-of-scope at that round). They
   live in config files and are not in `## Files touched` for this
   change.

2. **Lighthouse step.** `pnpm perf:budget --change …` couldn't run
   Lighthouse (no Chrome binary). Same environment limitation as the
   starter precedent's perf.md. CI on the PR will run the real
   Lighthouse pass.

3. **Design amendment.** `design.md` was amended in T1's commit to add
   `NEW packages/templates/docs/src/lib/cn.ts` to § Files touched. The
   docs template did not previously ship a `cn` helper (no atoms under
   `src/components/ui/`); the new `text.astro` atom imports it. The
   amendment is documented in `runs/<ts>/inventory.md` §
   "Design-touched-but-missing infrastructure".

4. **`apps/docs/src/components/docs/SidebarNav.astro` collapsible
   summary surface.** The apps copy has a `<details>` variant that the
   template doesn't (collapsible nav groups). I applied
   `<Text variant="eyebrow" as="summary">` so the summary surface
   matches the non-collapsible `<h2>` surface. Reviewer-check: does
   `<Text as="summary">` reliably render `<summary>` semantics under
   the `<details>` element? The `defaultTag` for `eyebrow` is `p`, so
   we explicitly pass `as="summary"` — the atom's `Tag = as ??
defaultTag[variant]` path renders `<summary>`. No collapse regression
   in the apps/docs typecheck (123 files, 0 errors).

## Commits made (committer-logged)

1. `fb855f5` — `spec(docs-use-the-text-component-for-all-typo): T1 inventory + design amend for cn.ts infrastructure`
2. `d9b2bc1` — `feat(docs-template): install Text atom + cn helper (T2a, T2b, T2c no-op)`
3. `3c07aad` — `feat(docs-template): DocsLayout header through <Text> (T3)`
4. `931bc04` — `feat(docs-template): LegalLayout header through <Text> (T4)`
5. `ad3e0be` — `feat(docs-template): ComponentShowcase title+desc through <Text> (T5)`
6. `47ec3f7` — `feat(docs-template): SidebarNav group title through <Text eyebrow> (T6)`
7. `59f8d12` — `feat(docs-template): CookieBanner title+desc through <Text> (T7)`
8. `1a1aee8` — `feat(apps/docs): mirror layouts to <Text> (T9, T10)`
9. `6035937` — `feat(apps/docs): mirror ComponentShowcase + SidebarNav + CookieBanner to <Text> (T11, T12, T13)`
10. `b0aa8f2` — `feat(apps/docs): blocks block + marketing pages page-frame to <Text> (T14, T15)`
11. (final, pending) — verification ticks, audit.md/perf.md run logs, impl.md, changeset.

## Typecheck / test results

- `pnpm --filter @astro-ignite/template-docs typecheck` → Result (47 files): 0 errors, 0 warnings, 3 hints.
- `pnpm --filter @astro-ignite/docs typecheck` → Result (123 files): 0 errors, 0 warnings, 2 hints.
- `pnpm test` → `packages/astro-ignite`: 1 test file, 9 tests passed; no other workspace projects have tests.
