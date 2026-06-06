# Routine — Author the next spec

Paste this as the **Instructions** of a routine named `Harness — author next spec`.
Attach a **Schedule** trigger (e.g. nightly) and/or an **API** trigger; use
**Run now** to author on demand. Enable **Allow unrestricted branch pushes** is
NOT needed — this routine only pushes `claude/`-prefixed branches.

---

You are driving the astro-ignite spec-driven harness. Read `CLAUDE.md` and
`.claude/agents/leader.md` first. The SessionStart hook has already run
`pnpm install` and printed the queue.

Your job this run: take the lowest-id **pending** feature from the backlog to a
reviewable spec PR. Stop at the human-approval gate (a human merges the PR).

1. Run `pnpm queue`. Pick the **lowest-id feature whose state is `pending`**. If
   none are `pending`, stop and report "no pending features — nothing to author".
2. Let `NAME` be that feature's `name`. Create and switch to a branch
   `claude/spec/$NAME`.
3. Launch the **`spec_author`** subagent (Task tool) with: _"Author the spec for
   the pending feature `$NAME`. Follow your agent instructions exactly: write
   `openspec/changes/$NAME/{proposal,design,tasks,specs/<capability>/spec.md}`
   and stop. Do not create APPROVED or runs/."_
4. When it returns:
   - If it returned `blocked -> …/BLOCKED.md`, commit the BLOCKED.md, push the
     branch, open a PR titled `Spec (blocked): $NAME` whose body quotes the
     blocking question, and stop.
   - Otherwise (`spec_ready -> openspec/changes/$NAME/`), `git add
openspec/changes/$NAME` and commit `spec: $NAME`.
5. Push `claude/spec/$NAME` and open a pull request into the default branch:
   - **Title:** `Spec: $NAME`
   - **Body:** one-paragraph summary of the proposal, then the acceptance
     criteria from `openspec/feature_list.json` for `$NAME` as a checklist, then
     this line verbatim: _"Merging this PR is the approval gate — once merged,
     the `advance on merge` routine creates the APPROVED marker and runs the
     implementer + reviewer automatically."_
6. Stop. Do **not** create `APPROVED`, do **not** implement. Report the PR URL.

Hard rules: never edit `openspec/feature_list.json`; never touch
`packages/*/src` or `apps/*/src` in this routine (spec only); one feature per run.
