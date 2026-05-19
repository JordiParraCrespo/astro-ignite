# Review — migrate-starter-template-to-tailwind-css (run 2026-05-18T23-29-02Z)

Verdict: **CHANGES_REQUESTED**

## T1 — Tests

- `pnpm typecheck`: ✅ green (0 errors across `apps/playground`, `apps/site`, `apps/docs`, `packages/templates/starter`, `packages/templates/docs`; only deprecation warnings/hints).
- `pnpm test`: ✅ green (`packages/astro-ignite` 9/9 passing, no other test suites in scope).

### Scenario coverage

- **S1** (no `<style>` blocks except annotated exceptions) → ✅ `grep -rln '<style' packages/templates/starter/src/{components,layouts,pages}` returns exactly `Image.astro` and `ArticleLayout.astro`, and both carry a leading `<!-- tailwind-exception: ... -->` comment within the preceding 10 lines.
- **S2** (`tokens-only` audit passes on the starter) → ❌ **`node scripts/audit/tokens-only.mjs` fails** with 2 violations:
  - `packages/templates/docs/src/config/site.ts:68` — `themeColor: '#fafafa'`
  - `packages/templates/starter/src/config/site.ts:107` — `themeColor: '#0a0a0a'`
    `git blame` confirms both pre-date this change (commit `f02e323`, initial commit), and `impl.md` Open Question #4 acknowledges them. Per the strict criterion ("never approve with any audit red") this is a **blocker**: either the audit must allow `themeColor:` lines (the proper fix), or `src/config/site.ts` must move to a `var(--color-*)` value, or the audit must be scoped away from `src/config/`. The `--layered` flag of the same audit correctly behaves as the deprecated no-op the spec delta specifies. ← BLOCKER
- **S3** (tri-state dark mode flips via `.light`) → ⚠️ **Named test does not exist.** The scenario explicitly says "`pnpm test:e2e --project=starter --grep theme-toggle` passes" — but `tests/e2e/starter/` only contains `blog.spec.ts` and `contact.spec.ts`; there is no `theme-toggle` test. The structural wiring is preserved (`.light` selector unchanged in `global.css`; every migrated component resolves colors via `var(--color-*)`), but the scenario's referenced test does not exist in the repo. ← BLOCKER for criterion 1.
- **S4** (Lighthouse budget) → ✅ `pnpm perf:budget --change <name>` exits 0 with graceful skips (autopilot has no Chrome); CI workflow "Lighthouse CI (mobile)" is the authoritative gate per `design.md`.
- **S5** (Beasties decision captured) → ✅ `design.md` documents "DROP by policy"; `grep -ri beasties\|critters packages/templates/starter/ apps/site/` finds no matches; the `templates-perf` spec delta drops the requirement and I4 audit row.
- **S6** (`apps/site` mirrors the new shape) → ⚠️ Component/layout parity is preserved for every starter ↔ apps/site parallel listed in `design.md`'s "Files touched". Outstanding `<style>` blocks remain in `apps/site/src/pages/{about,contact,404,blog/index,projects/index,[lang]/...}.astro`, `apps/site/src/components/BlogCard.astro`, and `apps/site/src/components/image/Image.astro`. The implementer documents this in `impl.md` Open Question #1: these have no starter parallel (starter pages are composition-only) and are out of scope per design.md. The starter `Image.astro` carries the new tailwind-exception annotation; the apps/site mirror does not (the design.md does not list it). Not a blocker but worth flagging for a follow-up.
- **S7** (CLI template cache in sync) → ✅ `diff -r packages/templates/starter/src/components packages/astro-ignite/templates/starter/src/components` is empty; cache is byte-identical to source.
- **S8** (documentation reflects single-layer strategy) → ✅ Root `AGENTS.md` (Tech-stack bullet @ L38, Template-invariants item 4 @ L134), `packages/templates/starter/AGENTS.md` (L14, L24), and `.agents/skills/new-template/SKILL.md` all describe Tailwind-first / token-resolved with the tailwind-exception escape hatch.
- **S9** (locked invariants remain green) → ❌ `pnpm audit:invariants --change <name>` ran but matched **zero audits** because this change's `design.md` writes its invariants in a markdown table format (`| Spec / Id | ... | Audit | ... |`) while `scripts/audit/run-all.mjs` only recognises bullet-list rows of the form `- audit: \`<cmd>\``. The resulting `audit.md` table is empty; no I<n> was actually verified by the dispatcher. ← BLOCKER (related to criterion 2 below).
- **S10** (no new runtime deps; changeset documents the migration) → ✅ `packages/templates/starter/package.json` adds no `dependencies` entries; `astro-beasties` (or equivalent) is gone; `.changeset/migrate-starter-template-to-tailwind-css.md` documents the strategy switch with a migration note.

### Commits scoped to design.md

20 commits on `spec/37-migrate-starter-template-to-tailwind-css` since `main`. None carry an explicit "committer: committed ..." trailer in the commit message (the `scripts/committer` shell wrapper prints that line to stdout but does not append it to the message). Validated by inspecting the diff path set instead:

`git diff --name-only main..HEAD` lists 64 files. Every code path falls within `design.md`'s "Files touched":

- `apps/site/src/components/{common,landing,legal}/*.astro` and `apps/site/src/layouts/{Article,Legal,Project}Layout.astro` ✓
- `packages/templates/starter/src/{components,layouts}/...` ✓
- `packages/astro-ignite/templates/starter/...` ✓ (CLI cache prefix)
- `scripts/audit/tokens-only.mjs`, `scripts/perf/run.mjs` ✓
- `AGENTS.md`, `packages/templates/starter/AGENTS.md`, `.agents/skills/new-template/SKILL.md` ✓
- `.changeset/migrate-starter-template-to-tailwind-css.md` ✓
- `openspec/changes/migrate-starter-template-to-tailwind-css/**` ✓ (change package itself)
- `openspec/feature_list.json`, `openspec/progress/current.md` ✓ (backlog/harness state)

No out-of-scope code paths detected.

## T2 — Invariant audits

`pnpm audit:invariants --change migrate-starter-template-to-tailwind-css`: ✅ exit 0, but **dispatcher matched 0 audits** — the empty `audit.md` table is the symptom. See S9 above. The implementer's `impl.md` claims "PASS (no dispatched-audit failures)" — that is technically true because nothing was dispatched, but it does not satisfy criterion 2 ("every `I<n>` in `design.md` is checked and PASS").

Manual run of each audit script referenced by `design.md`'s invariants table:

| Invariant | Command | Result |
| --- | --- | --- |
| `templates-css-tokens I1` | `node scripts/audit/tokens-only.mjs` | ❌ 2 hits (pre-existing themeColor literals) |
| `templates-css-tokens I2` | `node scripts/audit/tokens-only.mjs --config` | ❌ same 2 hits |
| `templates-css-tokens I3` | `node scripts/audit/tokens-only.mjs --darkmode` | ❌ same 2 hits |
| `templates-css-tokens I4` | `node scripts/audit/tokens-only.mjs --layered` | ✅ deprecated no-op, exits 0 with notice |
| `templates-perf I1/I2/I3` | CI workflow (Lighthouse CI mobile) | n/a locally |
| `templates-perf I4` | removed by spec delta | n/a |
| `templates-perf I5` | `node scripts/perf/run.mjs --deps` | ✅ 12 starter / 8 docs runtime deps (no net add) |

The `tokens-only` failures are real but pre-existing (initial commit `f02e323`, `git blame` confirms). The migration neither introduced nor cleaned them.

## T3 — Perf budget

Applicable: **yes** (capabilities include `templates-perf`).

`pnpm perf:budget --change migrate-starter-template-to-tailwind-css`: ✅ exit 0 with non-failing skips for `Lighthouse binary`, `Lighthouse budget`, `Lighthouse run` (autopilot runner has no Chrome / lighthouse). Dep-count check passed: 12 runtime deps in starter, 8 in docs. Per `design.md`, the CI workflow "Lighthouse CI (mobile)" is the authoritative gate; the local script's graceful-skip is the intended autopilot behaviour.

## Tasks

`openspec/changes/migrate-starter-template-to-tailwind-css/tasks.md` carries 21 task lines; **all 21 are `[ ]` unchecked**.

The `impl.md` provides a Summary and a Traceability table (S1–S10 → verification), and a Commits-made list keyed to T3–T18 work, but it does **not** carry a per-task `T1 done / T2 done / ...` justification block. Per criterion 3 ("Some `T<n>` in `tasks.md` is `[ ]` without justification in `impl.md`"), this is a **blocker**. ← BLOCKER

- T1 (inventory) — covered by `inventory.md` (present, complete) — but task line still `[ ]`
- T2 (token-surface verification) — implicit in Tailwind utilities used; not explicitly justified
- T3–T18 — covered by the commit list and impl summary, but not enumerated against the task numbering
- T19 (`pnpm scaffold:test`) — no record of execution in run-dir
- T20 (final sweep) — impl claims the sweep passes; this review re-ran and found T2 dispatcher empty
- T21 (`new-template` 15-item audit walked) — not recorded in run-dir

Recommend either flipping the `[ ]` boxes (with one-line per-task evidence pointing at commits / artifacts) or extending `impl.md` with a `## Tasks` section that enumerates per-task completion.

## CHECKPOINTS

- **C1** `pnpm install` succeeds — not re-run in this review; deferred to the human merge gate
- **C2** `pnpm typecheck` green — ✅
- **C3** `pnpm test` green; every S<n> has a test — ⚠️ S3's named e2e test does not exist; S1, S2, S5, S7, S8, S10 are verified by static checks; S4 deferred to CI; S6 by inspection
- **C4** `pnpm format:check` green — ❌ Fails on the regenerated `runs/2026-05-18T23-29-02Z/{audit,perf}.md` files (`prettier --check` reports formatting violations). The audit/perf scripts emit a missing trailing space on the `| Audit | Status | Notes |` header row; either the scripts should emit prettier-clean output or `openspec/changes/*/runs/**` should be added to `.prettierignore`. ← BLOCKER
- **C5** `pnpm audit:invariants` returns zero AND every I<n> checked & passed — ⚠️ exit 0, but dispatcher matched 0 audits (see S9, T2 above). I<n> are effectively unchecked.
- **C6** `openspec validate` green — n/a (openspec CLI is not installable on the autopilot read-only filesystem; deferred per `pnpm doctor` warning)
- **C7** Every task `[x]` or justified — ❌ all 21 tasks unchecked, no per-task justification (see Tasks above). ← BLOCKER
- **C8** Changeset exists — ✅ `.changeset/migrate-starter-template-to-tailwind-css.md`
- **C9** Every commit via `scripts/committer --design ...` — ✅ by path-set inference (no out-of-scope path; no committer-trailer convention in repo to assert directly)
- **C10** `pnpm doctor` green — ⚠️ doctor reports 1 error (`feature-list: make-the-h1-contain-only-text` APPROVED but no run — unrelated to this change) and 2 warnings (chrome missing, openspec CLI missing — both environmental)
- **C11** `pnpm perf:budget` passes — ✅ (skip branch on autopilot; CI gate is authoritative)
- **C12** `pnpm scaffold:test` green — not re-run by reviewer; T19 records no local run either
- **C13** `new-template` skill 15-item audit walked — T21 not recorded in run-dir
- **C14** apps/site & apps/docs audit for mirror applicability — ✅ apps/site mirrored for the parallel set in `design.md` Files touched; apps/docs out of scope per design (docs template stays on existing styling layer)
- **C19** Boundary spec delta present — ✅ `specs/templates-css-tokens/spec.md` and `specs/templates-perf/spec.md` deltas present
- **C20** Boundary symlinks intact — ✅ doctor `[boundary-symlinks]` PASS

## Changes requested

1. **`tokens-only` audit is red.** Either teach the audit to ignore `themeColor:` config lines (the HTML spec requires literal hex for `<meta name="theme-color">`), or move `themeColor` values into `var(--color-*)` tokens read at runtime. The two hits at `packages/templates/{starter,docs}/src/config/site.ts` are pre-existing but the migration's spec delta keeps I1 active, so the gate now bites. (S2, criterion 2)
2. **Invariant-dispatcher mismatch.** Reshape `design.md`'s "Invariants this change touches" section to use the `- audit: \`<cmd>\`` bullet-list form that `scripts/audit/run-all.mjs` parses, or extend the dispatcher to also parse the markdown-table form already used in this design. As written, `pnpm audit:invariants --change <name>` silently runs no audits. (S9, criterion 2)
3. **Tasks not justified.** Flip the `[ ]` checkboxes in `tasks.md` for tasks that are complete, or add a `## Tasks` section to `impl.md` with a per-task one-line justification (T1 → inventory.md; T3 → commit `546fe43`; …). T19 and T21 in particular have no recorded execution in the run-dir. (Criterion 3)
4. **`pnpm format:check` fails on the regenerated audit/perf run-dir artifacts.** Either fix `scripts/audit/run-all.mjs` and `scripts/perf/run.mjs` to emit prettier-compatible markdown, or add `openspec/changes/*/runs/**` to `.prettierignore`. (C4)
5. **S3's named e2e test does not exist.** Either add a `theme-toggle` Playwright spec to `tests/e2e/starter/`, or rewrite S3 to reference an existing test / a manual procedure. (Criterion 1)

### Non-blocking observations

- `apps/site/src/components/image/Image.astro` and `apps/site/src/components/BlogCard.astro` still carry `<style>` blocks with no `tailwind-exception` annotation. The implementer documented Image.astro / BlogCard / page-level files as out-of-scope per the design's Files-touched list; a follow-up change to migrate those is the cleanest path.
- `pnpm doctor`'s feature-list error is about an unrelated change (`make-the-h1-contain-only-text`); not this change's responsibility.
