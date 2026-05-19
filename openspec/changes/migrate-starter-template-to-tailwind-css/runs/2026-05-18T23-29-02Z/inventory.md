# T1 Inventory — scoped `<style>` blocks in the starter

Generated: 2026-05-18T23-29-02Z

## Starter template

| File                                        | Lines | Notes / non-trivial CSS                                                                                           |
| ------------------------------------------- | ----- | ----------------------------------------------------------------------------------------------------------------- |
| components/common/Hero.astro                | 93    | `clamp()` typography; `text-wrap: balance`                                                                        |
| components/common/Header.astro              | 200   | `color-mix(in oklch, ...)`; `backdrop-filter: blur(12px)`; mobile menu state via `.open`; media queries           |
| components/common/Footer.astro              | n/a   | (no `<style>` block — composition only)                                                                           |
| components/common/Brand.astro               | 128   | CSS variables computed from `size` prop in inline `style=`; `.caret` keyframe inherited from global.css           |
| components/common/LocaleSwitcher.astro      | 131   | popover API; transitions; `[popover]` selectors                                                                   |
| components/common/ThemeToggle.astro         | 86    | `:has()` selectors; segmented control state                                                                       |
| components/common/FeaturesGrid.astro        | n/a   | (no `<style>` block — composition only)                                                                           |
| components/common/Analytics.astro           | n/a   | (no `<style>` block — script-only)                                                                                |
| components/about/AboutBody.astro            | 49    | prose styling                                                                                                     |
| components/blog/BlogIndexList.astro         | 147   | grid layout; `time` element styling; hover states                                                                 |
| components/projects/ProjectsIndexList.astro | 159   | grid layout; card hover states; tag chips                                                                         |
| components/contact/ContactSection.astro     | 200   | form layout; `aria-invalid` styling; submit button states                                                         |
| components/not-found/NotFoundHero.astro     | 40    | hero-style centered layout                                                                                        |
| components/legal/CookieBanner.astro         | 141   | fixed-position banner; entry transition; consent actions                                                          |
| components/image/Image.astro                | 82    | wrapper around `<picture>` with figure caption; **NOT in design.md scope** — keep `<style>` block (see Decisions) |
| layouts/BaseLayout.astro                    | n/a   | (no `<style>` block — confirmed via grep)                                                                         |
| layouts/ArticleLayout.astro                 | 269   | prose typography; heading anchors; `view-transition-name` on title                                                |
| layouts/LegalLayout.astro                   | 104   | prose-narrow surface; document chrome                                                                             |
| layouts/ProjectLayout.astro                 | 264   | hero strip; prose body; sibling nav; `view-transition-name` on title                                              |

Pages under `src/pages/**` were grepped — none carry a `<style>` block. Pages compose components only (after the earlier component-orientation restructure).

## apps/site mirror

27 `.astro` files carry `<style>` blocks under `apps/site/src/`. The 16 component / layout / page mirrors that have a starter counterpart get the same migration. Pages (`pages/about.astro`, `pages/contact.astro`, etc.) carry section-shaped CSS that the starter exposed as components — those `<style>` blocks migrate to utilities in place.

## Tokens consumed

Every component-shaped CSS rule resolves to one of:

- `var(--color-bg)`, `var(--color-fg)`, `var(--color-fg-muted)`, `var(--color-fg-subtle)`
- `var(--color-surface)`, `var(--color-surface-2)`
- `var(--color-border)`, `var(--color-border-strong)`
- `var(--color-primary)`, `var(--color-primary-fg)`, `var(--color-ring)`
- `var(--color-success)`, `var(--color-warning)`, `var(--color-danger)` + `*-fg`
- `var(--font-display)`, `var(--font-mono)`
- `var(--radius)`, `var(--radius-sm)`, `var(--radius-md)`, `var(--radius-lg)`
- `var(--shadow)`, `var(--shadow-sm)`
- `var(--container-prose)`, `var(--container-narrow)`
- `var(--ease-out-soft)`

No ad-hoc literal in any component requires a new token. Sizes (`clamp()`, `rem`, `px`) stay inline via Tailwind arbitrary values, e.g. `text-[clamp(2.25rem,6vw,4.5rem)]`. The `--ig-*` vars in `Brand.astro` are component-local props and stay inline on the element (component-author intent — sizes computed from a prop are dynamic).

## CSS features that need keeping (tailwind-exception comments)

- **Keyframe animations** — `@keyframes ig-blink` already lives in `global.css`. Any per-component keyframe needs to stay in a scoped block with `<!-- tailwind-exception: keyframe -->` (none found in starter — all live in global.css).
- **View-transition selectors** — `view-transition-name: post-title` on the article H1 / project H1. Tailwind v4 has no utility for this. Solution: drop into a one-liner `style="view-transition-name: post-title"` inline attribute instead of a `<style>` block; that's equivalent and keeps the component pure-utility.
- **`:has()` / popover selectors** — Tailwind v4 supports `has-[]` and `[&::part(...)]` arbitrary variants. We use them inline.
- **`color-mix()`** — Tailwind arbitrary values accept full color expressions: `bg-[color-mix(in_oklch,var(--color-bg)_92%,transparent)]`.

## Decisions

- **`components/image/Image.astro`** is NOT in this change's design.md "Files touched" list. It ships a `<style>` block that styles `<figure><figcaption>` with prose rhythm — wrap-around of `<picture>` with caption. We leave it alone in this change (out of scope; the spec applies to the starter migration's listed surfaces).
- **`Footer.astro`, `FeaturesGrid.astro`, `Analytics.astro`** carry no `<style>` block at HEAD. They were listed in design.md as a defensive measure (in case sibling work added one). No edit needed.
- **Layouts without `<style>` blocks** (e.g. `BaseLayout.astro`) need no edit.
