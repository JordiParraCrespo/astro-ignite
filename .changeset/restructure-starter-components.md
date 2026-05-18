---
'astro-ignite': minor
'create-astro-ignite': minor
---

Restructure the starter template's `src/components/` tree around a single rule: every file lives in `ui/`, `common/`, or a `<feature>/` folder. Nothing flat at the root. This is a breaking change for end users who scaffolded an earlier version of the starter and want to mirror the new layout back into their project.

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
