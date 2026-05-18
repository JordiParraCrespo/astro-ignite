# Review — starter-use-the-text-component-for-all-t (run 2026-05-18T09-59-13Z)

Verdict: **CHANGES_REQUESTED**

## T1 — Tests

- `pnpm typecheck`: ✅ green across every workspace package (apps/site 87
  files, apps/docs 123 files, apps/playground 90 files, packages/templates/starter
  91 files, packages/templates/docs 45 files — 0 errors total).
- `pnpm test`: ✅ green — `packages/astro-ignite/src/scaffold.test.ts` 9
  tests pass; `packages/design-fetch` has no tests.

### Scenario → evidence map (re-derived)

Scenarios in this change's proposal are not unit-test backed; they are
satisfied by static greps and audit scripts (the design explicitly
rejects a new long-lived audit, leaning on the reviewer's visual sweep
and the existing audit suite — see § "Rejected alternative" in
`design.md`). Mapping each scenario to its evidence:

- **S1** (pages use `<Text>`) → ✅ T12 grep clean across
  `packages/templates/starter/src/pages/` (verified, see T-S4 below).
- **S2** (components use `<Text>`, allow-list respected) → ✅ visual
  inspection of `Footer.astro` and `blocks/not-found-state.astro`;
  allow-list (Hero/Nav/CookieBanner/chrome/atoms) untouched per
  `git diff --name-only main`.
- **S3** (layouts use `<Text>`) → ✅ `ArticleLayout.astro`,
  `ProjectLayout.astro`, `LegalLayout.astro` all in the diff;
  `BaseLayout.astro` (chrome-only) untouched.
- **S4** (no typography utility soup) → ✅ re-ran T12 grep:
  `grep -REn '<(h[1-6]|p)\b[^>]*class="[^"]*\\b(text-\[|text-(lg|sm|xs|base|2xl|3xl|4xl|5xl|6xl)|leading-|font-(medium|semibold|bold|normal)|tracking-)[^"]*"' packages/templates/starter/src/`
  returned no matches.
- **S5** (atom lockstep, vacuous) → ✅ `git diff main --
  packages/registry/base/text.astro packages/templates/starter/src/components/ui/text.astro`
  is empty.
- **S6** (`tokens-only` PASS) → ❌ **audit red**, 2 hits — see T2.
- **S7** (`tokens-only --layered` PASS) → ❌ same audit red — see T2.
- **S8** (`no-react-in-atoms --named-only --registry --family-layout`)
  → ✅ PASS, 32 files.
- **S9** (full audit suite green) → ❌ audit suite red (S6/S7).
- **S10** (scaffold smoke + perf budget) → ❌ Lighthouse skipped (no
  Chrome binary in this sandbox) — see T3.
- **S11** (boundary: only starter + registry text atom touched) → ❌
  *partial* — 15 starter files are correctly the only application
  changes, but `tests/e2e/playwright-report/index.html` (71-line
  Playwright HTML artifact, **new file**) was added in the prettier
  autoformat commit `e7f71f5` and is **not** in `design.md`'s "Files
  touched" list. See "Out-of-scope file" below.

## T2 — Invariant audits

`pnpm audit:invariants --change starter-use-the-text-component-for-all-t`
→ ❌ **non-zero exit**.

```
❌ tokens-only FAIL — 2 violation(s)
 packages/templates/docs/src/config/site.ts:68   — themeColor: '#fafafa',
 packages/templates/starter/src/config/site.ts:107 — themeColor: '#0a0a0a',
❌ tokens-only FAIL — 2 violation(s) (same hits via --layered re-run)
✅ no-react-in-atoms PASS — scanned 32 file(s)
```

Per-`I<n>` status from `design.md`:

- `templates-css-tokens` **I1** — design claims "preserved (no new
  hits)". Verified: both hex literals trace to the initial commit
  `f02e323` (2026-05-10), predate this feature, and live in `site.ts`
  files not listed in § "Files touched". However, the audit is red
  on `main`-state code that this feature did not introduce, so the
  audit gate is not green. The change does not amend `design.md` to
  acknowledge the baseline.
- `templates-css-tokens` **I4** — re-runs I1; same baseline failure.
  Layered-CSS heuristic itself passes (`Hero.astro`/`Nav.astro` still
  carry `<style>` blocks).
- `registry-atoms` **I1/I2/I3/I4** — ✅ all green (covered by
  no-react-in-atoms — 32 files scanned, no React/Vue/Svelte imports,
  no default exports in atom sources, registry deps intact, `text`
  remains a single-file atom).

Audit report regenerated at `audit.md` (this run).

## T3 — Perf budget

Applicable: **yes** (capabilities `templates-css-tokens` and
`registry-atoms` both match `/^(templates|registry)-/`).

`pnpm perf:budget --change starter-use-the-text-component-for-all-t`
→ ❌ **non-zero exit**.

```
✅ packages/templates/starter dep count — 12 runtime deps
✅ packages/templates/docs dep count — 8 runtime deps
❌ lighthouse binary — lighthouse not installed
❌ Lighthouse budget — skipped — no lighthouse binary
❌ Lighthouse run — not yet wired to a preview server target
```

Dep-count checks pass (no new runtime deps introduced). Lighthouse
cannot run in this sandbox. The implementer notes the same condition
was accepted in the prior closed feature
`add-e2e-testing-…/runs/.../perf.txt` and that CI will run the real
Lighthouse pass. That is acceptable evidence in principle, but the
review gate is `pnpm perf:budget` exits 0 — it does not.

Report regenerated at `perf.md`.

## Tasks

All `tasks.md` items closed:

- T1–T11: `[x]` (refactor + survey).
- T12: `[x]` — S4 grep regression verified.
- T13: `[~]` — pre-existing baseline I1 hits, documented in
  `impl.md` § "Open questions for the reviewer" point 1.
- T14: `[x]` — `no-react-in-atoms` PASS.
- T15: `[x]` — `audit:invariants` runlog at `audit.md`.
- T16: `[x]` — starter typecheck PASS (0 errors); full-repo also passes
  on this re-run (the implementer's playground typecheck note no longer
  reproduces).
- T17: `[x]` — `pnpm test` PASS.
- T18: `[~]` — perf:budget Lighthouse skipped (env), dep-count PASS;
  documented in `impl.md` § point 2.
- T19: `[x]` — boundary verified for starter `.astro` files; see S11
  caveat above re: `tests/e2e/playwright-report/index.html`.
- T20: `[x]` — `.changeset/starter-text-atom-typography.md` (patch
  level, scopes `astro-ignite` + `create-astro-ignite`).

`[~]` tasks have written justification in `impl.md`; they are not
"unchecked without justification" per verdict rule 3.

## CHECKPOINTS

- C1 [x] — `pnpm install` succeeds (transitively verified by every
  subsequent script running).
- C2 [x] — `pnpm typecheck` green.
- C3 [x] — `pnpm test` green; scenario evidence map above shows each
  `S<n>` has an audit/grep that exercises it (the design rejects new
  unit tests for this refactor).
- C4 [ ] — `pnpm format:check` red: `audit.md` is unformatted after
  regeneration this run (`prettier --check` reports one warning). This
  is a regenerated artifact; the original file in the commit `993ba12`
  is formatted. Re-running `pnpm format` and amending the run dir
  closes this.
- C5 [ ] — `pnpm audit:invariants` non-zero — see T2 baseline hits.
- C6 [—] — `openspec validate` not run (no openspec CLI wired in this
  sandbox per `.env.example`'s `OPENSPEC_TELEMETRY=0` note); not gating.
- C7 [x] — every task `[x]` or `[~]` with `impl.md` justification.
- C8 [x] — changeset present.
- C9 [—] — no commit on the branch carries the
  `"committer: committed …"` trailer the reviewer.md asks to grep for;
  the alternative ("check the diff's paths against `design.md`'s 'Files
  touched' list") fails for commit `e7f71f5` (see below).
- C10 [—] — `pnpm doctor` not run.
- C11 [ ] — `pnpm perf:budget` red (Lighthouse env).
- C12 [—] — `pnpm scaffold:test` not run (it includes the Lighthouse
  step which is unrunnable here).
- C13 [—] — `new-template` skill audit not applicable (no new
  template).
- C14 [x] — `apps/site` / `apps/docs` mirrors deliberately not updated;
  the change's proposal explicitly limits scope to
  `packages/templates/starter/` (impl.md § Summary, proposal § "Out of
  scope").
- C15–C18 [—] — N/A (no registry manifest change, no CLI change).
- C19 [—] — no boundary spec delta needed (no AGENTS.md altered).
- C20 [—] — N/A.
- C21–C23 [—] — archive checkpoints; leader's job, not reviewer's.

## Commits scoped to design.md

7 commits on this branch:

```
e7f71f5 chore(...): prettier autoformat                  ← OUT OF SCOPE
993ba12 spec(...): close out tasks + run records (T12-T20)
1b97952 feat(starter): use <Text> in Footer + not-found-state + 3 layouts
232bc7a feat(starter): use <Text> on blog + projects lists + [lang] parallels
d9f855b feat(starter): use <Text> on about + contact + [lang] parallels
ce83c69 feat(starter): use <Text> on home + [lang]/home
aeba6cd spec(...): inventory + design harness paths (T1, T2)
```

`aeba6cd`, `ce83c69`, `d9f855b`, `232bc7a`, `1b97952`, `993ba12` all
modify paths inside `design.md`'s "Files touched" list (starter pages,
components, layouts, layouts; and the harness paperwork section).

**`e7f71f5` (prettier autoformat) introduces a new file outside the
allow-list**: `tests/e2e/playwright-report/index.html` (71 lines, a
Playwright test-runner HTML report artifact). The file is not
gitignored at repo root and not under any sub-dir gitignore. The
design's "Files touched" lists none of `tests/**`, so this commit's
scope amendment is missing.

No commit carries the `"committer: committed ..."` body line the
reviewer protocol expects, so I cannot confirm via grep that
`scripts/committer --design` ran on each commit — I verified by diff
path against `design.md` instead. By that proxy, all commits except
`e7f71f5` stay in scope.

## Out-of-scope file

`tests/e2e/playwright-report/index.html` (NEW, 71 lines) added by
`e7f71f5`. Likely a Playwright report regenerated locally and picked up
by `prettier --write`. Two fix options:

1. `git rm` the file in a follow-up commit and add
   `tests/e2e/playwright-report/` to `.gitignore` (preferred — the
   directory is a build artifact).
2. If the file is intentional infrastructure, amend `design.md` § "Files
   touched" with a `NEW tests/e2e/playwright-report/index.html` line and
   justify it.

## Changes requested

1. **Audit baseline (BLOCKER, verdict rule 2/5).** `pnpm
   audit:invariants` is red because `tokens-only.mjs` flags two
   pre-existing `themeColor: '#…'` hex literals in
   `packages/templates/starter/src/config/site.ts:107` and
   `packages/templates/docs/src/config/site.ts:68` (both from initial
   commit `f02e323`). This change does not introduce the hits, but the
   audit gate is binary. Pick one:
   - **(a)** Fix in-scope: replace both hex literals with a
     token-driven expression (e.g. read `getComputedStyle(document.documentElement)
.getPropertyValue('--color-bg')` at runtime, or precompute and
     reference the token), add `MOD packages/templates/starter/src/config/site.ts`
     and `MOD packages/templates/docs/src/config/site.ts` to `design.md`
     § "Files touched" (note `packages/templates/docs/` is otherwise
     out-of-scope of this feature — if you do this, S11 needs a wording
     update too).
   - **(b)** Narrow `scripts/audit/tokens-only.mjs` to skip
     `src/config/site.ts` (config, not component/page), and add the
     audit change to a separate change folder — that change is not this
     feature's scope and would need its own proposal/design.
   - **(c)** Annotate the baseline in `design.md` § "Invariants this
     change touches" and amend `feature_list.json`'s acceptance rule
     to allow pre-existing baseline failures — same caveat as (b).
   I cannot approve while the audit is red, regardless of who caused
   the hit, because the reviewer protocol's hard rule is "Never approve
   with any audit red."

2. **Perf budget Lighthouse step (BLOCKER, verdict rule 6).** `pnpm
   perf:budget` is red — Lighthouse can't run in this sandbox.
   `impl.md` cites prior precedent (`add-e2e-testing-…` accepted the
   same environment limitation), and the change introduces zero new
   runtime deps (dep-count check passes), so the regression risk is
   nominal — but the gate is `pnpm perf:budget` exits 0. Options:
   - **(a)** Run on a host with Chrome for Testing installed (`pnpm
     dlx lighthouse` or follow `scripts/doctor/chrome-installed.mjs`)
     and re-capture `perf.md`.
   - **(b)** Wire CI to run `pnpm perf:budget` and treat that as the
     gate, then update the reviewer protocol to accept "CI ran it
     green" as evidence. (Out of scope of this feature.)

3. **Out-of-scope file (BLOCKER, verdict rule 7).** `e7f71f5` added
   `tests/e2e/playwright-report/index.html`, not listed in `design.md`
   § "Files touched". Either:
   - `git rm tests/e2e/playwright-report/index.html` and add
     `tests/e2e/playwright-report/` to `.gitignore` in a new commit.
   - Or amend `design.md` with the new file declaration and re-run the
     committer check.

4. **`format:check` warning (non-blocker).** `audit.md` is unformatted
   after this review run regenerated it. Run `pnpm format` on
   `openspec/changes/.../runs/2026-05-18T09-59-13Z/audit.md` and the
   `review.md` you're reading once committed. This is C4, not a hard
   verdict rule.

CHANGES_REQUESTED -> openspec/changes/starter-use-the-text-component-for-all-t/runs/2026-05-18T09-59-13Z/review.md
