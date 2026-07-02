# Components

UI for the site. Organized by intent, not by page.

## Layout

- `ui/` — **atoms** (shadcn-style, copied from the astro-ignite registry,
  owned here). apps/site only mirrors the atoms it actually uses —
  currently `Button.astro`, `CopyButton.astro`, plus a site-specific
  `terminal/` compound family (`Terminal.astro` + 8 parts:
  `TermAnswer`, `TermCaret`, `TermLine`, `TermOption`, `TermPrompt`,
  `TermSigil`, `TermStrong`, `TermSubtle`). It does **not** carry the
  full registry — no `card/`, `tabs/`, `accordion/`, `dialog/`,
  `dropdown-menu/`, or `radio-group/` here.
- `common/` — site chrome reused across pages (`Header`, `Footer`,
  `Brand`, `ThemeToggle`, `LocaleSwitcher`, `Analytics`). No `Hero` or
  `FeaturesGrid` — the hero/features sections live in `landing/` below.
- `landing/` — apps/site-only marketing sections composed on the
  homepage: `HeroSection`, `FeaturesSection`, `FeatureCell`,
  `TemplatesSection`, `TemplateCard`, `BlogSection`, `CtaSection`,
  `CommandLine`, `MetaStrip`, `Pill`, `SectionHead`. Not part of the
  starter template mirror.
- `blocks/terminal/` — the terminal/hero block's internal composition:
  `TermHeader`, `TermCommandLine`, `TermCursorLine`, `TermActiveStep`,
  `TermStep`, `TermPickerRow`. Consumed by `landing/HeroSection.astro`.
  This is apps/site's headline customization vs. the starter template.
- `seo/` — `SEO.astro` (meta/OG) and `JsonLd.astro` (renders the page's
  `@graph` node).
- `legal/` — `CookieBanner.astro` (consent gate for analytics).
- `<feature>/` — page-specific sections (currently only `image/`:
  `Image.astro`, `PriorityImage.astro`). Unlike the starter template,
  apps/site has no `about/`, `blog/`, `projects/`, `contact/`,
  `not-found/`, or `error/` component folders — those pages compose
  `landing/`/`common/` pieces or top-level `BlogCard.astro`/
  `LandingPage.astro` directly.

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
