---
'@astro-ignite/template-starter': patch
'@astro-ignite/template-docs': patch
'astro-ignite': patch
'create-astro-ignite': patch
---

chore: enforce Tailwind v4 canonical CSS-variable class syntax (lint hardening)

Wires `eslint-plugin-better-tailwindcss` into the workspace and the scaffolded
templates with three auto-fixable rules at `error`, then rewrites every
convertible class to the Tailwind v4 short form:

- `enforce-consistent-variable-syntax` — `bg-[var(--color-bg)]` → `bg-(--color-bg)`
- `enforce-consistent-class-order` — canonical class ordering
- `no-unnecessary-whitespace` — collapses stray whitespace in `class="…"`

The rewrite is a semantic no-op: long form and short form compile to identical
CSS (verified by comparing the built declaration set per page — unchanged).
Class strings are shorter, diffs stay clean, and `pnpm lint` now gates the
canonical form so the long form can't creep back in. A new `pnpm lint:fix`
resolves any drift in one command. No runtime dependency is added — the plugin
is a `devDependency` only.

Non-breaking for downstream users. If you scaffolded an earlier version and
want the same gate, opt in with:

```bash
pnpm add -D eslint-plugin-better-tailwindcss
# add the better-tailwindcss block to your eslint.config.js (see the template)
pnpm lint:fix
```
