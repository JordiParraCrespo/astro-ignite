# Design: lint-auto-fix-tailwind-canonical-class-i

## Approach

Wire `eslint-plugin-better-tailwindcss` into the existing root flat config,
configure three auto-fixable rules at `error`, run the auto-fix sweep once
across every linted source tree, and refresh the CLI cache. The plugin's
`entryPoint` setting is configured per-template so the rules see each
template's own `src/styles/global.css` (where the `@theme` tokens live).

The auto-fixer is deterministic — every rewrite is a semantic no-op at the
Tailwind compiler level (long form and short form expand to identical CSS).
Visual parity, not styling redesign, is the gate.

## Files touched

```
MOD package.json
MOD eslint.config.js
MOD pnpm-lock.yaml
MOD packages/templates/starter/src/**/*.astro                (auto-fix sweep)
MOD packages/templates/docs/src/**/*.astro                   (auto-fix sweep)
MOD packages/registry/base/**/*.astro                        (auto-fix sweep)
MOD apps/site/src/**/*.astro                                 (auto-fix sweep)
MOD apps/docs/src/**/*.astro                                 (auto-fix sweep)
MOD packages/astro-ignite/templates/starter/src/**/*.astro   (cache refresh)
MOD packages/astro-ignite/templates/docs/src/**/*.astro      (cache refresh)
NEW .changeset/lint-auto-fix-tailwind-canonical-class-i.md
```

No files are deleted. No `src/styles/global.css`, no `tailwind.config`,
no `package.json` under `packages/templates/*` or `apps/*` is touched — the
plugin is devDependencies-only at the workspace root.

## New signatures

### Root `package.json`

```jsonc
{
  "scripts": {
    // existing scripts stay the same
    "lint:fix": "pnpm -r --filter=!playground exec eslint . --fix",
  },
  "devDependencies": {
    // existing devDeps stay the same
    "eslint-plugin-better-tailwindcss": "<pinned exact version>",
  },
}
```

`lint:fix` mirrors the existing `lint` script's filter — recursive across
the workspace, `apps/playground/` excluded — so it auto-fixes every package
that already runs ESLint.

### Root `eslint.config.js`

Append a new flat-config block after the existing astro block:

```js
import betterTailwind from 'eslint-plugin-better-tailwindcss';

// inside tseslint.config(...)
{
  files: ['**/*.{astro,ts,tsx,js,mjs,jsx}'],
  plugins: { 'better-tailwindcss': betterTailwind },
  settings: {
    'better-tailwindcss': {
      // Resolved per-package by ESLint walking up from the linted file.
      // Each template owns its own @theme tokens; the plugin uses the
      // closest global.css it finds.
      entryPoint: 'src/styles/global.css',
    },
  },
  rules: {
    'better-tailwindcss/enforce-shorthand-css-variables': 'error',
    'better-tailwindcss/sort-classes': 'error',
    'better-tailwindcss/no-unnecessary-whitespace': 'error',
  },
},
```

The `entryPoint` is a path relative to each linted file's nearest
package root, so `packages/templates/starter/src/components/common/Hero.astro`
resolves to `packages/templates/starter/src/styles/global.css`, while
`apps/site/src/pages/index.astro` resolves to `apps/site/src/styles/global.css`.
This is the plugin's documented behavior — no per-package override array is
needed.

If the plugin requires explicit per-package overrides (i.e. it does not walk
up from the linted file), the implementer falls back to a `files: [...]`
overrides array, one block per template / app, each pointing at its own
`global.css`. That alternative is recorded in `Rejected alternatives` below.

## Invariants this change touches

| Id                                                                    | Statement                                                                                                                                                                                                          | Audit                                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `templates-css-tokens / I1`                                           | No raw zinc / hex in component files                                                                                                                                                                               | `node scripts/audit/tokens-only.mjs`                                               |
| `templates-css-tokens / I5` (NEW — added in this change's spec delta) | Tailwind class strings use the v4 canonical shorthand for CSS variables; the workspace ESLint config enforces it via `better-tailwindcss/{enforce-shorthand-css-variables,sort-classes,no-unnecessary-whitespace}` | `pnpm lint` (exits 0 with no `better-tailwindcss` errors)                          |
| `templates-perf / I5`                                                 | No undeclared runtime dep added since last archive                                                                                                                                                                 | `node scripts/perf/run.mjs --deps` (the new ESLint plugin is devDependencies-only) |

The change cites the existing `templates-css-tokens / I1` to confirm the
auto-fix sweep does not introduce raw zinc / hex (it only rewrites
arbitrary-value class shapes, never the token identifier). The new `I5` is
added under `templates-css-tokens` in this change's spec delta — see
`specs/templates-css-tokens/spec.md` — and is what `eslint .` enforces going
forward.

The implementer runs both audits after the sweep:

```bash
pnpm audit:invariants --change lint-auto-fix-tailwind-canonical-class-i
pnpm lint
```

Both must exit 0.

## Performance budget applicability

The change ships zero runtime code into any template — `eslint-plugin-better-tailwindcss`
is devDependencies-only at the root. The auto-fix sweep rewrites class
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
   Worse, it conflicts with `better-tailwindcss/sort-classes` — two sorters
   compete on every save. Picking the ESLint plugin gives both class
   sorting **and** canonical-form rewrites in one source of truth.
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
5. **Add a per-package `files: [...]` override array.** Reserved as the
   fallback only if the plugin's path-walk `entryPoint` resolution does not
   reach into each template's `global.css` from inside a `.astro` file.
   Single global `entryPoint` is preferred for diff economy.
