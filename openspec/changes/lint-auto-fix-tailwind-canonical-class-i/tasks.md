# Tasks: lint-auto-fix-tailwind-canonical-class-i

Each task records the scenarios (`S<n>`) and invariants (`I<n>`) it covers.
Invariants live in `openspec/specs/templates-css-tokens/spec.md` (and this
change's spec delta under `specs/templates-css-tokens/spec.md`).

- [ ] **T1 — Add `eslint-plugin-better-tailwindcss` as a root devDep.**
      Pin to an exact version (no `^` / `~`). Update `pnpm-lock.yaml` in the
      same commit. Verify the package's published Tailwind v4 support range
      covers the workspace's installed Tailwind version.
      Covers: S1, S2, S3, S5, S7. Invariants: `templates-perf / I5`.

- [ ] **T2 — Register the plugin in `eslint.config.js`.**
      Add a new flat-config block (after the existing astro block) that:
      a) imports `eslint-plugin-better-tailwindcss`,
      b) registers it under `plugins: { 'better-tailwindcss': … }`,
      c) sets `settings['better-tailwindcss'].entryPoint` to
      `'src/styles/global.css'` so the plugin resolves each linted file's
      nearest template tokens,
      d) enables `enforce-shorthand-css-variables`, `sort-classes`, and
      `no-unnecessary-whitespace` at `error`.
      Confirm `pnpm lint` surfaces the new errors before the sweep.
      Covers: S1, S2, S3, S5. Invariants: new `templates-css-tokens / I5`.

- [ ] **T3 — Add the `lint:fix` script in root `package.json`.**
      `"lint:fix": "pnpm -r --filter=!playground exec eslint . --fix"` (mirror
      the existing `lint` filter). Smoke-test it from a clean tree.
      Covers: S1, S2.

- [ ] **T4 — Run the auto-fix sweep.**
      Execute `pnpm lint:fix`. Inspect the diff for any non-mechanical
      rewrite (anything that changes the rendered output, the token
      identifier, or a non-class string). Confirm the diff is restricted
      to class attributes in `.astro` / `.tsx` / `.jsx` files under
      `packages/templates/**`, `packages/registry/**`, and `apps/{site,docs}/src/**`.
      Covers: S1, S2, S4. Invariants: `templates-css-tokens / I1`,
      new `templates-css-tokens / I5`.

- [ ] **T5 — Visual parity check on the starter and docs templates.**
      Build both templates (`pnpm --filter @astro-ignite/template-starter build`,
      `pnpm --filter @astro-ignite/template-docs build`) before and after T4
      and diff the emitted HTML / CSS for `/`, `/blog`, `/projects`, `/about`,
      `/contact` (starter) and `/`, one representative guide page (docs).
      Any non-class-attribute diff blocks the change.
      Covers: S4.

- [ ] **T6 — Refresh the CLI template cache.**
      Run `node packages/astro-ignite/scripts/copy-templates.mjs`. Confirm
      `packages/astro-ignite/templates/{starter,docs}/` mirror the rewritten
      sources byte-for-byte (modulo the script's documented intentional
      differences). No raw `text-[var(--…)]`, `bg-[var(--…)]`,
      `border-[var(--…)]`, or `ring-[var(--…)]` long-form arbitrary-CSS-var
      class remains under the cache.
      Covers: S6.

- [ ] **T7 — Run the three-tier verification.**
      Sequentially: `pnpm format`, `pnpm format:check`, `pnpm lint`,
      `pnpm typecheck`, `pnpm test`,
      `pnpm audit:invariants --change lint-auto-fix-tailwind-canonical-class-i`,
      `pnpm scaffold:test`, `pnpm perf:budget` (local advisory — skip
      gracefully if Chrome is absent). All must exit 0.
      Covers: S3, S4, S7. Invariants: `templates-css-tokens / I1`,
      new `templates-css-tokens / I5`, `templates-perf / I5`.

- [ ] **T8 — Write the changeset.**
      Add `.changeset/lint-auto-fix-tailwind-canonical-class-i.md` describing
      the change as a non-breaking lint hardening for downstream users.
      Include a one-line opt-in note (copy the `eslint.config.js` block,
      `pnpm add -D eslint-plugin-better-tailwindcss`, run `pnpm lint:fix`).
      Cite issue #55.
      Covers: S8.
