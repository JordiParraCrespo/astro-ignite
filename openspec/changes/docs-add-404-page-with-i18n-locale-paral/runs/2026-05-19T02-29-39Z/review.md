# Review — docs-add-404-page-with-i18n-locale-paral (run 2026-05-19T02-29-39Z)

Verdict: **CHANGES_REQUESTED**

## T1 — Tests

`pnpm typecheck`: ✅ green (0 errors across all packages — 87/94/126/96/48 files; warnings only for unused `Props` and a deprecated `tseslint.config` signature, all pre-existing).

`pnpm test`: ✅ green (1 file, 9 tests passed — `packages/astro-ignite/src/scaffold.test.ts`). `packages/design-fetch` has no tests (vitest `--passWithNoTests`).

### Scenario coverage (`S<n>` → test)

The repo's only test suite is `packages/astro-ignite/src/scaffold.test.ts` (CLI dep-stripping). Docs-template page/component output is not unit-tested. The implementer's traceability table verifies each scenario via build artifacts and audits, not via test code. Strict scenario→test mapping:

- **S1** Default-locale 404 renders inside `BaseLayout` → ❌ no test; impl.md cites manual build of `packages/templates/docs/dist/404.html`.
- **S2** Non-default-locale 404 via `[lang]/404.astro` → ❌ no test; impl.md cites a temporary `siteConfig.locales=['en','es']` build (config reverted before commit).
- **S3** `Astro.response.status = 404` set in frontmatter → ❌ no test; verified by source inspection at `packages/templates/docs/src/pages/404.astro:7` and `packages/templates/docs/src/pages/[lang]/404.astro:12`.
- **S4** Back-to-home is locale-aware → ⚠️ partially covered by the `internal-links-localized` audit (which is itself red — see T2).
- **S5** Search affordance reuses `docs/SearchBox.astro` → ❌ no test; verified by source inspection.
- **S6** Component uses design tokens only → ⚠️ partially covered by the `tokens-only` audit (which is itself red — see T2).
- **S7** Layout-emitted `@graph` is the only JSON-LD → ⚠️ covered by `jsonld-graph` audit (PASS).
- **S8** i18n bundles stay key-parallel → ❌ no test; verified by ad-hoc structural diff.
- **S9** `apps/docs` mirror updated in lockstep → ❌ no test; verified by manual file comparison.
- **S10** No new runtime dependency → ⚠️ covered by `perf/run.mjs --deps` (PASS).
- **S11** Perf budget holds on the 404 surface → ❌ Lighthouse runner is a known placeholder (`scripts/perf/run.mjs` line 74); see T3.

This gap is structural to the repo (no template-output tests exist), not unique to this change — but per `CHECKPOINTS.md` C3, every `S<n>` should have at least one test. Flagging for the leader to triage as a harness gap vs. a per-change blocker.

### Commit traceability

`git log main..HEAD --oneline`:

- `0dc3df2` chore: prettier autoformat
- `40d585b` chore: close out tasks + run impl/audit/perf records + design audit list
- `5cce4d4` feat: add 404 pages with i18n locale parallel
- `e67d6cd` feat: add NotFoundHero 404 surface
- `97ebb84` feat: add errors.404.search i18n key
- (plus pre-implementer commits: `25762c6` approve, `71f1505` spec, `048807d` feature)

The three `feat` commits (`97ebb84`, `e67d6cd`, `5cce4d4`) only touch paths inside `design.md`'s "Files touched" list and are consistent with `scripts/committer --design`.

## T2 — Invariant audits

`pnpm audit:invariants --change docs-add-404-page-with-i18n-locale-paral`: ❌ **red** (exit code 1; 3 audits failing, 5 passing).

| Audit                                             | Result  | Notes                                                                                                                                                                                                                  |
| ------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `i18n-parallels`                                  | ✅ PASS | scanned 2 template(s)                                                                                                                                                                                                  |
| `i18n-parallels --strict`                         | ✅ PASS | scanned 2 template(s)                                                                                                                                                                                                  |
| `internal-links-localized` (templates-i18n I5)    | ❌ FAIL | `packages/templates/docs/src/components/docs/SidebarNav.astro:64` — `<Brand href="/" variant="lockup" size={0.42} />` (pre-existing on `main`; this change does not touch SidebarNav.astro)                            |
| `tokens-only` (templates-css-tokens I1)           | ❌ FAIL | `packages/templates/docs/src/config/site.ts:68` `themeColor: '#fafafa'` and `packages/templates/starter/src/config/site.ts:107` `themeColor: '#0a0a0a'` (both pre-existing on `main`; this change does not touch them) |
| `tokens-only --layered` (templates-css-tokens I4) | ❌ FAIL | same two pre-existing site.ts hits                                                                                                                                                                                     |
| `jsonld-graph`                                    | ✅ PASS | JSON-LD graph clean                                                                                                                                                                                                    |
| `jsonld-graph --strict`                           | ✅ PASS |                                                                                                                                                                                                                        |
| `jsonld-graph --typed`                            | ✅ PASS |                                                                                                                                                                                                                        |

`audit.md` reflects the same. The fresh per-change run was overwritten by `run-all.mjs`.

The implementer's open question #1 asks whether the pre-existing failures should be folded in or filed separately. Per the reviewer hard rules ("Never approve with any audit red"), the audit must return zero before this change closes — regardless of whether the failures are pre-existing. Either (a) amend `design.md`'s "Files touched" list to include `SidebarNav.astro` and both `site.ts` files, fix them under this change, and add corresponding tasks/scenarios, or (b) `scripts/audit/run-all.mjs` must be enhanced to scope its assessment to paths touched by the change (which would require a harness change separate from this feature). Either way, this state is not approvable.

## T3 — Perf budget

Applicable: **yes** (capabilities include `templates-*` per `design.md`).

`pnpm perf:budget --change docs-add-404-page-with-i18n-locale-paral`: ❌ **red** (exit code 1).

| Check             | Result  | Notes                                                                                                         |
| ----------------- | ------- | ------------------------------------------------------------------------------------------------------------- |
| starter dep count | ✅ PASS | 12 runtime deps                                                                                               |
| docs dep count    | ✅ PASS | 8 runtime deps                                                                                                |
| lighthouse binary | ❌ FAIL | "lighthouse not installed (try `pnpm dlx lighthouse` or install Chrome for Testing). Skipping Lighthouse run" |
| Lighthouse budget | ❌ FAIL | skipped — no lighthouse binary                                                                                |
| Lighthouse run    | ❌ FAIL | "not yet wired to a preview server target; see AGENTS.md step 6"                                              |

The implementer's open question #2 acknowledges this as a known-placeholder runner. Per the reviewer hard rules ("Never approve with `pnpm perf:budget` red when it applies") and verdict criterion #6, this is a blocker as long as the budget check is required by `design.md`'s "Performance budget applicability" section. The harness gap must be closed (or the budget step waived in `feature_list.json` rules) before APPROVED can be emitted.

## Tasks

All 14 tasks in `tasks.md` are `[x]`. Spot checks:

- **T1, T5** (i18n key) — `errors.404.search` present in `packages/templates/docs/src/i18n/{en,es}.json` and `apps/docs/src/i18n/{en,es}.json`; structural diff matches.
- **T2, T6** (NotFoundHero) — `packages/templates/docs/src/components/not-found/NotFoundHero.astro` and `apps/docs/src/components/not-found/NotFoundHero.astro` byte-identical (129 lines each); both use scoped `<style>` and design tokens.
- **T3, T7** (default `404.astro`) — present (15 lines each).
- **T4, T8** (`[lang]/404.astro`) — present (21 lines each) with `getStaticPaths`.
- **T9** (no new runtime dep) — `git diff main -- packages/templates/docs/package.json apps/docs/package.json` returns empty. Confirmed.
- **T10** (per-change audits green) — ❌ false at close-out: see T2, three audits red.
- **T11** (typecheck + format:check + test) — typecheck/test green; `pnpm format:check` not re-run by this review.
- **T12** (`pnpm scaffold:test`) — not re-run by this review.
- **T13** (perf budget against /404.html) — ❌ false at close-out: see T3, Lighthouse runner placeholder.
- **T14** (manual smoke) — impl.md notes the headless implementer could not exercise `pnpm dev`; build-path verification was substituted.

Net: T10 and T13 were marked `[x]` in `tasks.md` but their underlying audit/perf runs are red. The implementer's impl.md narrates each as "pre-existing" or "harness placeholder" rather than as a true PASS. The check-marks are misleading without the qualifier.

## CHECKPOINTS

Walking applicable global + scoped (templates-\*) items:

- **C1** [x] — `pnpm install` not re-run by this review; no lockfile drift in diff.
- **C2** [x] — `pnpm typecheck` green.
- **C3** [ ] — `pnpm test` is green, but no `S<n>` in `proposal.md` has dedicated test code (see T1 scenario map). Structural repo gap.
- **C4** [ ] — `pnpm format:check` not re-run.
- **C5** [ ] — `pnpm audit:invariants` returns **non-zero** for this change. BLOCKER.
- **C6** [ ] — `openspec validate` not re-run by this review.
- **C7** [x] — every task in `tasks.md` is `[x]`; T10 and T13's justification lives in `impl.md` (with caveats noted above).
- **C8** [ ] — **No changeset entry under `.changeset/` for this change.** The branch ships in `packages/templates/docs/` (and the `apps/docs` mirror); per the rule a changeset is required. The existing `.changeset/docs-text-atom-typography.md` belongs to the sibling `docs-use-the-text-component-for-all-typo` change. BLOCKER.
- **C9** [ ] — `0dc3df2` "prettier autoformat" and `40d585b` "close out tasks + run records" both touch paths outside `design.md`'s "Files touched" list (see "Commits scoped to design.md" below). Cannot have gone through `scripts/committer --design`. BLOCKER.
- **C10** [ ] — `pnpm doctor` not re-run by this review.
- **C11** [ ] — `pnpm perf:budget` is **red** (exit code 1; Lighthouse runner placeholder). BLOCKER (or waive at the harness level).
- **C12** [ ] — `pnpm scaffold:test` not re-run by this review.
- **C13** [ ] — the `new-template` skill 15-item audit is not walked / recorded in this run's impl.md.
- **C14** [x] — `apps/docs` mirror updated in lockstep (T5–T8 confirmed by diff).

Closure checkpoints C21–C23 do not yet apply (this change is in `runs/`, not `archive/`).

## Commits scoped to design.md

All commits go through `scripts/committer --design`: **no.**

`design.md`'s "Files touched" list, summarized:

```
packages/templates/docs/src/pages/404.astro
packages/templates/docs/src/pages/[lang]/404.astro
packages/templates/docs/src/components/not-found/NotFoundHero.astro
packages/templates/docs/src/i18n/en.json
packages/templates/docs/src/i18n/es.json
apps/docs/src/pages/404.astro
apps/docs/src/pages/[lang]/404.astro
apps/docs/src/components/not-found/NotFoundHero.astro
apps/docs/src/i18n/en.json
apps/docs/src/i18n/es.json
(plus the four spec-delta files under openspec/changes/.../specs/)
```

### `0dc3df2` "chore: prettier autoformat" — touches paths NOT in Files touched

```
.changeset/docs-text-atom-typography.md                                                  (sibling change's changeset)
apps/playground/CLAUDE.md                                                                (deletes the file — converts CLAUDE.md to a symlink → AGENTS.md; harness boundary change)
openspec/changes/docs-use-the-text-component-for-all-typo/runs/2026-05-19T01-24-38Z/{audit,impl,perf}.md   (sibling change's run records — not this change at all)
```

The bleed-through of the `docs-use-the-text-component-for-all-typo` run records and changeset onto this branch is a real concern: those artifacts belong to a different change and shouldn't be merged via this PR. Even if the prettier reformat itself is benign, the commit hand-walked past `scripts/committer --design`.

### `40d585b` "chore: close out tasks + run impl/audit/perf records + design audit list"

```
openspec/changes/docs-add-404-page-with-i18n-locale-paral/design.md                        (in Files touched? — no, design.md itself is meta, not in the bulleted list)
openspec/changes/docs-add-404-page-with-i18n-locale-paral/tasks.md                         (meta, not in list)
openspec/changes/docs-add-404-page-with-i18n-locale-paral/runs/2026-05-19T02-29-39Z/{audit,impl,perf}.md
openspec/progress/current.md                                                                (global state, not in list)
```

The implementer's impl.md explicitly states: "committed without `--design` since these run-records sit outside 'Files touched'". This is a deliberate `--design` bypass. Per verdict criterion #8 and CHECKPOINT C9, this is a violation regardless of how harmless the content. The harness needs either an exemption pattern for `runs/**`, `progress/**`, `design.md`, `tasks.md`, etc., or these committed paths must be approved differently.

### Other commits

- `5cce4d4`, `e67d6cd`, `97ebb84` — feat commits, paths all inside Files touched. Consistent with `scripts/committer --design`.
- `25762c6`, `71f1505`, `048807d` — pre-implementer commits (approve, spec, feature backlog); out of the implementer's scope.

## Changes requested

1. **Audit red (BLOCKER, T2 + C5).** `pnpm audit:invariants --change docs-add-404-page-with-i18n-locale-paral` returns exit code 1 from three pre-existing failures: `packages/templates/docs/src/components/docs/SidebarNav.astro:64` (hardcoded `href="/"`), `packages/templates/docs/src/config/site.ts:68` (`#fafafa`), and `packages/templates/starter/src/config/site.ts:107` (`#0a0a0a`). The reviewer cannot approve while the audit runner exits non-zero. Pick one of:
   - (a) Amend `design.md`'s "Files touched" list to include these three files; add tasks T15–T17 (or similar) to convert each to design-token references; re-run the audits.
   - (b) Land a separate harness change first that teaches `scripts/audit/run-all.mjs` to scope its pass/fail to paths touched by the change (so pre-existing repo violations don't gate unrelated PRs).
2. **Perf budget red (BLOCKER, T3 + C11).** `pnpm perf:budget --change docs-add-404-page-with-i18n-locale-paral` returns exit code 1 because `scripts/perf/run.mjs`'s Lighthouse runner is a known placeholder. Either install the Lighthouse / Chrome-for-Testing binary and finish wiring the runner, or amend `openspec/feature_list.json`'s `rules.require_perf_budget_to_close_when` (and/or `design.md`) so the perf step is not required for closure of this specific change. Until then, the perf tier is red.
3. **Commits bypassed `scripts/committer --design` (BLOCKER, C9 + verdict #8).** `0dc3df2` and `40d585b` touch paths outside `design.md`'s "Files touched" list. Specifically `0dc3df2` includes content that belongs to a different change (`docs-use-the-text-component-for-all-typo` run records and the `.changeset/docs-text-atom-typography.md` entry) — those must be removed from this branch (rebase/revert) and merged on their own branch. `40d585b`'s close-out content (`runs/**`, `progress/**`, `design.md`, `tasks.md`) needs an explicit committer-allowed pathway (e.g., a `--meta` flag, or by adding `openspec/changes/<name>/` recursively to Files touched). Leader/spec-author judgement is needed on the long-term shape.
4. **Missing changeset (BLOCKER, C8 + verdict #9).** Add `.changeset/docs-add-404-with-i18n-parallel.md` (or similar slug) declaring a minor bump for `@astro-ignite/template-docs` and `@astro-ignite/docs`. The existing `.changeset/docs-text-atom-typography.md` is a separate change and does not count.
5. **Sibling-change bleed-through (BLOCKER).** Remove the following from this branch (they belong to `docs-use-the-text-component-for-all-typo`, not to this change): `apps/playground/CLAUDE.md` symlink swap, `.changeset/docs-text-atom-typography.md`, `openspec/changes/docs-use-the-text-component-for-all-typo/runs/2026-05-19T01-24-38Z/{audit,impl,perf}.md`. These should land on their own branch / PR.
6. **Scenario→test gap (advisory, C3).** None of S1–S11 has dedicated test code; verification is via build artifacts and audits. Repo-structural — recommend filing a follow-up spec-author ticket to add minimal HTML-output assertions for `dist/404.html` and `dist/<lang>/404/index.html` (or accept the harness gap and document the exemption in `feature_list.json`). Not a per-change blocker if the harness explicitly allows audit-only coverage for template surfaces.
7. **Manual smoke (advisory, T14).** Implementer flagged that headless mode could not exercise `pnpm dev:docs-template`. The reviewer is invited by impl.md to walk through `/does-not-exist` in the browser. This headless reviewer also cannot. Recommend the human gate confirm browser behaviour before final close-out.

CHANGES_REQUESTED -> openspec/changes/docs-add-404-page-with-i18n-locale-paral/runs/2026-05-19T02-29-39Z/review.md
