# Components

UI for the site. Organized by intent, not by page.

## Layout

- `ui/` — **atoms** (shadcn-style, copied from the astro-ignite registry,
  owned here). Singletons are flat (`button.astro`, `input.astro`, …);
  compound families live in their own folder (`card/`, `tabs/`,
  `accordion/`, `dialog/`, `dropdown-menu/`, `radio-group/`) — one file
  per part.
- `common/` — site chrome reused across pages (`Header`, `Footer`,
  `Brand`, `ThemeToggle`, `LocaleSwitcher`, `Analytics`, `Hero`,
  `FeaturesGrid`).
- `seo/` — `SEO.astro` (meta/OG) and `JsonLd.astro` (renders the page's
  `@graph` node).
- `legal/` — `CookieBanner.astro` (consent gate for analytics).
- `<feature>/` — page-specific sections (`about/`, `blog/`, `projects/`,
  `contact/`, `error/`, `not-found/`, `image/`). One concept per file.

## Rules (these are enforced)

- **Astro + vanilla JS only** — no React/Vue/Svelte/Radix. Interactive
  primitives use native HTML: `<details name>` (accordion), `<dialog>`
  (dialog), popover API (dropdown), CSS `:hover`/`:focus-visible`
  (tooltip), custom elements (`ai-tabs`, `ai-toaster`) for tabs/toasts.
- **Design tokens only** — colors/spacing via Tailwind v4 utilities that
  resolve `--color-*` tokens (`bg-[var(--color-bg)]`,
  `text-[var(--color-fg-muted)]`). Never raw zinc-scale utilities or
  hex colors.
- **Scoped `<style>` only for what Tailwind can't express** (keyframes,
  view-transition selectors, prop-driven dynamic CSS, MDX prose under
  `<slot/>`) — each block carries a leading
  `<!-- tailwind-exception: <reason> -->` comment.
- **No comments** unless the _why_ is non-obvious.
- **No single-class atoms** — don't wrap one styling class around a slot;
  inline it or expose a variant prop.
- Merge classes with `cn` from `src/lib/cn.ts`; fire toasts via
  `src/lib/toast.ts` (a window event consumed by `<Toaster />`).

New shared atoms belong in the registry first, then here — not invented
ad hoc in `apps/`.
