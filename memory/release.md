# Release flow

`create-astro-ignite` is the only published package. The release flow is modeled on `shadcn-ui/ui`: two parallel paths share `.github/workflows/release.yml`.

## TL;DR

- **Stable** → merge to `main` → action opens/updates a Version Packages PR → merge that PR → published as `@latest`.
- **Beta** → label any PR with `🚀 autorelease` → published as `0.0.0-beta.<sha>` with dist-tag `beta`.

## Stable releases

Triggered by every push to `main`. The `changesets/action` does the work.

```
write changes  →  pnpm changeset  →  git push to feature branch  →  PR + merge
                                                                       │
                                                                       ▼
                                              workflow runs on main, action sees
                                              pending changesets, opens/updates
                                              "Version Packages" PR (branch:
                                              changeset-release/main)
                                                                       │
                                                                       │ (whenever ready to ship)
                                                                       ▼
                                                       merge the Version Packages PR
                                                                       │
                                                                       ▼
                                              workflow runs again, no pending
                                              changesets remain → action calls
                                              `pnpm changeset publish` →
                                              `create-astro-ignite@X.Y.Z` to
                                              npm dist-tag `latest`
```

Key implementation detail: the `version` step calls `.github/changeset-version.js` (not plain `changeset version`). That script also runs `pnpm install --lockfile-only` so the Version Packages PR doesn't carry a stale `pnpm-lock.yaml`.

## Beta releases

Triggered by adding the **`🚀 autorelease`** label to any open PR against `main`.

```
open a PR with your changes  →  add the "🚀 autorelease" label
                                          │
                                          ▼
                              workflow's `prerelease` job runs:
                                1. checkout PR head
                                2. node .github/version-script-beta.js
                                   → rewrites packages/create-astro-ignite/
                                     package.json version to
                                     `0.0.0-beta.<short-sha>`
                                3. pnpm --filter create-astro-ignite build
                                4. cd packages/create-astro-ignite &&
                                   npm publish --tag beta --access public
                                5. uploads dist/index.js as a workflow
                                   artifact named with the PR number
```

The version bump is NOT committed — it only exists in the published tarball. Each push to the PR can re-publish by removing and re-adding the label.

Install a beta with:

```bash
npm create astro-ignite@beta              # latest beta
npm create astro-ignite@0.0.0-beta.abc123 # pin to a specific PR build
```

Beta versions never become `@latest`. Users have to opt in.

## Writing a changeset

For every change that should ship to users:

```bash
pnpm changeset
```

Interactive prompt: pick the bump type (`patch` | `minor` | `major`) and write a one-line summary. A markdown file lands in `.changeset/`. Commit it alongside your code change.

Bump-type rules of thumb:
- `patch` — bug fix, doc fix, internal refactor with no behavior change.
- `minor` — new feature, new template, new prompt, new flag.
- `major` — breaking change to CLI flags, generated project layout, or template contract.

## Files involved

| Path | Purpose |
|---|---|
| `.github/workflows/release.yml` | The two-job workflow. |
| `.github/changeset-version.js` | Stable: `changeset version` + refresh lockfile. |
| `.github/version-script-beta.js` | Beta: rewrite version to `0.0.0-beta.<sha>`. |
| `.changeset/config.json` | changesets config (access, ignore list, base branch). |
| `.changeset/*.md` | Pending change descriptions, consumed at release time. |

## Required setup (one-time)

- Repository secret **`NPM_TOKEN`** — npm Automation token (skips 2FA, required for CI). Currently created May 12, 2026, expires May 19, 2026 — **rotate to a longer-lived token after first successful publish**.
- Repository label **`🚀 autorelease`** — already created (green, color `0E8A16`).
- Settings → Actions → General → Workflow permissions → **Allow GitHub Actions to create and approve pull requests** must be checked, or the Version Packages PR will fail to open.

## Troubleshooting

- **"GitHub Actions is not permitted to create or approve pull requests"** — flip the toggle above.
- **`npm ERR! 403 Forbidden`** on publish — token expired or wrong scope. Generate a fresh **Automation** token (not "Read-only", not "Publish") and update `NPM_TOKEN`.
- **No Version Packages PR appears** after merging changesets to `main` — check `.changeset/` actually contains `.md` files other than `README.md` and `config.json`. The action only opens a PR when there are unconsumed changesets.
- **Beta job didn't run after labeling** — confirm the label is `🚀 autorelease` exactly (the rocket emoji + a single space + `autorelease`), and that the PR targets `main`. Also: forks don't get publishing access; check `github.repository_owner` matches.

## Future upgrades (not done yet)

- Switch from `NPM_TOKEN` to **npm OIDC trusted publishers** so there's no long-lived secret in the repo. Requires configuring the trusted publisher on the npm package page + adding `permissions: id-token: write` (already present) and `npm install -g npm@latest` to the workflow.
- GPG-sign release commits and tags (shadcn does this — cosmetic "Verified" badge).
- Add a second binary `astro-ignite` for repeat-use commands (`astro-ignite add ...`, `astro-ignite upgrade`) once such commands exist. Keep `create-astro-ignite` for first-time scaffolding.
