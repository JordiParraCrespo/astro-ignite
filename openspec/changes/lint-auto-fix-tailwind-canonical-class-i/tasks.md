# Tasks: lint-auto-fix-tailwind-canonical-class-i

Each task records the scenarios (`S<n>`) and invariants (`I<n>`) it covers.
Invariants live in `openspec/specs/templates-css-tokens/spec.md` (and this
change's spec delta under `specs/templates-css-tokens/spec.md`).

- [x] **T1 — Add `eslint-plugin-better-tailwindcss` as a devDep.**
      Pinned to `4.5.0` (no `^` / `~`) at the workspace root **and** in
      `packages/templates/{starter,docs}/package.json` (those templates ship
      their own `eslint.config.js`, so a scaffolded project needs the plugin to
      lint). `pnpm-lock.yaml` updated. Plugin peer `tailwindcss@^4.1.17` is
      satisfied by the installed `4.3.0`.
      Covers: S1, S2, S3, S5, S7. Invariants: `templates-perf / I5`.

- [x] **T2 — Register the plugin in each `eslint.config.js`.**
      Added the same flat-config block to the root config (governs
      `apps/{site,docs}` + CLI) **and** to each template's own
      `eslint.config.js` (flat config does not cascade; `pnpm lint` runs
      `eslint src` per-package). The block:
      a) imports `eslint-plugin-better-tailwindcss`,
      b) registers it under `plugins: { 'better-tailwindcss': … }`,
      c) sets `settings['better-tailwindcss'].entryPoint` to
      `'src/styles/global.css'` (resolved per-package from the dir ESLint runs
      in), scoped to `files: ['**/*.astro']`,
      d) enables `enforce-consistent-variable-syntax`,
      `enforce-consistent-class-order`, and `no-unnecessary-whitespace` at
      `error` (the published v4 rule ids; the proposal's
      `enforce-shorthand-css-variables` / `sort-classes` do not exist in 4.5.0).
      Confirmed `pnpm lint` surfaced the errors before the sweep.
      Covers: S1, S2, S3, S5. Invariants: new `templates-css-tokens / I5`.

- [x] **T3 — Add the `lint:fix` script.**
      Root `"lint:fix": "pnpm -r --filter=!playground lint:fix"`, with a
      sibling `"lint:fix": "eslint src --fix"` in every package that defines a
      `lint` script. (A single root `eslint . --fix` cannot work — flat config
      does not cascade and it would mangle the CLI template cache.) Smoke-tested
      from a clean tree.
      Covers: S1, S2.

- [x] **T4 — Run the auto-fix sweep.**
      Ran the per-package `eslint src --fix` across starter, docs, apps/site,
      apps/docs (128 `.astro` files). Inspected the diff: all changes confined
      to `class="…"` attributes. The typed `text-[length:var(--…)]` cases in
      `Brand.astro` (which `enforce-consistent-variable-syntax` does not
      rewrite) were canonicalized to `text-(length:--…)` by hand.
      Covers: S1, S2, S4. Invariants: `templates-css-tokens / I1`,
      new `templates-css-tokens / I5`.

- [x] **T5 — Visual parity check on the starter and docs templates.**
      Built both templates before/after the sweep. Compared the compiled CSS
      declaration set per page: identical across all 12 starter pages, and
      identical for docs (746 = 746). Only the selectors changed shape (class
      names became shorthand); no declaration was added or dropped.
      Covers: S4.

- [x] **T6 — Refresh the CLI template cache.**
      Ran `node packages/astro-ignite/scripts/copy-templates.mjs`. Verified
      `packages/astro-ignite/templates/{starter,docs}/` mirror the rewritten
      sources (including the new `eslint.config.js` + `package.json` devDep).
      Zero long-form arbitrary-CSS-var classes remain in class attributes under
      the cache.
      Covers: S6.

- [x] **T7 — Run the three-tier verification.**
      `pnpm format`, `pnpm format:check`, `pnpm lint`, `pnpm typecheck`,
      `pnpm test`, `pnpm audit:invariants --change …`, `pnpm scaffold:test`
      (`--full`: install + check + lint + build of the scaffolded project),
      `pnpm perf:budget` (local advisory — skips gracefully if Chrome absent).
      Covers: S3, S4, S7. Invariants: `templates-css-tokens / I1`,
      new `templates-css-tokens / I5`, `templates-perf / I5`.

- [x] **T8 — Write the changeset.**
      Added `.changeset/lint-auto-fix-tailwind-canonical-class-i.md` describing
      the change as a non-breaking lint hardening, with the opt-in note for
      downstream users. Cites issue #55.
      Covers: S8.
