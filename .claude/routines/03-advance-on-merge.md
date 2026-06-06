# Routine — Advance the queue on merge

Paste this as the **Instructions** of a routine named `Harness — advance on
merge`. Attach a **GitHub** trigger: event **Pull request**, action `closed`,
filter **Is merged** = `true`, base branch `main`. Optionally filter head branch
`starts with` `claude/`.

This routine advances the harness one state per merge — it is what makes the
loop fully phone-drivable: you tap **Merge** on your phone, this picks up.

- A merged `claude/spec/<NAME>` PR = **the human approved the spec** →
  create the APPROVED marker, implement, review, and open the implementation PR.
- A merged `claude/impl/<NAME>` PR = **the feature shipped** → archive the change
  and author the next pending spec.

---

You are the leader for the astro-ignite harness. Read `CLAUDE.md` and
`.claude/agents/leader.md` first. The SessionStart hook has already run
`pnpm install`. Identify the merged PR and derive `NAME` from its head branch.
Work from the default branch (the merge is already in it).

## Case A — merged head was `claude/spec/<NAME>` (approval → implement)

This is the leader's "spec_ready, human just approved" transition. Do NOT
archive at the end — leave that to the impl-PR merge so a human ships it.

1. `touch openspec/changes/$NAME/APPROVED`.
2. Create a run dir:
   `mkdir -p openspec/changes/$NAME/runs/$(date -u +%Y-%m-%dT%H-%M-%SZ)` and note
   the path as `RUN`.
3. Create and switch to a branch `claude/impl/$NAME`. Commit the `APPROVED`
   marker and the empty run dir scaffold.
4. Launch the **`implementer`** subagent (Task tool) with `$NAME` and `$RUN`,
   instructing it to follow its agent spec — write code + tests and commit
   **only** via `scripts/committer --design openspec/changes/$NAME/design.md`.
5. When it returns `done`, launch the **`reviewer`** subagent on `$RUN` (T1/T2/T3
   per its spec). Read the resulting `review.md`.
6. Push `claude/impl/$NAME` and open a PR into the default branch:
   - **Title:** `Implement: $NAME`
   - **Body:** the reviewer verdict and per-tier summary, then verbatim:
     _"Merging ships this feature — the `advance on merge` routine will archive
     the change and author the next spec."_
   - If the verdict was `CHANGES_REQUESTED`, prefix the title with `[changes
requested]` and leave the PR as a draft so it is not merged by mistake.
7. Stop. Report the PR URL. Do not archive.

## Case B — merged head was `claude/impl/<NAME>` (ship → archive + next)

1. Move the change to the archive:
   `mv openspec/changes/$NAME openspec/archive/$(date -u +%Y-%m-%d)-$NAME`.
2. Append a one-line summary of `$NAME` to `openspec/progress/history.md` and
   reset `openspec/progress/current.md`.
3. Confirm a `.changeset/` entry exists for `$NAME` (the implementer should have
   added one); if missing, add a minimal changeset describing the change.
4. Commit the archive move on a branch `claude/advance/$NAME`, push, and open a
   PR titled `Archive: $NAME` into the default branch (this lands the
   bookkeeping; merge it from your phone).
5. Then run the **author-next-spec** flow (see `01-author-next-spec.md`): pick the
   new lowest-id `pending` feature, author its spec on `claude/spec/<next>`, and
   open its `Spec:` PR. If nothing is pending, stop and report "queue drained".

For any other head branch, stop and report "not a harness PR — skipping".

Hard rules: never edit `openspec/feature_list.json`; never skip the
`scripts/committer --design` path for source changes; one feature per run.
