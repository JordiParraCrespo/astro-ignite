# Routine — Dispatch issues

Paste this as the **Instructions** of a routine named `Harness — dispatch
issues`. This is the entry point: **GitHub issues are the work queue, labels are
the controls.** Attach a **Schedule** trigger (e.g. hourly — "integrated with
Claude schedule") so it polls on its own, plus an **API** trigger and use **Run
now** to dispatch on demand. GitHub triggers can't fire on issue events, so the
schedule (or the optional `.github/workflows/issue-dispatch.yml` → API bridge) is
what turns an issue into work.

## Labels (create these once on the repo)

| Label         | Who sets it  | Meaning                                                                                                                     |
| ------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `flow:direct` | you          | Build the change straight from the issue, then review.                                                                      |
| `flow:spec`   | you          | Spec-driven: draft spec → you review/edit → code → review.                                                                  |
| `aig:active`  | this routine | Currently being worked — prevents a second run picking it. You remove it to allow a retry (e.g. after `CHANGES_REQUESTED`). |
| `aig:blocked` | any agent    | Needs your input; quote the question on the issue. You remove it after answering to re-dispatch.                            |

## Conventions

- Branch per issue: `claude/direct/issue-<N>`, `claude/spec/issue-<N>`,
  `claude/impl/issue-<N>`.
- Change folder name for spec flow: `issue-<N>-<kebab-title>` (call it `NAME`).

---

You dispatch GitHub issues into the astro-ignite harness. Read `CLAUDE.md` and
the agent specs in `.claude/agents/` first. The SessionStart hook already ran
`pnpm install` and printed `pnpm queue`.

1. **Pick the target issue.**
   - If the trigger text names an issue (e.g. `issue #N` or `#N`), use that one.
   - Otherwise list **open** issues that have a `flow:direct` or `flow:spec`
     label and have **neither** `aig:active` nor `aig:blocked`, oldest first, and
     take the first.
   - Either way, **skip** an issue carrying `aig:blocked` (waiting on the human)
     or `aig:active` — even when the trigger names it. One exception: an
     `aig:active` issue with **no open `claude/*/issue-<N>` PR** is a stale lock
     from a run that died; remove `aig:active` and take it.
   - If there is none, stop and report "no labelled issues to dispatch".
2. Read the issue title + body — that is the task. Add the **`aig:active`** label
   immediately so a concurrent run skips it.
3. **Route by label** (if both are present, prefer `flow:spec`):

### `flow:direct` → direct build

1. Create branch `claude/direct/issue-<N>` — or, if it already exists (a
   re-dispatch), check it out and continue on it; see **Re-dispatch** below.
2. Launch the **`implementer`** subagent (Task tool): _"Build the change
   described in GitHub issue #<N> (title + body below). There is no openspec
   design for this direct task, so commit with `scripts/committer "<msg>"
<paths>` (NO `--design`) — still never `git add .`. Write tests for the
   behaviour. Keep the change scoped to exactly what the issue asks; if it's
   under-specified, report `blocked` with the question instead of guessing."_
   Paste the issue body.
   - If it reports `blocked`, comment the question on issue #<N>, remove
     `aig:active`, add `aig:blocked`, and stop — no PR.
3. When it returns, launch the **`reviewer`** subagent for a general review (no
   spec, so no `S<n>`/`I<n>` traceability): run `pnpm typecheck && pnpm test`,
   and additionally `pnpm audit:invariants` + `pnpm perf:budget` **if** the diff
   touched `packages/templates/**` or `packages/registry/**`. Have it report
   `APPROVED` / `CHANGES_REQUESTED` with each blocker as a `file:line` ref.
4. Push the branch and open a PR:
   - **Title:** `Direct: #<N> <title>`
   - **Body:** `Closes #<N>`, then the review verdict + summary, then verbatim:
     _"Merging ships this and closes the issue."_
   - If `CHANGES_REQUESTED`, prefix the title with `[changes requested]` and open
     it as a draft.
5. Stop. Report the PR URL.

### `flow:spec` → spec-driven

1. Create branch `claude/spec/issue-<N>` — or, if it already exists (a
   re-dispatch), check it out and continue on it; see **Re-dispatch** below.
   `NAME = issue-<N>-<kebab-title>`.
2. Launch the **`spec_author`** subagent: _"Treat GitHub issue #<N> (below) as
   the feature to spec — the issue body is the acceptance source, so skip the
   `feature_list.json` precondition. Write
   `openspec/changes/<NAME>/{proposal,design,tasks,specs/<capability>/spec.md}`
   and stop. Do not create APPROVED or runs/."_ Paste the issue body.
3. If it returns `blocked`, commit the `BLOCKED.md`, comment the question on the
   issue, remove `aig:active`, add `aig:blocked`, push, open a
   `Spec (blocked): #<N>` PR, and stop.
4. Otherwise commit the change folder, push, and open a PR:
   - **Title:** `Spec: #<N> <title>`
   - **Body:** a one-paragraph proposal summary, the issue's acceptance as a
     checklist, then verbatim: _"Review the spec and **edit `tasks.md` / the spec
     files in this PR** as needed, then merge to approve — merging triggers the
     implementer + reviewer."_ Do **not** add `Closes #<N>` (the spec PR is the
     approval gate, not the ship).
5. Stop. Report the PR URL.

### Re-dispatch (retry / steer)

An issue becomes dispatchable again when the human removes `aig:active` (after a
`CHANGES_REQUESTED` review) or `aig:blocked` (after answering the question). If
the flow's branch already exists, do **not** start over: check it out, collect
the work list from the open PR's review comment plus any new issue comments, and
pass that to the same subagent as the things to address. Push to the existing
branch — the review routine re-runs on `synchronize`. If the new verdict is
`APPROVED` and the PR is a draft, mark it ready for review and drop the
`[changes requested]` title prefix.

Process **one** issue per run (the schedule fires regularly). Hard rules: never
create `APPROVED` here; never edit `openspec/feature_list.json`; always respect
`aig:active` and `aig:blocked`.
