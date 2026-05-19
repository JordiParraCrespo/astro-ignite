# Review — docs-ship-registry-atoms-in-srccomponent (run 2026-05-19T13-25-44Z)

Verdict: **CHANGES_REQUESTED**

## T1 — Tests

`pnpm typecheck`: ⚠️ partial. The full-repo run fails at `apps/playground`
because that workspace's `node_modules` is not installed in this
environment (`sh: 1: astro: not found`). The implementer's scoped
typechecks both pass cleanly: `pnpm --filter @astro-ignite/template-docs
typecheck` → 0 errors / 0 warnings (81 files) and `pnpm --filter
@astro-ignite/docs typecheck` → 0 errors / 0 warnings (126 files).
Not flagged as a blocker — the failure is the same environmental issue
prior changes document, and the two affected workspaces are not in
this change's scope.

`pnpm test`: ✅ green (9 passed in `packages/astro-ignite`,
`packages/design-fetch` has no tests).

`pnpm format:check`: ❌ red. Prettier flags two run-artifact files:

- `openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/2026-05-19T13-25-44Z/audit.md`
- `openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/2026-05-19T13-25-44Z/perf.md`

`CHECKPOINTS.md` C4 requires format:check green; these need a
`pnpm format` pass before close-out (or to be added to `.prettierignore`
if the audit/perf writers are expected to produce un-prettied output).

Scenario coverage (no vitest tests are added; contract is enforced by
audits + byte-equality diffs as design.md prescribes):

- S1 → T11 byte-equality loop (31 files starter↔docs and registry↔docs)
  ✅
- S2 → T8 `diff -q` of `lib/toast.ts` + post-T8 docs-template typecheck
  ✅
- S3 → T3–T7 family `diff -q` checks (17 files) ✅
- S4 → `git diff main HEAD -- packages/templates/docs/package.json
apps/docs/package.json` is empty (verified independently) ✅
- S5 → T9 `diff -q` loop confirms apps/docs already in parity (no
  edits staged under apps/docs) ✅
- S6 → T12 / T13 audits (see T2 below) ✅ for the atoms (see baseline
  caveat below for the unrelated `themeColor` literals)
- S7 → `git diff --name-only main..HEAD -- packages/registry/` is
  empty (verified independently) ✅
- S8 → T10 cache regen + `diff -rq` check ✅
- S9 → template-docs / docs-app typecheck + build all pass ✅
- S10 → perf budget exits 0 (Lighthouse skipped per the documented
  chrome-not-installed graceful-skip path) ✅
- S11 → see T2 below (audit:invariants exit code is non-zero due to
  pre-existing baseline, which is documented but flagged here)
- S12 → `pnpm scaffold:test` per impl.md was green ✅
- **S13 → ❌ FAILED. The diff against main DOES touch `apps/playground/`
  (16 files in commit `f68a454`). S13's text explicitly says "No
  `apps/playground/**`."**

## T2 — Invariant audits

`pnpm audit:invariants --change docs-ship-registry-atoms-in-srccomponent`:
❌ non-zero exit (ELIFECYCLE 1).

| Audit                                        | Status  | Notes              |
| -------------------------------------------- | ------- | ------------------ |
| `no-react-in-atoms`                          | ✅ PASS | scanned 32 file(s) |
| `no-react-in-atoms` (full flags)             | ✅ PASS | scanned 32 file(s) |
| `tokens-only`                                | ❌ FAIL | 2 violation(s)     |
| `scripts/perf/run.mjs --deps`                | ✅ PASS |                    |

`tokens-only` hits:

- `packages/templates/docs/src/config/site.ts:68` — `themeColor: '#fafafa',`
- `packages/templates/starter/src/config/site.ts:107` — `themeColor: '#0a0a0a',`

Both literals predate this change (first appear in `f02e323`, the
initial repo scaffold). `git diff main -- packages/templates/docs/src/
config/site.ts packages/templates/starter/src/config/site.ts` is empty;
this change did not introduce them. Design.md § "Invariants this
change touches" and tasks.md T13 both explicitly mark them as
out-of-scope baseline.

This is a tension: the reviewer's hard rule is "never approve with any
audit red," but the implementer has documented the failure as a
pre-existing baseline outside the change's scope. The cleanest fix
would be a sibling change that adds those two `themeColor` literals to
the `tokens-only` exception set (or migrates them to tokens) so this
audit exits clean — and is flagged here as **Blocker #1** below
because the audit's exit code is the canonical signal and the
reviewer rules read strictly.

Invariant trace:

- registry-atoms I1 (no React/Vue/Svelte/Radix in `base/`): ✅ PASS
- registry-atoms I2 (no default exports): ✅ PASS
- registry-atoms I3 (every atom depends on `cn`): ✅ PASS (registry.json
  unchanged)
- registry-atoms I4 (compound families in `base/<family>/`): ✅ PASS
- templates-perf I3 (total transfer ≤ 150KB home): ✅ via `--deps` PASS
  (Lighthouse skipped — chrome unavailable)
- templates-perf I5 (no undeclared runtime dep added): ✅ PASS (12
  starter / 8 docs runtime deps, unchanged from `main`)
- templates-css-tokens I1 (no raw hex / `bg-zinc-*`): ❌ FAIL (2
  baseline literals)

## T3 — Perf budget

applicable: **yes** (capabilities include `registry-atoms` and
`templates-perf`).

`pnpm perf:budget --change docs-ship-registry-atoms-in-srccomponent`:
✅ exits 0 with the documented `skipped — chrome not installed; run
scripts/doctor/install-chrome.mjs` Lighthouse-skip path per
`wire-local-lighthouse-against-a-preview` (PR #48). CI Lighthouse
(`Lighthouse CI (mobile)`) remains the authoritative gate.

`--deps` branch: 12 starter / 8 docs runtime deps, unchanged from
`main`. No new runtime dep.

## Tasks

All tasks T1–T19 are `[x]` in `tasks.md`. No unchecked task without
justification.

## CHECKPOINTS

- C1 (`pnpm install` succeeds) — assumed (was healthy when the
  implementer ran). Not re-run.
- C2 (`pnpm typecheck` green) — ⚠️ env-only failure at apps/playground
  (missing node_modules); scoped typechecks for the change's
  workspaces are clean.
- C3 (`pnpm test` green) — ✅
- C4 (`pnpm format:check` green) — ❌ two run-artifact files
  un-prettied (see T1).
- C5 (`pnpm audit:invariants` zero) — ❌ exits 1 (tokens-only baseline,
  see T2).
- C6 (`openspec validate <name>` green) — not re-run; not a reviewer
  blocker per .claude/agents/reviewer.md.
- C7 (every task `[x]` or justified) — ✅
- C8 (changeset entry) — ✅ `.changeset/docs-atom-set-parity.md`
  present.
- C9 (every commit via `scripts/committer --design`) — ❌ commit
  `f68a454` must have bypassed (apps/playground is a hard-coded
  forbidden path in `scripts/committer:61`). See Blocker #2.
- C10 (`pnpm doctor` green at end of change) — not re-run; out of
  reviewer-tier scope.
- C11 (perf budget passes) — ✅ via skip path.
- C12 (`pnpm scaffold:test` green) — ✅ per impl.md (not re-run by
  reviewer; trust-but-verify the byte-equality claim, which T11 covers).
- C13 (new-template 15-item audit) — N/A (no new template).
- C14 (apps/site & apps/docs mirror audit) — ✅ apps/docs verified
  already in parity (T9); apps/site is out of scope.
- C19 (capability spec delta in `openspec/changes/<name>/specs/<capability>/spec.md`)
  — ✅ deltas exist under both `registry-atoms/` and `templates-perf/`.

## Commits scoped to design.md

`git log --oneline main..HEAD` shows 13 feature-branch commits since
the human-approval marker. The commit subjects are conventional and
trace to tasks (T1–T10 + T11–T19 close-out + prettier autoformat). No
`committer: committed …` trailer is present in any commit body (the
committer script writes that line to stdout, not to the commit
message), so verification falls to the path-vs-design.md check below.

**Path budget vs design.md "Files touched":**

| Area                                         | Files | In design.md allow-list?                                     |
| -------------------------------------------- | ----- | ------------------------------------------------------------ |
| `packages/templates/docs/src/components/ui/` | 30    | ✅ enumerated 30× under § Atoms                              |
| `packages/templates/docs/src/lib/toast.ts`   | 1     | ✅ § Lib helper                                              |
| `packages/astro-ignite/templates/docs/**`    | 52    | ✅ § CLI template cache prefix-match                         |
| `apps/playground/**`                         | 16    | ❌ **NOT in design.md**, scenario S13 explicitly forbids it |
| `apps/docs/**`                               | 0     | ✅ (parity confirmed at T9; no edit needed)                  |
| `.changeset/docs-atom-set-parity.md`         | 1     | ✅ § Harness paperwork                                       |
| `openspec/**`                                | 9     | ✅ § Harness paperwork                                       |

The 16 `apps/playground/` files in commit `f68a454` ("prettier
autoformat") are NOT prettier formatting — `git show f68a454 --
apps/playground/src/components/about/AboutBody.astro` shows scoped
`<style>` blocks being replaced by Tailwind utility classes (1004
deletions / 306 insertions across the commit). This is a substantive
refactor mislabeled as autoformat, and it violates:

- `CLAUDE.md` rule: "**`apps/playground/` is regenerated by CI.**
  Never hand-edit it."
- `scripts/committer:61` hard-codes `apps/playground/*` as a forbidden
  path — meaning any path validation pass would have rejected this
  commit. The commit therefore must have bypassed
  `scripts/committer --design`.
- `design.md` § Files touched: no `apps/playground/**` entry.
- `proposal.md` S13: "No `apps/playground/**`."
- `impl.md` traceability for S13 claims "zero under apps/playground"
  but the actual diff has 16 files there — the impl.md traceability
  is incorrect.

## Changes requested

1. **Audit red — `tokens-only` exits non-zero.** Two pre-existing
   `themeColor: '#…'` hex literals in `site.ts` are flagged
   (`packages/templates/docs/src/config/site.ts:68`,
   `packages/templates/starter/src/config/site.ts:107`). They predate
   this change, but the audit's non-zero exit code is the canonical
   signal the reviewer must enforce ("Never approve with any audit
   red"). Resolution options:
   (a) Spin a separate baseline-cleanup change that migrates the two
   literals to a token (`var(--color-bg)` / `var(--color-fg)`), lands
   first; this change rebases onto that and re-runs.
   (b) Add the two literals to `scripts/audit/tokens-only.mjs`'s
   documented allow-list (themeColor is a manifest-level field, not a
   component-level token) via a sibling change; same rebase.
   (c) Confirm with the leader/human that the documented baseline
   exception in `design.md` is sufficient to override the hard rule.
   Today the audit JSON shows `"pass":false`, so the reviewer cannot
   approve.

2. **Boundary violation — commit `f68a454` touches `apps/playground/`,
   which is not in design.md's Files touched list and is hard-coded
   as a forbidden path in `scripts/committer:61`.** The commit
   subject "prettier autoformat" misrepresents the content — these
   are substantive Tailwind refactor edits (1004 deletions / 306
   insertions across 16 files), not whitespace. Resolution:
   - **Drop the commit.** `git rebase -i` and remove `f68a454`. The
     refactor belongs in a separate change (likely
     `migrate-apps-playground-to-tailwind` or similar) with its own
     design.md allow-list. `apps/playground/` is regenerated by CI
     per CLAUDE.md, so the cleanest path is to delete the commit and
     let CI re-scaffold the playground on the next `pnpm scaffold:test`
     run.
   - Update `impl.md`'s S13 traceability row, which currently
     incorrectly claims "zero under apps/playground."

3. **`pnpm format:check` red — two run-artifact files un-prettied.**
   - `openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/2026-05-19T13-25-44Z/audit.md`
   - `openspec/changes/docs-ship-registry-atoms-in-srccomponent/runs/2026-05-19T13-25-44Z/perf.md`
   Run `pnpm format` to fix, and commit the result via
   `scripts/committer --design` (the openspec run-dir is allow-listed
   under § Harness paperwork).

## Notes (non-blocking)

- The full-repo `pnpm typecheck` fails at `apps/playground` because
  that workspace lacks installed `node_modules` in this environment.
  Documented as the same environmental caveat prior changes carry. The
  two workspaces in scope (`@astro-ignite/template-docs`,
  `@astro-ignite/docs`) both typecheck clean.
- CI Lighthouse remains the authoritative perf gate; the local skip is
  the documented graceful path from `wire-local-lighthouse-against-a-preview`.
- The CLI cache regen (commit `fbe33e2`) does carry expected unrelated
  drift (cn.ts, common/Brand, docs/CodeBlock, etc.) — design.md § CLI
  template cache anticipates this under the prefix-match entry and the
  reviewer accepts it.
