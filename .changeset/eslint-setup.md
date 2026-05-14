---
'astro-ignite': patch
---

Wire up ESLint across the monorepo and ship a working lint setup in every scaffolded project.

- Add `eslint@9` flat config with `typescript-eslint`, `eslint-plugin-astro`, and `eslint-plugin-jsx-a11y` at the repo root.
- Add a self-contained `eslint.config.js` + `eslint` devDependencies to both templates (starter, docs) so users get `pnpm lint` working out of the box.
- Wire `pnpm lint` into the CI `lint-typecheck` job.
- Clean up dangling `// eslint-disable-next-line no-console` directives and convert `var` → `const` in inline Plausible scripts.
