# Inventory: Heading + `<p>` audit for `<Text>` refactor

Snapshot of every `<h1>`–`<h6>` and `<p>` in
`packages/templates/starter/src/{pages,components,layouts}/**/*.astro`
classified as:

- **(a) in scope** — body / heading carrying typography utility soup,
  belongs inside an in-scope file. Refactor to `<Text>`.
- **(b) excepted** — chrome / atom / scoped-style-encapsulated. Stays.
- **(c) MDX** — rendered through `<slot />` on `.prose`. Out of scope.

## Pages (default locale)

### `src/pages/index.astro`

- **(a)** features section `<h2>` (`text-[clamp(...)] font-semibold
tracking-[-0.02em] text-fg`) → `<Text variant="h2">` (drop the inline
  classes; keep wrapper layout).
- **(a)** per-card `<h4>` (`text-sm font-medium tracking-[-0.02em]
text-fg`) → `<Text variant="h4">`.
- **(a)** per-card `<p>` (`text-xs leading-[1.55] text-fg-subtle`) →
  `<Text variant="small" tone="subtle">` (variant `small` is 12px which
  matches `text-xs`; `tone="subtle"` retains the existing `text-fg-subtle`
  color).

The numeric `index` / `tag` `<span>` chips are mono-font chips, not body
copy — they stay as `<span class="mono ...">` chrome (matches the
proposal's S2 exception for atoms / chrome).

### `src/pages/about.astro`

- **(a)** `.page-header h1` → `<Text variant="h1">`. The scoped
  `.page-header h1` typography rules are removed.
- **(a)** `.lede p` → `<Text variant="lead">`. The scoped `.lede` rule
  is removed.
- **(a)** `.prose p` × 2 → `<Text variant="body">`.
- **(a)** `.prose h2` → `<Text variant="h2">`.
- **(b)** `<ul>` / `<li>` — list markup, no typography utilities on the
  elements; the `.prose` global stylesheet covers list rendering.

### `src/pages/contact.astro`

- **(a)** `.page-header h1` → `<Text variant="h1">`.
- **(a)** `.lede p` → `<Text variant="lead">`.
- **(a)** `.field-error` `<p>` × 3 → `<Text variant="small"
class="field-error">`. The `.field-error` class still supplies the
  danger color (semantic error state); the atom supplies typography.

### `src/pages/blog/index.astro`

- **(a)** `.page-header h1` → `<Text variant="h1">`.
- **(a)** `.lede p` → `<Text variant="lead">`.
- **(a)** `.empty p` → `<Text variant="muted">` (text + muted color in
  one variant; existing rule kept the `text-align: center` and the
  vertical padding which are layout, not typography).
- **(a)** post-card `<h2>` → `<Text variant="h3" as="h2">` (matches the
  current 1.25rem / 600 visual; preserves the semantic `<h2>` tag).
- **(a)** `.post-meta` → `<Text variant="muted" class="post-meta">`
  (class retains `margin: 0 0 0.75rem` once the typography rules in the
  scoped style are dropped — the layout fragment is kept).
- **(a)** `.post-description` → `<Text variant="muted">` (existing
  visual is ~0.94rem / muted; `muted` variant is 13px — close enough
  per the design's "matches the current `text-fg-muted` look" guidance.
  Drop the scoped `.post-description` rule entirely).

### `src/pages/projects/index.astro`

- Same shape as `blog/index.astro`, mapped one-to-one:
  - **(a)** `.page-header h1` → `<Text variant="h1">`.
  - **(a)** `.lede` → `<Text variant="lead">`.
  - **(a)** `.empty p` → `<Text variant="muted">`.
  - **(a)** card `<h2>` → `<Text variant="h3" as="h2">`.
  - **(a)** `.project-summary` → `<Text variant="muted">`.

## Pages (`[lang]/` parallels)

The `[lang]/` parallel files differ from their default-locale siblings
only by the added `getStaticPaths` export and (in `contact.astro`) one
trivial comment-rewording inside the scoped `<style>`. Every (a) hit
above appears identically in the parallel — refactor in lockstep per
**templates-i18n I1/I2**.

## Components

### `src/components/Footer.astro`

- **(a)** brand-block `<p class="text-base font-semibold ...">{siteName}` →
  `<Text variant="body" weight="semibold">`.
- **(a)** tagline `<p class="text-sm text-[var(--color-fg-muted)] ...">` →
  `<Text variant="muted" class="mt-2 max-w-md">` (margin + max-width
  stay; typography routes through the atom).
- **(a)** section `<h3 class="text-sm font-semibold mb-3">` × 2
  (Legal, Social) → `<Text variant="h4" as="h3" class="mb-3">`.
- **(a)** copyright `<p class="text-xs text-...">` → `<Text
variant="small" tone="muted">`.
- **(a)** built-with `<p class="text-xs text-...">` → `<Text
variant="small" tone="muted">`.
- **(b)** `<a class="text-sm ...">` link labels inside `<ul>` — these
  are nav-link chrome (`<a>` not `<p>`), not body copy. Stay.

### `src/components/blocks/not-found-state.astro`

- **(a)** `<span class="mono text-xs tracking-[0.2em] uppercase
text-fg-subtle">{code}</span>` → `<Text variant="eyebrow"
class="mono">` (using the eyebrow variant's tracking; `mono` keeps the
  mono-font override).
- **(a)** `<h1 class="m-0 text-[clamp(...)] font-medium tracking-[-0.045em]
leading-none text-fg">` → `<Text variant="h1">`. (The `text-fg` is
  the variant default tone; the `leading-none` overshoots the atom's
  `leading-[1.05]` slightly — acceptable per design's guidance that
  this block mirrors the 404.astro shape.)
- **(a)** description `<p class="m-0 text-[15px] text-fg-muted
leading-relaxed max-w-[36ch]">` → `<Text variant="muted"
class="max-w-[36ch]">`.

### Other component files

- **(b)** `Hero.astro` — above-the-fold, scoped `<style>` block. Stays.
- **(b)** `Nav.astro` — chrome, scoped `<style>`. Stays.
- **(b)** `CookieBanner.astro` — self-contained, scoped `<style>`.
  Stays.
- **(b)** `Brand.astro`, `ThemeToggle.astro`, `LocaleSwitcher.astro`,
  `Analytics.astro` — chrome controls, no body typography. Stay.
- **(b)** `src/components/seo/*`, `src/components/image/*` — no body
  text. Stay.
- **(b)** `src/components/ui/*` other than `text.astro` — atom set;
  their typography is the atom contract. Stay.

## Layouts

### `src/layouts/ArticleLayout.astro`

- **(a)** header `<h1>{entry.data.title}</h1>` → `<Text variant="h1">`.
  Drop the scoped `.article-header h1` rule.
- **(a)** `.article-meta p` → `<Text variant="muted"
class="article-meta">`. The `.article-meta` class still supplies the
  `display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap`
  layout once its typography rules are removed.
- **(b)** breadcrumbs `<nav>` / `<a>` — chrome navigation, stays as-is.
- **(c)** `.prose` `<slot />` — MDX content. Out of scope.
- **(b)** `<span class="author">` / `<span class="dot">` /
  `<time>` are wrapped inside the `<Text variant="muted">` byline — they
  remain bare `<span>` / `<time>` elements with no typography utility
  soup of their own (the byline atom carries the type).

### `src/layouts/ProjectLayout.astro`

- **(a)** header `<h1>{entry.data.title}</h1>` → `<Text variant="h1">`
  (the existing `clamp(2.25rem, 6vw, 3.5rem)` maps closest to `h1`; the
  design's mention of `display` is an option, but the rendered visual
  is already in the `h1` range, so we use `h1` to avoid pushing past
  the atom's `display` 80px ceiling).
- **(a)** `.project-summary p` → `<Text variant="lead">`. The scoped
  `.project-summary` rule loses its typography lines; keep
  `max-width: 48rem` as layout.
- **(b)** breadcrumbs — chrome.
- **(b)** `<dl>` / `<dt>` / `<dd>` — semantic data list. The text
  inside `<dd>` is short tokens (role, client, tech-list chip text)
  rendered via the meta `<dl>` styling — they keep their semantic
  markup with no typography utility soup on the elements themselves.
- **(c)** `.prose` `<slot />` — MDX. Out of scope.

### `src/layouts/LegalLayout.astro`

- **(a)** header `<h1>{entry.data.title}</h1>` → `<Text variant="h1">`.
  Drop the scoped `.legal-header h1` rule.
- **(a)** `.legal-meta p` → `<Text variant="muted" class="legal-meta">`.
  `.legal-meta` keeps the `display: flex; flex-wrap: wrap; gap: 0.5rem`
  layout fragment.
- **(c)** `.prose.legal-prose` `<slot />` — MDX. Out of scope.

### `src/layouts/BaseLayout.astro`

- **(b)** head / chrome wiring; no body copy. Stays.

## T2 — atom extension required?

**No.** Every (a) mapping above resolves cleanly against the current
`Text` variants: `display | h1 | h2 | h3 | h4 | lead | body | small |
muted | eyebrow | code`. The article / legal meta byline can be
expressed as `<Text variant="muted" class="article-meta">` (or
`.legal-meta`) — the class still supplies the flex layout, the atom
supplies the type. No new `meta` variant is introduced.

Both `packages/registry/base/text.astro` and the starter mirror at
`packages/templates/starter/src/components/ui/text.astro` are left
byte-for-byte at their current state. S5 holds vacuously.
