# Create-Shim Boundary

`create-astro-ignite` is a **thin shim**, not the scaffolder. It exists
only because npm's `create-*` convention requires a package named
`create-astro-ignite` for `npm create astro-ignite` to work. All real
logic — prompts, templates, scaffolding, `package.json` rewriting —
lives in the sibling `astro-ignite` package.

## What it does

`src/index.ts` is the entire package: it `spawnSync`s
`npx --yes astro-ignite@<version> bootstrap <…args>` and forwards the
exit code. The version spec defaults to `latest` and is overridable via
`ASTRO_IGNITE_VERSION` (the per-PR beta pipeline sets this).

- **Bin:** `create-astro-ignite` → `./dist/index.js`
- **No dependencies.** It shells out to `npx`; it imports nothing from
  `astro-ignite` at build time.
- **Versioning:** publishes at the same version as `astro-ignite` (the
  two are `linked` in `.changeset/config.json`).

## Boundary Rules

- Keep this package logic-free. Anything about prompts, templates, or
  scaffold behavior belongs in **`packages/astro-ignite/`** — see its
  AGENTS.md and `openspec/specs/cli-scaffold/spec.md`.
- The only reason to touch `src/index.ts` is to change how the shim
  resolves/launches the real CLI (version spec, subcommand, arg
  forwarding).

## Where the real work is

→ `packages/astro-ignite/` — the CLI core (entrypoint, `prompts.ts`,
`scaffold.ts`, `pm.ts`, `git.ts`, `types.ts`, `scaffold.test.ts`, and
the `copy-templates` prepack).
