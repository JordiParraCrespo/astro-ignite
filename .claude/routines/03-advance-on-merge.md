# Routine — Advance on merge

Paste this as the **Instructions** of a routine named `Harness — advance on
merge`. Attach a **GitHub** trigger: event **Pull request**, action `closed`,
filter **Is merged** = `true`, base branch `main`, head branch `starts with`
`claude/`.

This advances the harness one state per merge — the merge tap on your phone is
the human gate. Routed by head-branch prefix:

- merged `claude/spec/issue-<N>` = **you approved the spec** → implement + review,
  open the `Implement:` PR.
- merged `claude/impl/issue-<N>` = **feature shipped** → archive the change.
- merged `claude/direct/issue-<N>` = **direct change shipped** → nothing to
  archive; the `Closes #<N>` already closed the issue.

---

You are the leader for the astro-ignite harness. Read `CLAUDE.md` and
`.claude/agents/leader.md` first. The SessionStart hook has already run `pnpm
install`. Identify the merged PR, its head branch, and the linked issue `<N>`.
Work from the default branch (the merge is already in it).

## Case A — merged `claude/spec/issue-<N>` (approval → implement)

The leader's "spec_ready, human just approved" transition. Do NOT archive here —
that's the impl-PR merge, so a human ships it.

1. Find the change folder `openspec/changes/issue-<N>-*/`; call it `NAME`.
2. `touch openspec/changes/<NAME>/APPROVED`.
3. `mkdir -p openspec/changes/<NAME>/runs/$(date -u +%Y-%m-%dT%H-%M-%SZ)`; call it
   `RUN`.
4. Create branch `claude/impl/issue-<N>`; commit the `APPROVED` marker + run
   scaffold.
5. Launch the **`implementer`** subagent (Task tool) with `NAME` and `RUN`:
   follow its agent spec — code + tests, commit **only** via `scripts/committer
--design openspec/changes/<NAME>/design.md`. (Note: the human may have edited
   `tasks.md`/`design.md` in the spec PR — implement against the merged version.)
6. When it returns `done`, launch the **`reviewer`** subagent on `RUN` (T1/T2/T3
   per its spec). Read `review.md`.
7. Push `claude/impl/issue-<N>` and open a PR:
   - **Title:** `Implement: #<N> <title>`
   - **Body:** `Closes #<N>`, then the reviewer verdict + per-tier summary, then
     verbatim: _"Merging ships this feature and closes the issue; the advance
     routine archives the change."_
   - If `CHANGES_REQUESTED`, prefix the title with `[changes requested]` and open
     as a draft.
8. Stop. Report the PR URL. Do not archive.

## Case B — merged `claude/impl/issue-<N>` (ship → archive)

1. Find `openspec/changes/issue-<N>-*/`; call it `NAME`.
2. `mv openspec/changes/<NAME> openspec/archive/$(date -u +%Y-%m-%d)-<NAME>`.
3. Append a one-line summary to `openspec/progress/history.md`; reset
   `openspec/progress/current.md`.
4. Confirm a `.changeset/` entry exists for this change (the implementer should
   have added one); if missing, add a minimal changeset.
5. Commit the archive move on branch `claude/advance/issue-<N>`, push, and open a
   PR `Archive: #<N> <title>` (bookkeeping — merge it from your phone).
6. Stop. Report the PR URL. The issue was already closed by the impl PR's
   `Closes #<N>`.

## Case C — merged `claude/direct/issue-<N>` (direct ship)

Nothing to archive — direct builds create no openspec change folder, and the
`Closes #<N>` on the direct PR already closed the issue. Confirm the issue is
closed, remove any lingering `aig:active` label, and report "direct change for #<N> shipped".

For any other head branch, stop and report "not a harness PR — skipping". Hard
rules: never edit `openspec/feature_list.json`; never skip `scripts/committer`
for source changes.
