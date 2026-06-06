# Driving the harness from your phone

This folder turns the astro-ignite spec-driven harness into a **layered
autopilot** you operate entirely from your phone, using
[Claude Code Routines](https://code.claude.com/docs/en/routines) and GitHub
events. You never open a terminal — you read PRs and tap **Merge** in the GitHub
mobile app (or claude.ai), and routines do the rest.

## The loop

```
            ┌─────────────────────── you, on your phone ───────────────────────┐
            │                                                                   │
  schedule/RunNow                merge "Spec: X"                 merge "Implement: X"
            │                          │                                 │
            ▼                          ▼                                 ▼
   ① author next spec   →   ③ advance: APPROVED + implement   →   ③ advance: archive + author next
   opens "Spec: X" PR           opens "Implement: X" PR              opens "Spec: Y" PR
            │                          │                                 │
            └──► ② review PR ◄─────────┴── ② review PR ◄─────────────────┘
                 (comments verdict on every claude/* PR)
```

Each arrow that says _opens a PR_ is automatic. Each **merge** is you, on your
phone. The harness's human-approval gate (`CLAUDE.md` → Harness) becomes "merge
the spec PR". Branch conventions the routines rely on:

| Branch               | Meaning                          | Merging it…                        |
| -------------------- | -------------------------------- | ---------------------------------- |
| `claude/spec/<X>`    | a drafted spec, awaiting review  | approves the spec → triggers impl  |
| `claude/impl/<X>`    | implementation + tests           | ships the feature → archive + next |
| `claude/advance/<X>` | archive/bookkeeping after a ship | lands the archive move             |

## One-time setup (all doable from a phone browser)

1. **Install the Claude GitHub App** on `JordiParraCrespo/astro-ignite` — GitHub
   triggers require it (`/web-setup` alone does **not** enable webhooks). The
   trigger form prompts you if it's missing.
2. Go to **[claude.ai/code/routines](https://claude.ai/code/routines)** → **New
   routine** and create the three routines below. For each: set the repository to
   `astro-ignite`, paste the matching file in this folder as the Instructions,
   pick the **Default** environment (Trusted network is enough — npm is on the
   allowlist), and add the trigger described.

| Routine name                 | Instructions file        | Trigger                                                               |
| ---------------------------- | ------------------------ | --------------------------------------------------------------------- |
| `Harness — author next spec` | `01-author-next-spec.md` | **Schedule** (e.g. nightly) and/or **API**; use **Run now** on demand |
| `Harness — review PR`        | `02-review-pr.md`        | **GitHub**: Pull request `opened`+`synchronize`, base `main`          |
| `Harness — advance on merge` | `03-advance-on-merge.md` | **GitHub**: Pull request `closed`, filter **Is merged** = true        |

Tip: on the two GitHub routines, add a head-branch filter `starts with`
`claude/` so they ignore unrelated PRs.

3. Leave **Allow unrestricted branch pushes** OFF — every routine pushes only
   `claude/`-prefixed branches, which is the default-allowed scope.

## Day-to-day, from your phone

- **Kick off / keep it moving:** open `Harness — author next spec` and tap **Run
  now**, or let the schedule fire. A `Spec: X` PR appears.
- **Read the spec PR.** `Harness — review PR` posts a `Spec review: READY/GAPS`
  comment. If it looks right, **Merge** → implementation runs automatically and
  an `Implement: X` PR appears with a three-tier review comment.
- **Read the impl PR + review comment.** Green? **Merge** → the change is archived
  and the next spec PR opens. Loop continues until the queue drains.
- **Steer mid-run:** open the routine's run session in the Claude mobile app to
  watch, comment on a diff, or correct course — it's a normal Claude Code session.

## Why these constraints

- **GitHub triggers fire on `pull_request.*` and `release.*` only** — not issues
  or comments. That's why approvals are modeled as _merges_, not issue comments.
- **Routines are created/edited in the web UI** (phone browser works); the CLI
  `/schedule` only creates _schedule_ triggers. Add the GitHub/API triggers on
  the web.
- **A green run status ≠ task success.** Open the run to confirm what Claude did;
  blocked network calls and task failures show in the transcript, not the badge.

## Want less autopilot?

Start with just `Harness — review PR` (it only comments, never merges) to get a
feel for it, then add the author and advance routines once you trust the loop.

## Repo-side enabler

`scripts/cloud/bootstrap.sh` (wired as a `SessionStart` hook in
`.claude/settings.json`) runs `pnpm install` and prints `pnpm queue` at the start
of every cloud session, so a routine-triggered session arrives ready to drive
the harness. It no-ops cheaply on local sessions.
