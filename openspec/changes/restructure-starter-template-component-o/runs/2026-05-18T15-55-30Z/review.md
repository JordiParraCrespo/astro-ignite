# Review — restructure-starter-template-component-o (run 2026-05-18T15-55-30Z)

Verdict: **CHANGES_REQUESTED**

## T1 — Tests

`pnpm typecheck`: ✅ green (apps/site, apps/docs, apps/playground,
packages/templates/starter, packages/templates/docs — 0 errors across
all packages; warnings only on pre-existing `ts(6196)` for unused
`Props` in dynamic-route pages, and `ts(6387)` for an
`@typescript-eslint` deprecation — both present on `main`).

`pnpm test`: ✅ green (`packages/astro-ignite` — 9/9 passed;
`packages/design-fetch` — no test files).

`pnpm format:check`: ✅ green (all matched files use Prettier code
style).

### Scenario coverage

- S1 — Final layout matches proposed structure
  → tree check: `packages/templates/starter/src/components/` immediate
  subdirs are `ui common blog projects about contact legal not-found
  image seo`; zero `*.astro` at root; no `sections/` or `blocks/`. ✅
- S2 — Every relocated file at its mapped path
  → confirmed via `git diff --name-only main..HEAD`: every old path
  deleted, every new path created per design.md migration map. ✅
- S3 — One 404 surface
  → `not-found/NotFoundHero.astro` is the only 404 composition; T12
  notes record the rationale; `blocks/not-found-state.astro` deleted. ✅
- S4 — Naming convention
  → `ui/` keeps kebab-case; all other moved files PascalCase. ✅
- S5 — Every page is thin
  → page bodies still wrap a layout + imports; no inline section/article
  /form/grid/style introduced. ✅
- S6 — Every old import rewritten
  → `grep` for old `@/components/{Nav,Footer,Brand,...}.astro` returns 0
  hits across the starter and mirror trees (the only matches outside the
  scope are `apps/site/src/components/landing/HeroSection.astro` which
  imports site-local `@/components/blocks/terminal/*` — site-specific
  and explicitly out of scope per design.md). ✅
- S7 — Registry blocks tier removed
  → `packages/registry/blocks/` deleted; `grep registry:block
  packages/registry/registry.json` returns 0. ✅
- S8 — Mirrors in sync
  → docs template + apps/site + apps/docs mirrors moved chrome to
  `common/` + `legal/`. `apps/playground/` is **not** mirrored
  (committer forbids `apps/playground/*` paths); the justification is
  "T33 regenerates it". See T20/T33 blocker below. ⚠️
- S9 — Consent boundary
  → `consent-gated-analytics --boundary` ✅ PASS;
  `consent-gated-analytics` ✅ PASS;
  `consent-gated-analytics --banner` ❌ PRE-EXISTING (reproduced on
  `main`); `consent-gated-analytics --policy` ❌ PRE-EXISTING. ✅
  (this change does not introduce any new violation).
- S10 — JSON-LD assembly → `jsonld-graph --strict --typed` ✅ PASS.
- S11 — i18n parallels → `i18n-parallels` (+ `--strict`, `--content`,
  `--config`) ✅ PASS; `internal-links-localized` ❌ PRE-EXISTING. ✅
- S12 — Layered CSS preserved → `tokens-only --layered` ❌
  PRE-EXISTING (`themeColor` hex literals in `config/site.ts` for both
  templates — reproduced on `main`). ✅ (Header/Hero scoped `<style>`
  blocks travel with the files; `aboveTheFold` lookup is by name and
  finds them under `common/`).
- S13 — No new runtime deps → `git diff main -- ...package.json`
  returns no output. ✅
- S14 — Typecheck + format + audits + scaffold → typecheck/format/test
  ✅; audits per S9-S12 above (no new failures introduced);
  `pnpm scaffold:test` ❌ (see blocker 1 below).
- S15 — Lighthouse budget → ❌ NOT RUN (no Chrome/Lighthouse binary
  available in the reviewer environment; deferred by implementer).
- S16 — Changeset → `.changeset/restructure-starter-components.md`
  present; documents the breaking restructure; bumps `astro-ignite` and
  `create-astro-ignite` minor. ✅

### Commits scoped to design.md

All implementer commits (`f747b8f`, `b3c3a08`, `13c2fdc`, `fc91362`,
`d9a7fc9`, `ecc6bb9`, `5e251f0`, `b6f3b68`, `32561a1`, `3f6264c`) touch
paths inside design.md's "Files touched" list. The pre-implementer
commits (`ec13de7` feature, `34ee8e0` spec, `ae7f106`/`c9dc862`
format passes, `1e1effe` approve, `93d4f89` spec amendment) are
harness-stage and outside the committer's design-gate.

No commit was made with `--no-verify` or other bypass.

## T2 — Invariant audits

`pnpm audit:invariants --change restructure-starter-template-component-o`:
❌ returns non-zero (5 failing audits, see `audit.md`).

Each failing audit was **reproduced on `main`** by the reviewer
(checked out `main`'s working tree contents and re-ran each audit
script — every failure recurs identically):

- `internal-links-localized` — `SidebarNav.astro:64 — <Brand href="/">`
  (docs template).
- `tokens-only` — `themeColor: '#fafafa'` / `'#0a0a0a'` in both
  templates' `config/site.ts`.
- `tokens-only --layered` — same hex literals (the layered split itself
  is preserved).
- `consent-gated-analytics --banner` — `ArticleLayout.astro: base
  layout does not render CookieBanner` (audit's
  `/Base|Layout|RootLayout/` regex picks `ArticleLayout`).
- `consent-gated-analytics --policy` — `CookieBanner present but no
  /legal/cookies(.astro|.mdx) page` (templates serve via dynamic
  `pages/legal/[...slug].astro`).

Per-invariant trace:

| Invariant                  | Audit                                                        | Result                                                                                  |
| -------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| templates-i18n I1-I4       | `i18n-parallels.mjs` (+ `--strict`, `--content`, `--config`) | ✅ PASS (×4)                                                                            |
| templates-i18n I5/I6       | `internal-links-localized.mjs`                               | ❌ PRE-EXISTING (SidebarNav)                                                            |
| templates-css-tokens I1    | `tokens-only.mjs`                                            | ❌ PRE-EXISTING (themeColor hex)                                                        |
| templates-css-tokens I4    | `tokens-only.mjs --layered`                                  | ❌ PRE-EXISTING (same hex; layered split preserved — Header/Hero `<style>` still scoped) |
| templates-seo-jsonld I1-I3 | `jsonld-graph.mjs --strict --typed`                          | ✅ PASS                                                                                 |
| templates-consent I1       | `consent-gated-analytics.mjs`                                | ✅ PASS                                                                                 |
| templates-consent I2       | `consent-gated-analytics.mjs --banner`                       | ❌ PRE-EXISTING (ArticleLayout false positive)                                          |
| templates-consent I3       | `consent-gated-analytics.mjs --policy`                       | ❌ PRE-EXISTING (dynamic cookie route)                                                  |
| templates-consent I4       | `consent-gated-analytics.mjs --boundary`                     | ✅ PASS                                                                                 |
| registry-blocks I1         | `no-react-in-atoms.mjs --include-blocks`                     | ✅ PASS (vacuous — 0 blocks)                                                            |

The audit script's exit non-zero is driven entirely by pre-existing
violations on `main`. No new audit failure is introduced by this
change. Strictly, however, the reviewer rule "Never approve with any
audit red" applies to the script's return code; the implementer should
not have closed out tasks T31/T32 as `[x]` while these audits are red.

## T3 — Perf budget

Applicable: **yes** — change's capabilities include `templates-*` and
`registry-*`. The harness rule `require_perf_budget_to_close_when`
applies.

`pnpm perf:budget` (full Lighthouse run): ❌ **NOT VERIFIABLE** in the
reviewer environment.

- `pnpm perf:budget --deps`: ✅ starter 12 / docs 8 runtime deps; no
  drift.
- `node scripts/perf/run.mjs --page /`: ❌ `lighthouse binary —
  lighthouse not installed`; no Chrome for Testing available; the run
  produced `runs/.../perf.md` with three FAIL rows for the missing
  binary (artifact removed during cleanup to avoid leaving stale
  output).

The implementer's `perf.txt` records that T34 was deferred and that
the change is structural (byte-for-byte file moves, no rendered HTML /
CSS / JS difference expected). That reasoning is defensible, but the
reviewer cannot positively confirm the budget passes from this
session.

## Tasks

- T1–T19 [x] ✅
- T20 [ ] — `apps/playground/` hand-mirror skipped (committer rejects
  `apps/playground/*`). Justification in `impl.md` + `notes.md`.
  ⚠️ Coupled to T33; see blocker 1.
- T21–T32 [x] ✅
- T33 [ ] — `pnpm scaffold:test`. Justification in `notes.md`
  ("deferred to reviewer / CI"). When the reviewer attempts to verify:
  the test passes spuriously against the stale CLI template cache
  under `packages/astro-ignite/templates/`, then **fails** the moment
  `prepack` (`packages/astro-ignite/scripts/copy-templates.mjs`)
  refreshes that cache — because `scripts/scaffold-test.mjs:81-86`
  hard-codes the OLD chrome paths in its EXPECTED list. See blocker 1.
- T34 [ ] — `pnpm perf:budget`. Justification in `notes.md`. Cannot
  be re-verified in this reviewer environment (no Lighthouse binary).
- T35 [x] ✅

## CHECKPOINTS

- C1 install — ✅ assumed (recursive `pnpm test` ran).
- C2 typecheck — ✅
- C3 test + scenario coverage — ✅
- C4 format:check — ✅
- C5 audit:invariants returns zero — ❌ returns non-zero (5 failures
  all reproduced on `main`).
- C6 `openspec validate <name>` — not exercised this run.
- C7 every task `[x]` or justified — partial (T20/T33/T34 justified;
  T33's justification is invalidated by the broken EXPECTED list — see
  blocker 1).
- C8 changeset entry — ✅
- C9 commits through `scripts/committer --design` — ✅ for every
  implementer commit (paths within design.md).
- C10 `pnpm doctor` — not exercised this run.
- C11 `pnpm perf:budget` passes — ❌ not verifiable (no Lighthouse
  binary).
- C12 `pnpm scaffold:test` green — ❌ green only against stale cache;
  fails against refreshed CLI templates (blocker 1).
- C13 `new-template` 15-item audit — not exercised this run.
- C14 site / docs mirror audit — ✅ (T18/T19 commits).
- C15 registry transitive resolution — ✅ (registry only had a single
  block which was removed; no transitive dep on it remains).
- C16 no React/Radix in blocks — ✅ (vacuous).
- C17 / C18 CLI dep-stripping — not exercised (CLI source unchanged).
- C19 capability spec deltas — ✅ deltas committed under
  `openspec/changes/<name>/specs/<capability>/spec.md`.
- C20 boundary symlinks — not exercised this run.
- C21–C23 close-out — not yet (this is the implementer→reviewer step).

## Commits scoped to design.md

All commits go through `scripts/committer`: ✅ (paths inside design.md
"Files touched"; no `--no-verify`).

Pre-implementer commits (`ec13de7`, `34ee8e0`, `ae7f106`, `c9dc862`,
`1e1effe`, `93d4f89`) are harness-stage (feature backlog add, spec
draft, format passes, approval, spec amendment) and outside the
committer's design-gate by harness convention.

## Changes requested

1. **`pnpm scaffold:test` is broken in a way that masks the
   restructure when the CLI is packed.** Two coupled issues:

   a. `scripts/scaffold-test.mjs:81-86` hard-codes the OLD chrome paths
   in its `EXPECTED_FILES` list:

   ```
   'src/components/Nav.astro',
   'src/components/Footer.astro',
   'src/components/CookieBanner.astro',
   'src/components/Analytics.astro',
   'src/components/ThemeToggle.astro',
   'src/components/Hero.astro',
   ```

   After the restructure these files no longer exist at those paths in
   `packages/templates/starter/src/components/`. `scaffold-test` only
   passes today because the CLI's bundled template cache at
   `packages/astro-ignite/templates/starter/` is **stale** (last
   refreshed 2026-05-17 20:08 via `prepack`). The moment that cache is
   refreshed (`node packages/astro-ignite/scripts/copy-templates.mjs`),
   `pnpm scaffold:test` fails:

   ```
   ✗ missing: src/components/Nav.astro
   ✗ missing: src/components/Footer.astro
   ✗ missing: src/components/CookieBanner.astro
   ✗ missing: src/components/Analytics.astro
   ✗ missing: src/components/ThemeToggle.astro
   ✗ missing: src/components/Hero.astro
   ```

   This means **end users who run `npm create astro-ignite` after this
   change is published will receive the OLD layout** (until the next
   real `pnpm pack` / `npm publish` rebuilds the CLI bundle), and
   `pnpm scaffold:test` will start failing in CI as soon as a fresh
   prepack happens.

   Fix:

   - Add `scripts/scaffold-test.mjs` to design.md's "Files touched"
     (amendment).
   - Update the `EXPECTED_FILES` list to the new paths
     (`src/components/common/Header.astro`,
     `src/components/common/Footer.astro`,
     `src/components/legal/CookieBanner.astro`,
     `src/components/common/Analytics.astro`,
     `src/components/common/ThemeToggle.astro`,
     `src/components/common/Hero.astro`, plus the per-feature
     additions if they were previously implicit).
   - Re-run `pnpm scaffold:test` and capture the green result.

2. **T20 / apps/playground hand-mirror is genuinely blocked by the
   committer rule.** The implementer notes this honestly. Two options
   for the next pass:

   - Amend design.md to allow `apps/playground/*` so the hand-mirror
     can land, OR
   - After fixing blocker 1, run `pnpm scaffold:test` post-prepack;
     `apps/playground/` is then byte-canonical and the committer
     forbiddance becomes moot (the playground regenerates from the
     restructured starter, not from manual edits).

   Either way, scenario **S8** ("Mirrors are kept in sync") for the
   playground tree depends on T33 actually running.

3. **`pnpm perf:budget` could not be re-verified** in the reviewer
   environment (no Lighthouse binary / Chrome for Testing installed).
   The implementer's structural-change argument is plausible — file
   moves are byte-for-byte content-preserving and Beasties / Tailwind
   scan emitted HTML, not source paths — but C11 ("`pnpm perf:budget`
   passes") requires a green run. Acceptable resolutions, in order of
   preference:

   - Implementer reruns `pnpm perf:budget` after fixing blocker 1 (so
     the playground reflects the new layout) and captures the report
     under `runs/<ts>/perf.txt`, OR
   - The leader allows the reviewer to delegate the run to CI and
     marks T34 with an external attestation.

4. **Audit invariants return non-zero.** Strictly, reviewer rule "Never
   approve with any audit red" applies even when failures predate the
   change. All 5 failing audits were reproduced on `main` (recorded
   above) and are unrelated to the restructure. If the harness's
   intent is "no _new_ audit failure," this would be APPROVED on that
   axis; the literal rule is failing. Recommend (out of scope for this
   change): file follow-up issues for the 4 pre-existing audit
   defects so the next change can run against a clean baseline.

## Summary

The restructure itself is correct and well-scoped: the starter tree
matches the proposed `ui / common / <feature>` layout, every old
import is rewritten, the docs template / apps/site / apps/docs
mirrors are aligned, the registry `blocks/` tier is cleanly removed,
the changeset documents the breaking move, typecheck and tests pass,
and no new audit regression is introduced. The blocker is operational:
`scripts/scaffold-test.mjs` was not updated, which means the CLI's
own e2e smoke and the eventual published package will continue to
ship the OLD chrome layout until a fresh prepack + EXPECTED update
lands. Fix blocker 1, re-run T33 with a refreshed CLI cache, then
T34, and this change is ready for approval.

CHANGES_REQUESTED -> openspec/changes/restructure-starter-template-component-o/runs/2026-05-18T15-55-30Z/review.md
