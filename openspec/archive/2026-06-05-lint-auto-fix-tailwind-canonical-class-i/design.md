# Design: lint-auto-fix-tailwind-canonical-class-i

## Approach

Wire `eslint-plugin-better-tailwindcss` into the ESLint config, configure
three auto-fixable rules at `error`, run the auto-fix sweep once across every
linted source tree, and refresh the CLI cache. Each config block sets the
plugin's `entryPoint` to `src/styles/global.css` so the rules see each
package's own `@theme` tokens.

**Architecture note (corrected during implementation):** the workspace does
**not** use a single root flat config. The `starter` and `docs` templates each
ship their **own** `eslint.config.js` (they're real, owned Astro projects);
`apps/{site,docs}` and the CLI packages inherit the root config. ESLint's flat
config does not cascade, and `pnpm lint` runs `eslint src` per-package, so the
plugin block must be added to **all three** configs (root + the two template
configs). Because the templates ship their config, the plugin is also a
`devDependency` in each template's `package.json` (otherwise a scaffolded
project's `eslint.config.js` would import a missing package).

The auto-fixer is deterministic — every rewrite is a semantic no-op at the
Tailwind compiler level (long form and short form expand to identical CSS).
Visual parity, not styling redesign, is the gate.

## Files touched

```
MOD package.json                                             (root: lint:fix script + devDep)
MOD eslint.config.js                                         (root: plugin block; governs apps/{site,docs} + CLI)
MOD pnpm-lock.yaml
MOD packages/templates/starter/eslint.config.js              (plugin block)
MOD packages/templates/starter/package.json                  (devDep + lint:fix script)
MOD packages/templates/docs/eslint.config.js                 (plugin block)
MOD packages/templates/docs/package.json                     (devDep + lint:fix script)
MOD apps/site/package.json                                   (lint:fix script)
MOD apps/docs/package.json                                   (lint:fix script)
MOD packages/astro-ignite/package.json                       (lint:fix script)
MOD packages/create-astro-ignite/package.json                (lint:fix script)
MOD packages/templates/starter/src/**/*.astro                (auto-fix sweep + Brand.astro length: canonicalization)
MOD packages/templates/docs/src/**/*.astro                   (auto-fix sweep)
MOD apps/site/src/**/*.astro                                 (auto-fix sweep)
MOD apps/docs/src/**/*.astro                                 (auto-fix sweep)
MOD packages/astro-ignite/templates/                         (cache refresh — copy-templates.mjs)
MOD apps/playground/                                         (regenerated from cache — see note below)
NEW .changeset/lint-auto-fix-tailwind-canonical-class-i.md
DEL openspec/changes/lint-auto-fix-tailwind-canonical-class-i/BLOCKED.md
```

`apps/playground/` is normally out of scope, but the `E2E scaffold (pnpm)` CI
job regenerates it from the cache and then runs a workspace `pnpm install`
(frozen by default in CI). With the plugin now in the template `package.json`,
the regenerated playground carries it too, so the committed playground +
`pnpm-lock.yaml` must reflect it — otherwise `--frozen-lockfile` fails. The
playground is regenerated with `node scripts/scaffold-test.mjs --pm=pnpm` (the
same path CI uses); its `.astro` content is the canonical-class output.

No `src/styles/global.css` and no `tailwind.config` is touched.
`packages/registry/base/**` has no arbitrary-CSS-variable classes, so the sweep
does not touch it. The plugin is a `devDependency` only (root + the two
templates) — no runtime dependency is added to any template.

## New signatures

### Root `package.json`

```jsonc
{
  "scripts": {
    // existing scripts stay the same
    "lint:fix": "pnpm -r --filter=!playground lint:fix",
  },
  "devDependencies": {
    // existing devDeps stay the same
    "eslint-plugin-better-tailwindcss": "4.5.0", // pinned exact
  },
}
```

The root `lint:fix` mirrors the existing recursive `lint` (`pnpm -r
--filter=!playground lint`). Each package that defines `lint` (`"eslint src"`)
gains a sibling `"lint:fix": "eslint src --fix"`, so `pnpm lint:fix` is exactly
`pnpm lint` with autofix — same per-package config resolution, `apps/playground`
excluded. (A single root `eslint . --fix` cannot work: flat config does not
cascade, so it would lint every package against the root config with the wrong
`entryPoint`, and would mangle the CLI template cache.)

### ESLint config block (root + each template's `eslint.config.js`)

The same block is added to `eslint.config.js`, `packages/templates/starter/
eslint.config.js`, and `packages/templates/docs/eslint.config.js`:

```js
import betterTailwind from 'eslint-plugin-better-tailwindcss';

// inside tseslint.config(...)
{
  files: ['**/*.astro'],
  plugins: { 'better-tailwindcss': betterTailwind },
  settings: {
    'better-tailwindcss': {
      // ESLint runs `eslint src` from each package dir, so this resolves
      // to that package's own global.css (its @theme token set).
      entryPoint: 'src/styles/global.css',
    },
  },
  rules: {
    'better-tailwindcss/enforce-consistent-variable-syntax': 'error',
    'better-tailwindcss/enforce-consistent-class-order': 'error',
    'better-tailwindcss/no-unnecessary-whitespace': 'error',
  },
},
```

Rule ids are the plugin's published v4 names; the proposal's
`enforce-shorthand-css-variables` / `sort-classes` were guesses at an older
API and do not exist in `eslint-plugin-better-tailwindcss@4.5.0`.

`entryPoint` is resolved against the directory ESLint runs in. Because
`pnpm lint` runs `eslint src` from each package, `entryPoint:
'src/styles/global.css'` resolves to that package's own tokens. Scoping the
block to `**/*.astro` keeps the Tailwind rules off the TS/CLI source (which has
no class strings).

## Invariants this change touches

| Id                                                                    | Statement                                                                                                                                                                                                                     | Audit                                                                              |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `templates-css-tokens / I1`                                           | No raw zinc / hex in component files                                                                                                                                                                                          | `node scripts/audit/tokens-only.mjs`                                               |
| `templates-css-tokens / I5` (NEW — added in this change's spec delta) | Tailwind class strings use the v4 canonical shorthand for CSS variables; the ESLint config enforces it via `better-tailwindcss/{enforce-consistent-variable-syntax,enforce-consistent-class-order,no-unnecessary-whitespace}` | `pnpm lint` (exits 0 with no `better-tailwindcss` errors)                          |
| `templates-perf / I5`                                                 | No undeclared runtime dep added since last archive                                                                                                                                                                            | `node scripts/perf/run.mjs --deps` (the new ESLint plugin is a devDependency only) |

The change cites the existing `templates-css-tokens / I1` to confirm the
auto-fix sweep does not introduce raw zinc / hex (it only rewrites
arbitrary-value class shapes, never the token identifier). The new `I5` is
added under `templates-css-tokens` in this change's spec delta — see
`specs/templates-css-tokens/spec.md` — and is what `pnpm lint` enforces going
forward.

The implementer runs both audits after the sweep:

```bash
pnpm audit:invariants --change lint-auto-fix-tailwind-canonical-class-i
pnpm lint
```

Both must exit 0.

## Performance budget applicability

The change ships zero runtime code into any template — `eslint-plugin-better-tailwindcss`
is a `devDependency` only (workspace root + the two template package.json).
The auto-fix sweep rewrites class
strings into shorter equivalents (short form is byte-for-byte shorter than
long form), which strictly reduces HTML payload size for any class
attribute that contained the long form. The Tailwind compiler emits
identical CSS in both cases, so the compiled stylesheet bytes are unchanged.

Both perf gates run as a sanity check, not as a target:

- Local advisory: `pnpm perf:budget` against the starter and docs templates.
  Lighthouse mobile Performance / Accessibility / Best Practices / SEO ≥ 95
  on `/`, `/blog`, `/projects`, `/about`, `/contact` (starter) and `/`, a
  representative docs guide page (docs template).
- CI authoritative: `.github/workflows/lighthouse.yml` against
  `apps/playground/` after `pnpm scaffold:test` regenerates it from the
  refreshed CLI cache.

A regression here would indicate a bug in the auto-fixer (i.e. it rewrote
a class to a non-equivalent form) and is treated as a stop-the-line bug.

## Rejected alternatives

1. **Add `prettier-plugin-tailwindcss` instead.** Prettier's plugin sorts
   classes but does not rewrite arbitrary values into the v4 shorthand.
   Worse, it conflicts with `better-tailwindcss/enforce-consistent-class-order`
   — two sorters compete on every save. Picking the ESLint plugin gives both
   class sorting **and** canonical-form rewrites in one source of truth.
2. **Add `eslint-plugin-tailwindcss` (the original, not the `better` fork).**
   The original is unmaintained on Tailwind v4; its arbitrary-value rules
   do not understand the v4 `--var` shorthand. The `better-` fork is the
   actively-maintained continuation with explicit v4 support.
3. **Ship a custom auto-fix codemod (jscodeshift or a regex sweep).** A
   regex sweep cannot tell `text-[length:var(--foo)]` (rewriteable) from
   `text-[clamp(1rem,...)]` (not rewriteable) reliably. A jscodeshift codemod
   would need to recreate the Tailwind v4 syntactic rules already encoded
   in `better-tailwindcss`. Reusing the plugin is strictly less code to
   maintain.
4. **Configure the rules as `warn` rather than `error`.** The issue body
   proposes a two-step rollout (warn → sweep → error). This change collapses
   that into one step because the sweep is mechanical and idempotent: once
   the auto-fixer has run, the rules pass everywhere, so the `warn` stage
   has nothing to surface. Shipping at `error` from the first commit makes
   the CI gate authoritative immediately and avoids a follow-up commit
   churn-y enough to merit a separate review.
5. **A single root config with one global `entryPoint`.** Originally
   preferred for diff economy, but rejected once implementation revealed the
   `starter`/`docs` templates ship their own `eslint.config.js` and ESLint's
   flat config does not cascade. The plugin block lives in all three configs
   (root + two templates); `entryPoint: 'src/styles/global.css'` resolves
   per-package because `pnpm lint` runs `eslint src` from each package dir.
6. **`enforce-canonical-classes` instead of `enforce-consistent-variable-syntax`.**
   It would also fix the typed `text-[length:var(--…)]` case, but it
   additionally collapses theme-token arbitraries into named utilities
   (`rounded-[var(--radius-sm)]` → `rounded-sm`), which the issue explicitly
   keeps out of scope. The typed cases (only in `Brand.astro`) are
   canonicalized by hand instead.
