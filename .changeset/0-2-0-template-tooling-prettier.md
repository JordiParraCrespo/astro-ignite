---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Templates: ship Prettier alongside ESLint — the lint+format toolchain is now complete out of the box.** Both scaffolded templates (`starter`, `docs`) gain a `.prettierrc.json` (with `prettier-plugin-astro`), a `.prettierignore`, and `format` / `format:check` scripts. `prettier` + `prettier-plugin-astro` ship as devDependencies (no new runtime dep). A fresh scaffold passes its own `format:check` and `lint` with zero errors and zero warnings.

The `.prettierignore` mirrors the monorepo's exclusions for the handful of components with inline `<script>` blocks that `prettier-plugin-astro` can't reliably parse (e.g. `Analytics.astro`, `BaseLayout.astro`), plus content collections and the embedded-code docs guides — so formatting stays clean instead of fighting the parser.

Internal verification hardening (does not affect scaffolded output): `packages/registry` is now a workspace package with `lint` and `typecheck` scripts, and the `better-tailwindcss` canonical-class-order rules run on the atom source for real (resolving the missing Tailwind entry point). This closed a blind spot — the registry atoms had drifted from the canonical class order their template mirrors enforce; they're now realigned.
