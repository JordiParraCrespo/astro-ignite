---
'@astro-ignite/template-starter': minor
'create-astro-ignite': minor
'astro-ignite': minor
---

Starter template: migrate the styling layer to Tailwind-first.

Every `.astro` component under `packages/templates/starter/src/{components,layouts}` now expresses colors / spacing / typography through Tailwind v4 utility classes that resolve through the existing `--color-*` design tokens declared in `src/styles/global.css`. The previous "scoped `<style>` blocks above the fold, Tailwind below the fold" split is gone — there is now one styling layer.

Scoped `<style>` blocks remain only where Tailwind cannot express the rule cleanly:

- keyframe animations (kept in `global.css`)
- view-transition selectors
- runtime-dynamic CSS computed from component props
- MDX prose targeting `<slot/>` content (handled with `is:global`, with a `<!-- tailwind-exception: <reason> -->` comment)

The `astro-beasties` integration has been removed from `astro.config.mjs` and `package.json` (DROP by policy — Tailwind v4 + `inlineStylesheets: 'always'` inlines the full stylesheet on first paint, so Beasties had no remaining critical-CSS extraction surface area).

**Migration note for existing users.** If you scaffolded the starter previously and want to pull this in by hand: the component class strings have changed, and the `<style>` blocks have been removed from component files (with a few well-documented exceptions). The token surface (`--color-bg`, `--color-fg`, `--color-primary`, `--color-border`, etc.) is unchanged, so any local customizations referencing those tokens continue to work. Re-scaffolding into a clean directory and porting your `src/config/`, `src/content/`, and any custom routes is the quickest path; otherwise diff `packages/templates/starter/src/` between the previous and current versions for a per-component view of the changes.
