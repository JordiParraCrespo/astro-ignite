# Routine — Review a harness PR

Paste this as the **Instructions** of a routine named `Harness — review PR`.
Attach a **GitHub** trigger: event **Pull request**, actions `opened` +
`synchronize`, base branch `main`. Add a head-branch filter `starts with`
`claude/` so it only reviews harness PRs.

One routine, three PR kinds, routed by head-branch prefix:

- `claude/spec/issue-<N>` → **spec PR** (approval gate): sanity-check the spec,
  no tests.
- `claude/impl/issue-<N>` → **implementation PR** (spec flow): full three-tier
  review.
- `claude/direct/issue-<N>` → **direct PR** (no spec): general gate review.

---

You are the reviewer for the astro-ignite harness. Read `CLAUDE.md`,
`.claude/agents/reviewer.md`, and `.claude/agents/leader.md` first. The
SessionStart hook has already run `pnpm install`.

Identify the triggering PR (number, head branch) and the linked issue number
`<N>` from the branch. Post exactly **one** PR comment with your verdict; never
edit code, never merge, never submit a GitHub review (the human approves by
merging).

**Skip duplicate reviews.** Direct and implement PRs are reviewed by the routine
that creates them — their opening body already carries a verdict. If the trigger
action is `opened` and the PR body contains `APPROVED` or `CHANGES_REQUESTED`,
stop and report "reviewed at creation — skipping"; review those PRs only on
`synchronize`. Spec PRs open unreviewed, so always review their `opened` event.

**Report skipped tiers explicitly.** If Chrome is unavailable in this
environment, `pnpm perf:budget` records a skip — say
`perf: skipped (no Chrome; Lighthouse CI is the authoritative gate)` in the
comment rather than omitting the tier.

## `claude/spec/issue-<N>` — spec readiness check (no code yet)

1. Find the change folder `openspec/changes/issue-<N>-*/` and read
   `{proposal,design,tasks}.md`. Fetch GitHub issue #<N> for the acceptance
   source.
2. Verify: every acceptance point in the issue is covered by ≥1 `S<n>` scenario
   in `proposal.md`; `design.md` lists "Files touched" with `NEW`/`MOD`/`DEL`
   prefixes and cites the `I<n>` invariants from the relevant
   `openspec/specs/<capability>/spec.md`; `tasks.md` maps each task to an
   `S<n>`/`I<n>`.
3. Comment a verdict line `Spec review: READY` or `Spec review: GAPS`, then a
   short bullet list of gaps with `file:line` refs. Remind: _"edit `tasks.md` in
   this PR before merging if you want to steer the implementation."_

## `claude/impl/issue-<N>` — full three-tier review (spec flow)

1. Find the newest run dir under `openspec/changes/issue-<N>-*/runs/<ts>/` (or
   under `openspec/archive/*issue-<N>-*/runs/` if already archived on the branch)
   and let `NAME` be that change-folder name.
2. Launch the **`reviewer`** subagent (Task tool) with `NAME` and the run-dir
   path, instructing it to follow its agent spec exactly: T1 `pnpm typecheck &&
pnpm test`, T2 `pnpm audit:invariants --change <NAME>`, T3 `pnpm perf:budget
--change <NAME>` when applicable. It writes `review.md`.
3. Read `review.md`; comment its verdict (`APPROVED` / `CHANGES_REQUESTED`), the
   per-tier summary (test/audit/perf), and every blocker with a `file:line` ref.

## `claude/direct/issue-<N>` — general gate review (no spec)

1. There is no spec/run dir. Launch the **`reviewer`** subagent for a general
   pass: `pnpm typecheck && pnpm test`, plus `pnpm audit:invariants` and `pnpm
perf:budget` **if** the diff touched `packages/templates/**` or
   `packages/registry/**`. No `S<n>`/`I<n>` traceability is expected.
2. Comment the verdict (`APPROVED` / `CHANGES_REQUESTED`) and each blocker with a
   `file:line` ref.

For any other head branch, stop and report "not a harness PR — skipping".
