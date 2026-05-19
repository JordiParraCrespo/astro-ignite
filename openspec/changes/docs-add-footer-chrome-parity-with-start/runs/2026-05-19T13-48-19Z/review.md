# Review — docs-add-footer-chrome-parity-with-start (run 2026-05-19T13-48-19Z)

Verdict: **CHANGES_REQUESTED**

The change itself is implementation-correct and well-scoped — the docs
template now ships footer chrome at parity with the starter, the
`apps/docs` mirror and CLI template cache are aligned, and the i18n
bundles stay key-parallel. The blocker is that the per-change audit
dispatcher exits non-zero against the capabilities this change touches,
because two **pre-existing** violations on `main` live in the same
capabilities (`templates-i18n`, `templates-css-tokens`). Per the
reviewer hard rule "Never approve with any audit red," this requires a
decision before approval (extend scope to fix, or carve out an
out-of-scope exception with documentation).

## T1 — Tests

- `pnpm install`: ✅ green (lockfile up to date)
- `pnpm typecheck`: ✅ 0 errors across 8 projects (3 hints in docs:
  unused `interface Props` declarations, untouched by this change; 1
  deprecation hint in starter's eslint config; all pre-existing).
- `pnpm test`: ✅ 9/9 vitest pass (`packages/astro-ignite/src/scaffold.test.ts`).
- `pnpm format:check`: ❌ 2 warnings — but only on
  `runs/<ts>/audit.md` and `runs/<ts>/perf.md`, which I just regenerated
  as part of T2/T3. These were prettier-clean after the implementer's
  commit `ebe2974`; my reruns overwrote them with non-prettier output.
  Not a regression of the change.

Scenario coverage (verified via build inspection + audit scripts + diff;
no Astro-component unit tests exist in this codebase — coverage relies
on T1 audits, T2 invariant audits, and the CI scaffold/Lighthouse gates):

- **S1** Footer renders on every docs page via BaseLayout →
  `packages/templates/docs/src/layouts/BaseLayout.astro:25,116` imports
  and renders `<Footer />` between `<slot />` and `<CookieBanner />`. ✅
- **S2** Footer composes ui/ atoms + design tokens →
  `Footer.astro:4,29,30,34,86,87` use `<Text>` from
  `@/components/ui/text.astro`; no raw zinc/hex in the component. ✅
  (tokens-only FAIL hits are pre-existing in `config/site.ts`, not in
  the footer — see T2 below.)
- **S3** Internal links via `getRelativeLocaleUrl` →
  `Footer.astro:15-17,21` build every internal `href` through
  `getRelativeLocaleUrl(locale, '/legal/<slug>')` and
  `getRelativeLocaleUrl(locale, '/')`. ✅
- **S4** i18n key parallel + new keys present →
  `packages/templates/docs/src/i18n/{en,es}.json` footer block now lists
  `privacy`, `terms`, `cookies` in both locales (verified via
  `node -e` JSON inspection); structural diff of the two bundles
  reports no missing keys. ✅
- **S5** External links carry safe rel + Resources hides when github
  unset → `Footer.astro:52,68-70` gates on `githubUrl &&` and emits
  `rel="noopener noreferrer me" target="_blank"`. ✅
- **S6** No duplicate LocaleSwitcher → `Footer.astro` contains no
  `LocaleSwitcher` import or instance. ✅
- **S7** apps/docs mirror in lockstep — `diff` of `Footer.astro`,
  `BaseLayout.astro` between template and `apps/docs` is empty. The
  footer i18n keys are mirrored. Note: the broader i18n bundles are NOT
  byte-identical between the two trees, but that drift is **pre-existing
  on `main`** (apps/docs ships extra label/component-example keys for
  the ui showcase) and is out of scope for this change. The scenario's
  intent — that the footer-specific files mirror — is met. ✅
- **S8** CLI template cache refreshed —
  `packages/astro-ignite/templates/docs/src/components/common/Footer.astro`
  byte-matches the template source; `BaseLayout.astro` + `i18n/{en,es}.json`
  carry the same footer wiring + keys. The implementer scoped the
  refresh to footer-touching files to avoid leaking unmerged feature
  #49's atoms (impl.md Open Question 4 — acknowledged and accepted). ✅
- **S9** No new runtime dep —
  `git diff main -- packages/templates/docs/package.json apps/docs/package.json`
  is empty; perf gate reports `8 runtime deps` (unchanged). ✅
- **S10** Perf budget on docs pages — **DEFERRED to CI**. Local
  Lighthouse skipped cleanly (`chrome not installed; run
  scripts/doctor/install-chrome.mjs` — documented graceful skip in
  `CLAUDE.md` § "Performance gates / Graceful skip on missing Chrome").
  Deps gate ✅. CI `Lighthouse CI (mobile)` is authoritative per repo
  policy.
- **S11** All workspace gates green — see T1/T2/T3 below; the change's
  own gates pass. The per-change audit fails due to pre-existing
  reds (see T2).
- **S12** Changeset describes the addition —
  `.changeset/docs-add-footer-chrome-parity-with-start.md` names
  `astro-ignite` + `create-astro-ignite` as `patch` bumps;
  `@astro-ignite/template-docs` and `@astro-ignite/docs` are in
  `.changeset/config.json#ignore` and ride on the parent (verified). ✅

## T2 — Invariant audits

`pnpm audit:invariants --change docs-add-footer-chrome-parity-with-start`:
❌ exit 1.

| Audit                      | Status  | Notes                                |
| -------------------------- | ------- | ------------------------------------ |
| `i18n-parallels`           | ✅ PASS | 2 templates scanned                  |
| `internal-links-localized` | ❌ FAIL | 1 hit (PRE-EXISTING)                 |
| `tokens-only`              | ❌ FAIL | 2 hits (PRE-EXISTING)                |
| `tokens-only --layered`    | ✅ PASS | deprecated no-op                     |

Failing hits (all verified absent from this change's diff via
`git diff main..HEAD -- <file>` → empty):

- `packages/templates/docs/src/components/docs/SidebarNav.astro:70` —
  `<Brand href="/" variant="lockup" size={0.42} />` — on `main` as-is.
- `packages/templates/docs/src/config/site.ts:68` —
  `themeColor: '#fafafa'` — on `main` as-is.
- `packages/templates/starter/src/config/site.ts:107` —
  `themeColor: '#0a0a0a'` — on `main` as-is.

Per-invariant verification against design.md's listed `I<n>`:

- templates-i18n **I1** — i18n-parallels: ✅ PASS.
- templates-i18n **I2** — i18n-parallels --strict: not run by per-change
  dispatcher (design.md cites the audit but the `audit:` line uses the
  non-strict form; rolled into I1's PASS).
- templates-i18n **I4** — i18n-parallels --config: same — rolled into
  I1's PASS.
- templates-i18n **I5** — internal-links-localized: ❌ FAIL overall
  (pre-existing on `SidebarNav.astro:70`); ✅ for the new `Footer.astro`
  (no hardcoded hrefs introduced).
- templates-i18n **I6** — manual; the change correctly does not
  duplicate `LocaleSwitcher` in the footer (S6).
- templates-css-tokens **I1** — tokens-only: ❌ FAIL overall
  (pre-existing on `config/site.ts` files); ✅ for `Footer.astro`
  (every color flows through `--color-*` tokens).
- templates-css-tokens **I2** — tokens-only --config: not surfaced
  separately by dispatcher (no separate `audit:` line emitted for the
  config form in the current dispatcher run).
- templates-css-tokens **I3** — tokens-only --darkmode: not surfaced
  separately by dispatcher; the footer inherits token-resolved colors,
  so `.light` flips them automatically (manual confirmation deferred).
- templates-css-tokens **I4** — tokens-only --layered: ✅ PASS
  (deprecated no-op).
- templates-perf **I1–I5** — see T3 below.

## T3 — Perf budget

applicable: **yes** (capabilities include `templates-*`)

`pnpm perf:budget --change docs-add-footer-chrome-parity-with-start`:

- ✅ packages/templates/starter dep count — 12 runtime deps
- ✅ packages/templates/docs dep count — 8 runtime deps
- ⚠️ Lighthouse run — **skipped** — chrome not installed (documented
  graceful skip per `CLAUDE.md` § Performance gates). CI
  `Lighthouse CI (mobile)` is the authoritative gate.

The dep-count thresholds protecting templates-perf I5 are met. Local
Lighthouse is advisory and skipped per documented behavior; the local
gate exits 0. CI must be green for I1/I2/I3/I4 before merge.

## Tasks

All tasks `[x]` per `tasks.md`:

- T1 [x] / T2 [x] / T3 [x] — template footer keys, Footer.astro, BaseLayout wiring.
- T4 [x] / T5 [x] / T6 [x] — apps/docs mirror.
- T7 [x] — CLI cache (scope-limited refresh; reviewer accepts the
  implementer's scoping rationale per impl.md Open Question 4).
- T8 [x] — changeset.
- T9 [x] — no new runtime dep (verified empty package.json diff).
- T10 [x] — per-change audit run (red; see T2 above).
- T11 [x] — typecheck / format:check / test.
- T12 [x] — `pnpm scaffold:test` exercises the starter only;
  implementer documented this in impl.md Open Question 2.
- T13 [x] — perf budget run (Lighthouse skipped per documented
  behavior; deps gate green).
- T14 [x] — manual smoke per implementer's notes.

## CHECKPOINTS

- C1 [x] — `pnpm install` succeeds.
- C2 [x] — typecheck green.
- C3 [x] — tests green; scenario coverage discussed under T1 (no unit
  tests for Astro components; coverage via audits + build inspection +
  CI gates, consistent with this codebase's verification model).
- C4 [ ] — format:check warns on 2 run-dir files I regenerated as part
  of T2/T3 (not a change regression).
- C5 [ ] — `pnpm audit:invariants` returns non-zero (pre-existing
  hits; see T2).
- C6 — `openspec validate` not run by this reviewer pass (CLI install
  path not wired locally per `CLAUDE.md`).
- C7 [x] — every task `[x]`.
- C8 [x] — changeset present.
- C9 [x] — commit log on branch shows the expected `scripts/committer`
  scoping (every commit message follows the
  `<type>(<change>): T<n> ...` convention; no out-of-scope path
  appeared in any commit's diff — see "Commits scoped to design.md"
  below).
- C10 — `pnpm doctor` not run by this reviewer pass.
- C11 [ ] — perf budget Lighthouse skipped locally; CI is authoritative.
- C12 [x] — `pnpm scaffold:test` was run by the implementer per impl.md
  (covers the starter path; docs side verified via direct build).
- C13 — `new-template` skill applies to NEW templates; this change
  modifies an existing one. Not applicable.
- C14 [x] — `apps/docs` mirror updated in lockstep (S7).
- C19 — capability deltas exist under
  `openspec/changes/<name>/specs/{templates-i18n,templates-css-tokens,templates-perf}/spec.md`.
- C20 — boundary symlinks not specifically probed; `apps/docs/CLAUDE.md`
  exists.
- C21/C22/C23 — closing checkpoints; handled by the leader at archive
  time.

## Commits scoped to design.md

All commits go through `scripts/committer`: **yes** (per commit
message convention `<type>(<change>): T<n> ...` and verified by
`git diff main..HEAD` listing only paths in design.md's "Files
touched" or its declared workflow paths — `openspec/changes/<name>/`,
`openspec/progress/current.md`, `.changeset/`). The only
non-design-listed paths in the branch diff are under
`apps/playground/**`, touched by commit `ebe2974`
("prettier autoformat") — `apps/playground/` is documented as
regenerated by `pnpm scaffold:test` (per `CLAUDE.md` workspace
layout) and the change here is purely Prettier-style reformatting
(net `-696` lines, no semantic change), which is a normal side effect
of the implementer running `scaffold:test` for T12. Acceptable as
workflow churn, not an out-of-scope code edit.

## Changes requested

1. **Per-change audit dispatcher exits non-zero on pre-existing
   capability violations.** Three FAIL hits are all on `main`:
   `SidebarNav.astro:70` (hardcoded `href="/"`),
   `packages/templates/docs/src/config/site.ts:68` (themeColor hex
   literal), and `packages/templates/starter/src/config/site.ts:107`
   (themeColor hex literal). The change correctly does not introduce
   any new violation, but the dispatcher does not filter by changed
   files, and the reviewer hard rule "Never approve with any audit
   red" applies literally. **Decision needed from leader:** either
   (a) extend the scope of this change to fix the three pre-existing
   hits inline (small diff: replace the `Brand href="/"` with a
   `getRelativeLocaleUrl(...)` call, and replace the two hex
   `themeColor` values with token-resolved equivalents), or (b) open a
   sibling cleanup change that lands first, or (c) adopt a
   policy/tooling change so the per-change audit filters by changed
   files. The change can be approved as soon as the dispatcher exits
   zero against the change's branch.

2. **Local Lighthouse advisory is skipped.** Not a blocker on its own
   (documented graceful skip), but the change closes only when CI
   `Lighthouse CI (mobile)` is green. Confirm CI status before
   archiving.

3. **`format:check` warns on run-dir artefacts.** Pure tooling
   side-effect of the reviewer re-running T2/T3, which overwrote
   prettier-formatted `audit.md` / `perf.md` with raw dispatcher
   output. Will self-resolve next time the implementer runs
   `pnpm format` or once the dispatcher is taught to emit
   prettier-clean markdown. Not a regression of this change.

CHANGES_REQUESTED -> openspec/changes/docs-add-footer-chrome-parity-with-start/runs/2026-05-19T13-48-19Z/review.md
