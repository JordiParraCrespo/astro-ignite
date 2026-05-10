# Contributing to astro-ignite

Thanks for your interest. This document covers local setup, the dev loop for each package, and how to ship changes.

## Prerequisites

- Node 20.11+ or 22 LTS
- pnpm 9+ (the repo pins it via `packageManager` in `package.json`)
- git

```bash
corepack enable
pnpm install
```

## Repo layout

```
packages/
  create-astro-ignite/     # the CLI
  template/                # the Astro template
apps/
  playground/              # CI smoke target — gets recreated by CI
  docs/                    # Starlight docs site
plan.md                    # full design spec
```

## Dev loops

### Iterate on the template

```bash
pnpm dev
```

This runs `astro dev` inside `packages/template/`. The template is a working Astro project — open the URL, see what users will see.

### Iterate on the CLI

```bash
pnpm dev:cli
```

Builds the CLI in watch mode. To exercise it end-to-end:

```bash
pnpm scaffold:test
```

This wipes `apps/playground/`, runs the CLI with `--yes` against it, installs deps, builds, and runs Lighthouse.

### Iterate on docs

```bash
pnpm dev:docs
```

## Testing

```bash
pnpm test                  # everything
pnpm --filter create-astro-ignite test    # CLI unit tests only
```

CI runs the full e2e scaffold + build + Lighthouse on every PR. Local Lighthouse is optional but recommended for perf-touching changes.

## Coding conventions

- **TypeScript everywhere.** Strict mode in both the CLI and template.
- **Prettier** auto-formats on commit via `simple-git-hooks`.
- **No new runtime dependencies in the template** without justification — the perf pitch depends on a small, owned codebase.
- **Above-the-fold components use scoped `<style>` blocks**; below-the-fold uses Tailwind. See `plan.md` §6.
- **Comments only when the why is non-obvious.** Don't restate what the code says.

## Submitting changes

1. Fork + branch
2. Make your change
3. Add a changeset: `pnpm changeset` (describe impact: patch/minor/major)
4. Open a PR
5. CI must pass: lint, typecheck, tests, e2e scaffold, Lighthouse ≥95 mobile

PRs that touch the template or CLI without a changeset will be asked to add one.

## Reporting issues

Open an issue with:

- What you expected
- What happened
- Minimal repro (a `pnpm create astro-ignite@latest my-test` walkthrough showing the issue is best)
- Node + pnpm version

For perf regressions specifically, include the Lighthouse JSON from the failing run.

## Code of Conduct

Be kind. We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

## License

By contributing, you agree your contributions will be licensed under the project's MIT license.
