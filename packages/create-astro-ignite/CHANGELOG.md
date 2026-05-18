# create-astro-ignite

## 0.2.0

### Minor Changes

- 2493b9c: Restructure the starter template's `src/components/` tree around a single rule: every file lives in `ui/`, `common/`, or a `<feature>/` folder. Nothing flat at the root. This is a breaking change for end users who scaffolded an earlier version of the starter and want to mirror the new layout back into their project.

  Mapping:
  - `components/Nav.astro` → `components/common/Header.astro` (renamed)
  - `components/Footer.astro` → `components/common/Footer.astro`
  - `components/Brand.astro` → `components/common/Brand.astro`
  - `components/ThemeToggle.astro` → `components/common/ThemeToggle.astro`
  - `components/LocaleSwitcher.astro` → `components/common/LocaleSwitcher.astro`
  - `components/Analytics.astro` → `components/common/Analytics.astro`
  - `components/Hero.astro` → `components/common/Hero.astro`
  - `components/CookieBanner.astro` → `components/legal/CookieBanner.astro`
  - `components/sections/landing/FeaturesGrid.astro` → `components/common/FeaturesGrid.astro`
  - `components/sections/about/AboutBody.astro` → `components/about/AboutBody.astro`
  - `components/sections/blog/BlogIndexList.astro` → `components/blog/BlogIndexList.astro`
  - `components/sections/contact/ContactSection.astro` → `components/contact/ContactSection.astro`
  - `components/sections/projects/ProjectsIndexList.astro` → `components/projects/ProjectsIndexList.astro`
  - `components/sections/not-found/NotFoundHero.astro` → `components/not-found/NotFoundHero.astro`
  - `components/blocks/not-found-state.astro` is removed (merged conceptually into `not-found/NotFoundHero.astro`)
  - `components/sections/` and `components/blocks/` directories are removed

  The registry `blocks/` tier is temporarily removed. `packages/registry/registry.json` no longer lists any `registry:block` entry and `packages/registry/blocks/` does not exist. The tier will be reintroduced when a composition worth distributing lands; the conventions in `packages/registry/AGENTS.md` describe the shape blocks will take when they return.

  No runtime behaviour, dependency, or prop API change — components keep their existing interfaces byte-for-byte. The `[lang]/` parallel routes, JSON-LD `@graph` assembly, cookie/analytics consent gating, and layered CSS strategy are preserved.

### Patch Changes

- 7e6dd40: Templates now ship with an `AGENTS.md` (with a `CLAUDE.md` symlink) so scaffolded projects come pre-wired for AI agent collaboration. The scaffold copier was extended to preserve symlinks verbatim instead of dereferencing them into duplicate files.
- 1f425fa: The starter template now ships with each visual section extracted into its own component under `src/components/sections/`. Pages are composition-only — the body of each page reduces to a layout wrapper plus `<Section />` imports — and default-locale pages share the same section components with their `[lang]/` parallels. No runtime behaviour or dependency change.
- fd7d28f: Starter template typography now routes through the `<Text>` atom across pages, components, and layouts. Page headers, body copy, footer text, the 404 block, and article/project/legal layout headers all use `<Text variant="…">` instead of raw `<h1>`–`<h6>` / `<p>` with inline Tailwind typography classes. Scoped `<style>` blocks shrink to layout-only rules. Hero/Nav/CookieBanner above-the-fold components keep their scoped styles; MDX-rendered `.prose` body content is unchanged.

## 0.1.0

### Minor Changes

- 323a0fd: Split the CLI into two packages so both UXes work:
  - `astro-ignite` (new, primary): the real CLI. Subcommand-based. Today: `npx astro-ignite bootstrap`. Tomorrow: `add`, `upgrade`, etc.
  - `create-astro-ignite` (now a shim): preserves the `npm create astro-ignite@latest` UX by delegating to `npx astro-ignite@latest bootstrap`.

  Both packages publish in lockstep at the same version. End users can keep typing `npm create astro-ignite@latest my-site` or switch to the more explicit `npx astro-ignite bootstrap my-site` — both reach the same code.

### Patch Changes

- bfcd449: Scaffolded sites: drop unused experimental Astro fonts and switch the cookie banner to CSS-gated visibility.

  The bundled templates ship inside the `astro-ignite` tarball (and are scaffolded by the `create-astro-ignite` shim), so this is a user-facing change for both surfaces.
  - **Fonts removed.** The `<Font>` components in `BaseLayout.astro` and the `experimental.fonts` config in `astro.config.mjs` were emitting 4+ woff2 fetches into the inlined critical CSS, but the page never painted them: the `@theme` rule in `global.css` redefines `--font-display` / `--font-mono` to plain `"Geist"` / `"Geist Mono"`, overriding the hashed family names Astro generates, so no element matched any `@font-face`. The starter additionally had `preload` set on `--font-display`, which made the regression worse on LCP. The page now renders in the system fallbacks already listed in the token chain (`ui-sans-serif` / `ui-monospace`) — visually identical to what the broken cascade was producing.
  - **Cookie banner CSS-gated.** The old pattern stamped the banner with the `hidden` attribute and toggled it from JS on load, producing a late visibility flip in the viewport (dominant Speed Index hit). The anti-flash inline script in `BaseLayout` now stamps `html[data-consent='recorded']` if the consent value is already in localStorage; CSS in `CookieBanner` hides the banner whenever that attribute is present. Returning visitors never see the banner; new visitors see it from FCP.

  To re-enable Geist (or any custom font) in a scaffolded site, change the token value in `global.css` to the family Astro emits, or drop in your own self-hosted `@font-face` block.
