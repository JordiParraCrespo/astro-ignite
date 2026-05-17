# astro-ignite

## 0.1.0

### Minor Changes

- 33e8966: Templates are now bundled into the published `astro-ignite` npm package via a `prepack` step. Previously the CLI would fail at runtime because `<pkg>/templates/<kind>/` didn't exist in the published tarball. The `files` field now includes `templates/`, and `scripts/copy-templates.mjs` populates it from `packages/templates/` before pack (skipping `node_modules`, build artifacts, and renaming `_gitignore` → `.gitignore`). The `create-astro-ignite` shim delegates to `astro-ignite bootstrap` and so picks this up transitively.
- f02e323: Initial scaffold of the `astro-ignite` CLI: prompts (site name, URL, locales, package manager, email provider), conditional file copy (Resend/SMTP), `site.ts` substitution, `package.json` rewriting (strips deps the chosen template doesn't use), package-manager-aware install + git init. Exposed today as `npx astro-ignite bootstrap` and via the `npm create astro-ignite@latest` shim.
- 323a0fd: Split the CLI into two packages so both UXes work:
  - `astro-ignite` (new, primary): the real CLI. Subcommand-based. Today: `npx astro-ignite bootstrap`. Tomorrow: `add`, `upgrade`, etc.
  - `create-astro-ignite` (now a shim): preserves the `npm create astro-ignite@latest` UX by delegating to `npx astro-ignite@latest bootstrap`.

  Both packages publish in lockstep at the same version. End users can keep typing `npm create astro-ignite@latest my-site` or switch to the more explicit `npx astro-ignite bootstrap my-site` — both reach the same code.

### Patch Changes

- 6bb53bb: Wire up ESLint across the monorepo and ship a working lint setup in every scaffolded project.
  - Add `eslint@9` flat config with `typescript-eslint`, `eslint-plugin-astro`, and `eslint-plugin-jsx-a11y` at the repo root.
  - Add a self-contained `eslint.config.js` + `eslint` devDependencies to both templates (starter, docs) so users get `pnpm lint` working out of the box.
  - Wire `pnpm lint` into the CI `lint-typecheck` job.
  - Clean up dangling `// eslint-disable-next-line no-console` directives and convert `var` → `const` in inline Plausible scripts.

- bfcd449: Scaffolded sites: drop unused experimental Astro fonts and switch the cookie banner to CSS-gated visibility.

  The bundled templates ship inside the `astro-ignite` tarball (and are scaffolded by the `create-astro-ignite` shim), so this is a user-facing change for both surfaces.
  - **Fonts removed.** The `<Font>` components in `BaseLayout.astro` and the `experimental.fonts` config in `astro.config.mjs` were emitting 4+ woff2 fetches into the inlined critical CSS, but the page never painted them: the `@theme` rule in `global.css` redefines `--font-display` / `--font-mono` to plain `"Geist"` / `"Geist Mono"`, overriding the hashed family names Astro generates, so no element matched any `@font-face`. The starter additionally had `preload` set on `--font-display`, which made the regression worse on LCP. The page now renders in the system fallbacks already listed in the token chain (`ui-sans-serif` / `ui-monospace`) — visually identical to what the broken cascade was producing.
  - **Cookie banner CSS-gated.** The old pattern stamped the banner with the `hidden` attribute and toggled it from JS on load, producing a late visibility flip in the viewport (dominant Speed Index hit). The anti-flash inline script in `BaseLayout` now stamps `html[data-consent='recorded']` if the consent value is already in localStorage; CSS in `CookieBanner` hides the banner whenever that attribute is present. Returning visitors never see the banner; new visitors see it from FCP.

  To re-enable Geist (or any custom font) in a scaffolded site, change the token value in `global.css` to the family Astro emits, or drop in your own self-hosted `@font-face` block.
