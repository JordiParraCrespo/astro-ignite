# Driving the harness from your phone — issues in, PRs out

This folder turns the astro-ignite harness into a phone-operable autopilot built
on [Claude Code Routines](https://code.claude.com/docs/en/routines). **GitHub
issues are the work queue; labels are the controls.** You file an issue, label it
with a flow, and routines do the rest — you only read PRs and tap **Merge**.

## Two flows, chosen by label

| Label         | Flow                                                                                                                                                     |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flow:direct` | An agent builds the change straight from the issue → reviewer → **Direct** PR. You merge to ship.                                                        |
| `flow:spec`   | Agent drafts a spec → **you review & edit `tasks.md`** in the Spec PR → merge → another agent codes it → reviewer → **Implement** PR. You merge to ship. |

```
                          file an issue + add a flow: label
                                        │
                        ┌──────────── dispatch (schedule / API) ────────────┐
                        │                                                    │
                 flow:direct                                          flow:spec
                        │                                                    │
                Direct PR  ──► review ──► you MERGE ──► ships          Spec PR ──► review
                                                                            │
                                            you review + edit tasks.md, MERGE = approve
                                                                            │
                                                Implement PR ──► review ──► you MERGE ──► ships + archive
```

Native GitHub triggers fire on PR/release events only, so the **dispatch** step
(issue → work) runs on a **schedule** (or the optional Action below); the
**review** and **merge→advance** steps ride native PR triggers.

## The routines

| Routine                      | Instructions file        | Trigger                                                           |
| ---------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `Harness — dispatch issues`  | `01-dispatch-issues.md`  | **Schedule** (e.g. hourly) + **API**; **Run now** to dispatch now |
| `Harness — review PR`        | `02-review-pr.md`        | **GitHub** PR `opened`+`synchronize`, base `main`, head `claude/` |
| `Harness — advance on merge` | `03-advance-on-merge.md` | **GitHub** PR `closed`, **Is merged**=true, base `main`           |

Branch / PR conventions the routines rely on:

| Branch                     | PR title            | Merging it…                         |
| -------------------------- | ------------------- | ----------------------------------- |
| `claude/direct/issue-<N>`  | `Direct: #<N> …`    | ships + closes the issue            |
| `claude/spec/issue-<N>`    | `Spec: #<N> …`      | approves the spec → triggers code   |
| `claude/impl/issue-<N>`    | `Implement: #<N> …` | ships + closes the issue + archives |
| `claude/advance/issue-<N>` | `Archive: #<N> …`   | lands the archive bookkeeping       |

## One-time setup (all from a phone browser)

1. **Install the Claude GitHub App** on `JordiParraCrespo/astro-ignite` — PR
   triggers require it. The trigger form prompts you if it's missing.
2. **Create the four labels** on the repo: `flow:direct`, `flow:spec`,
   `aig:active`, `aig:blocked` (Issues → Labels, or let the dispatch routine
   create them on first run).
3. At **[claude.ai/code/routines](https://claude.ai/code/routines)** → **New
   routine**, create the three routines above. For each: set the repo to
   `astro-ignite`, paste the matching file as Instructions, pick the **Default**
   environment (Trusted network is enough), and add the trigger from the table.
4. Leave **Allow unrestricted branch pushes** OFF — every routine pushes only
   `claude/`-prefixed branches.

## Day-to-day, from your phone

1. **File an issue**, write the task in the body, add `flow:direct` or
   `flow:spec`.
2. The **dispatch** routine picks it up (next schedule tick, or tap **Run now**)
   and opens a PR; `aig:active` marks it in-flight.
3. **`flow:direct`:** read the `Direct: #N` PR + review comment → **Merge** to
   ship.
4. **`flow:spec`:** read the `Spec: #N` PR, **edit `tasks.md` / the spec in the
   PR** to steer it, then **Merge** to approve → an `Implement: #N` PR appears
   with a three-tier review → **Merge** to ship.
5. Stuck items get `aig:blocked` with a question on the issue — answer it and
   re-dispatch.

Steer any run live by opening its session in the Claude mobile app.

## Optional: instant dispatch (skip the schedule wait)

`.github/workflows/issue-dispatch.yml` fires the dispatch routine's **API
endpoint** the moment you add a `flow:` label, so you don't wait for the next
schedule tick. It is a safe no-op until you wire two repo secrets:

1. On the `Harness — dispatch issues` routine, add an **API** trigger, copy the
   URL, and **Generate token**.
2. In the repo: **Settings → Secrets and variables → Actions** → add
   `CLAUDE_ROUTINE_URL` (the endpoint) and `CLAUDE_ROUTINE_TOKEN` (the token).

The workflow only POSTs the issue **number** (the routine fetches the body
itself), so no untrusted issue text is interpolated into the request. Both the
Action and the scheduled routine respect `aig:active`, so they won't double-pick
an issue.

## Why these constraints

- **GitHub triggers fire on `pull_request.*` / `release.*` only** — not issues.
  Hence dispatch is schedule/API-driven and approvals are _merges_.
- **Routines are created/edited in the web UI** (phone browser works); CLI
  `/schedule` only creates _schedule_ triggers — add GitHub/API triggers on web.
- **A green run badge ≠ task success.** Open the run transcript to confirm.

## Repo-side enabler

`scripts/cloud/bootstrap.sh` (a `SessionStart` hook wired in
`.claude/settings.json`) runs `pnpm install` and prints `pnpm queue` at the start
of every cloud session, so a routine-triggered session arrives ready. It no-ops
cheaply on local sessions.

> The terminal-driven `leader` + `openspec/feature_list.json` harness still works
> as before for local, roadmap-scoped work — this issue flow sits alongside it.
