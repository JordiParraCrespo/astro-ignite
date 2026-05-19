# BLOCKED: lint-auto-fix-tailwind-canonical-class-i

**Date:** 2026-05-19
**Run dir:** `openspec/changes/lint-auto-fix-tailwind-canonical-class-i/runs/2026-05-19T16-25-35Z/`

## Blocker

Task **T1 — Add `eslint-plugin-better-tailwindcss` as a root devDep** cannot
complete in the autopilot runner because both `pnpm` and `npm` store/cache
locations are mounted read-only (`EROFS`). The package, its three transitive
dep tarballs (`@eslint/css-tree@^4.0.1`, `@valibot/to-json-schema@^1.6.0`,
`enhanced-resolve`, `jiti`, `synckit`, `tailwind-csstree@^0.3.0`,
`tsconfig-paths-webpack-plugin@^4.2.0`, `valibot@^1.3.1`, plus
`mdn-data`, `json5`, `tsconfig-paths`, `minimist`) cannot be downloaded to
populate the pnpm content-addressed store, so `pnpm-lock.yaml` cannot be
updated and `node_modules/eslint-plugin-better-tailwindcss/` cannot be
materialised.

### Evidence

```
$ pnpm add -D -w eslint-plugin-better-tailwindcss
…
+ eslint-plugin-better-tailwindcss ^4.5.0
Packages: +10
 WARN  GET https://registry.npmjs.org/eslint-plugin-better-tailwindcss/-/eslint-plugin-better-tailwindcss-4.5.0.tgz error (ERR_PNPM_EROFS). Will retry in 10 seconds.
 WARN  GET https://registry.npmjs.org/mdn-data/-/mdn-data-2.28.0.tgz error (ERR_PNPM_EROFS).
 WARN  GET https://registry.npmjs.org/valibot/-/valibot-1.4.0.tgz error (ERR_PNPM_EROFS).
 WARN  GET https://registry.npmjs.org/tsconfig-paths-webpack-plugin/-/tsconfig-paths-webpack-plugin-4.2.0.tgz error (ERR_PNPM_EROFS).
 WARN  GET https://registry.npmjs.org/@valibot/to-json-schema/-/to-json-schema-1.7.0.tgz error (ERR_PNPM_EROFS).
 WARN  GET https://registry.npmjs.org/tailwind-csstree/-/tailwind-csstree-0.3.1.tgz error (ERR_PNPM_EROFS).
 WARN  GET https://registry.npmjs.org/@eslint/css-tree/-/css-tree-4.0.3.tgz error (ERR_PNPM_EROFS).
 ERR_PNPM_EROFS  Failed to add tarball from "https://registry.npmjs.org/mdn-data/-/mdn-data-2.28.0.tgz" to store: EROFS: read-only file system, open '/home/dev/.local/share/pnpm/store/v3/files/bd/f601…'
```

```
$ touch /home/dev/.local/share/pnpm/store/v3/test_write
touch: cannot touch '/home/dev/.local/share/pnpm/store/v3/test_write': Read-only file system
$ touch /home/dev/.npm/test_write
touch: cannot touch '/home/dev/.npm/test_write': Read-only file system
$ touch /home/dev/.config/test
touch: cannot touch '/home/dev/.config/test': Read-only file system
```

`pnpm doctor` confirms the matching warning:

```
⚠️  [npm-cache-writable] npm cache not writable at /home/dev/.npm/_cacache
    (EROFS). npx-driven fetches (Lighthouse, @puppeteer/browsers, etc.) will fail.
    fix: Deploy autopilot/systemd/aig-runner.service and restart aig-runner
    so ReadWritePaths= grants the npm cache write access.
```

### Attempted workarounds (all rejected)

1. **`pnpm config set store-dir /tmp/pnpm-store --global`** — fails because
   `~/.config/pnpm/` cannot be created (read-only).
2. **Project-local `.npmrc` with `store-dir=/tmp/pnpm-store`** — pnpm
   refuses with `ERR_PNPM_UNEXPECTED_STORE` because the existing
   `node_modules` is linked to the old store at
   `~/.local/share/pnpm/store/v3`. The fix it proposes ("reinstall your
   dependencies with `pnpm install`") triggers the same EROFS failure for
   every package, not just the new one.
3. **Manually unpacking `eslint-plugin-better-tailwindcss` (and 9
   transitive deps) into `node_modules/`** would resolve runtime
   imports but (a) doesn't update `pnpm-lock.yaml`, (b) is wiped by the
   next `pnpm install`, and (c) violates the implementer's hard rule
   against improvising around tool failures. Rolled back.

## Question for the human

The fix is documented but lives outside this change's scope:

> Deploy `autopilot/systemd/aig-runner.service` and restart `aig-runner`
> so `ReadWritePaths=` grants write access to:
> - `~/.npm/_cacache/`
> - `~/.local/share/pnpm/store/v3/`
> - `~/.config/pnpm/`

Once the runner can write to the pnpm store, re-dispatch the implementer
for this feature and T1 will complete in a single `pnpm add` invocation.

If the systemd unit is already meant to cover those paths, the
deployed version on this runner is missing those `ReadWritePaths=`
entries — please verify and reload.

## State at block time

- `openspec/progress/current.md` was updated to point at this run dir
  (not reverted — leader can re-use the run dir when the runner is fixed,
  or archive it and create a fresh one).
- No commits made. No spec / template / config files modified.
- `pnpm-lock.yaml` restored to the pre-attempt state (`git checkout --`).
- Hacky manual `node_modules/` entries (cleanup confirmed via
  `git status --short` showing only `openspec/progress/current.md`).
