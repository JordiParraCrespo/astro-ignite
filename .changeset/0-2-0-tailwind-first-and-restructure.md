---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Templates: Tailwind-first styling, restructured component tree, unified typography.** One styling layer, one organizing rule, one type scale. **Breaking** for users mirroring template updates into previously scaffolded sites — import paths and class strings changed (see migration notes below).

- **Tailwind-first styling.** Every component expresses colors / spacing / typography through Tailwind v4 utilities resolving the `--color-*` design tokens. The old "scoped `<style>` above the fold, Tailwind below" split is gone. Scoped `<style>` blocks remain only where Tailwind can't express the rule (keyframes, view-transition selectors, runtime-dynamic CSS, MDX prose), each with a `<!-- tailwind-exception: <reason> -->` comment. The `astro-beasties` integration is removed — `inlineStylesheets: 'always'` already inlines the full stylesheet, leaving Beasties no critical-CSS surface.
- **Component tree restructure (starter).** Every file lives in `ui/`, `common/`, or a `<feature>/` folder — nothing flat at the root. Renames include `Nav.astro` → `common/Header.astro`, `CookieBanner.astro` → `legal/CookieBanner.astro`, and section components move from `sections/<page>/` into their feature folders. Pages are composition-only: a layout wrapper plus section imports, shared between default-locale routes and their `[lang]/` parallels. The registry `blocks/` tier is temporarily removed until a composition worth distributing lands.
- **Nested UI families.** Compound families ship in their own folder mirroring the registry source layout: `ui/card/card.astro` (+ header/title/description/content/footer), same for `tabs`, `accordion`, `dialog`, `dropdown-menu`. Singletons stay flat. **Breaking**: update imports of family parts to the nested form.
- **Typography through the `<Text>` atom.** Pages, sections, layouts, and chrome in both templates render headings and body copy via `<Text variant=…>` (display / h1–h4 / lead / body / small / muted / eyebrow) instead of raw tags with ad-hoc classes. Heading levels are preserved where they differ from the visual variant. UI atoms, nav links, and MDX `.prose` content are intentionally untouched.
- **`HeroImage` → `PriorityImage`.** The eager `fetchpriority="high"` LCP wrapper is renamed for what it enforces, not where it's used; it moves to `src/components/image/PriorityImage.astro`. The lowercase `heroImage` content-collection field is unchanged.

**Migration note.** The token surface (`--color-bg`, `--color-fg`, `--color-primary`, `--color-border`, …) is unchanged, so customizations referencing tokens keep working. For heavily customized sites, re-scaffolding and porting `src/config/`, `src/content/`, and custom routes is the quickest path.
