# Routine — Review a harness PR

Paste this as the **Instructions** of a routine named `Harness — review PR`.
Attach a **GitHub** trigger: event **Pull request**, actions `opened` +
`synchronize`, base branch `main` (your default branch). Optionally filter head
branch `starts with` `claude/` so it only reviews harness PRs.

This one routine handles both PR kinds and branches on the head-branch name:

- `claude/spec/*` → a **spec PR** (the approval gate). Sanity-check the spec, do
  not run tests.
- `claude/impl/*` → an **implementation PR**. Run the full three-tier review.

---

You are the reviewer for the astro-ignite harness. Read `CLAUDE.md`,
`.claude/agents/reviewer.md`, and `.claude/agents/leader.md` first. The
SessionStart hook has already run `pnpm install`.

Identify the triggering PR (number, head branch). Derive `NAME` from the head
branch (`claude/spec/<NAME>` or `claude/impl/<NAME>`).

## If the head branch is `claude/spec/<NAME>` (spec PR)

Do a spec readiness check — no code exists yet, so do not run tests/audits:

1. Read `openspec/changes/$NAME/{proposal,design,tasks}.md` and the matching
   `openspec/feature_list.json` entry.
2. Verify every acceptance criterion for `$NAME` is covered by at least one
   `S<n>` scenario in `proposal.md`; that `design.md` lists "Files touched" with
   `NEW`/`MOD`/`DEL` prefixes and cites the `I<n>` invariants from the relevant
   `openspec/specs/<capability>/spec.md`; and that `tasks.md` maps each task to
   an `S<n>`/`I<n>`.
3. Post **one** PR comment: a verdict line `Spec review: READY` or
   `Spec review: GAPS`, then a short bullet list of any gaps with file:line refs.
   Do not push commits. Do not approve via GitHub review — the human approves by
   merging.

## If the head branch is `claude/impl/<NAME>` (implementation PR)

Run the canonical three-tier verification:

1. Find the active run dir: the newest `openspec/changes/$NAME/runs/<ts>/` (or,
   if the change was already archived onto this branch, the newest run under
   `openspec/archive/*-$NAME/runs/`).
2. Launch the **`reviewer`** subagent (Task tool) with the feature name and that
   run-dir path, instructing it to follow its agent spec exactly (T1 `pnpm
typecheck && pnpm test`, T2 `pnpm audit:invariants --change $NAME`, T3 `pnpm
perf:budget --change $NAME` when applicable) and write `review.md`.
3. Read the resulting `review.md` and post **one** PR comment containing its
   verdict (`APPROVED` / `CHANGES_REQUESTED`) and the per-tier summary
   (test/audit/perf) plus each blocker with its file:line ref.
4. Do not edit code. Do not merge. If `CHANGES_REQUESTED`, leave the PR open for
   the `advance on merge` routine / a follow-up fix run.

For any other head branch, stop and report "not a harness PR — skipping".
