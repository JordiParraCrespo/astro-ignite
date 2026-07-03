# Fonts

This template ships **no remote or self-hosted font files**. The token chain in `src/styles/global.css` resolves to the system font stack (`ui-sans-serif`, `ui-monospace`, and their platform fallbacks) — zero font HTTP requests, zero font-swap CLS, and it renders instantly on every OS.

## Why there's no Geist, despite the name in the CSS

`src/styles/global.css` still names `'Geist'` / `'Geist Mono'` first in the token chain:

```css
--font-display: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

That's a harmless vestige, not a working font load. `src/layouts/BaseLayout.astro` has a comment explaining why: an earlier revision wired up Astro's experimental Font integration (`astro:fonts`) to self-host Geist, but the `@theme` block pointed `--font-display`/`--font-mono` at the plain family names (`'Geist'`, `'Geist Mono'`) instead of the hashed family names Astro's integration actually generates — so the browser never matched an `@font-face` rule and silently fell through to the system fallback later in the same stack. The integration itself was removed; only the vestigial name remains.

**Net effect today:** the site already runs at the fastest possible state — no font requests at all — even though the CSS reads as if Geist were self-hosted.

## Enabling a real font (Astro's font integration)

If you want a custom typeface instead of the system stack, wire up Astro's experimental Font integration. The recipes below use the real API — this is what the previous integration got wrong, called out inline so you don't repeat it.

### 1. Add the integration in `astro.config.mjs`

```js
import { fontProviders } from 'astro/config';

export default defineConfig({
  experimental: {
    fonts: [
      {
        provider: fontProviders.bunny(),
        name: 'Geist', // exact provider-side font name
        cssVariable: '--font-display',
        weights: ['400 700'],
        subsets: ['latin', 'latin-ext'],
        fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        display: 'swap',
      },
      {
        provider: fontProviders.bunny(),
        name: 'Geist Mono',
        cssVariable: '--font-mono',
        weights: ['400 600'],
        subsets: ['latin', 'latin-ext'],
        fallbacks: ['ui-monospace', 'SFMono-Regular', 'monospace'],
        display: 'swap',
      },
    ],
  },
});
```

### 2. Register the `<Font>` tags in `BaseLayout.astro`

```astro
---
import { Font } from 'astro:assets';
---

<Font cssVariable="--font-display" preload />
<!-- LCP-critical -->
<Font cssVariable="--font-mono" />
<!-- below the fold, deferred -->
```

### 3. Point the CSS variable at the generated family — the step the old integration skipped

Astro's font integration emits its own hashed `@font-face` `font-family` value and binds it to the `cssVariable` you configured — **do not hand-write the family name in `global.css`**. Once `<Font cssVariable="--font-display" />` is rendered, `var(--font-display)` already resolves to the right generated family; remove the manual `'Geist'` literal from the token so there's nothing to drift out of sync:

```css
--font-display: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; /* Astro's <Font> supplies the family at render time */
--font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

That's the fix: the family name comes from the `<Font>` component, not from a literal in the token — hand-writing one (as the old integration did) is exactly what breaks the match.

## Recipes

### Swap to Inter (broader linguistic coverage)

In `astro.config.mjs`, change the display font's `name`:

```js
fonts: [
  {
    provider: fontProviders.bunny(),
    name: 'Inter', // ← changed
    cssVariable: '--font-display',
    weights: ['400 700'],
    subsets: ['latin', 'latin-ext', 'cyrillic'], // add subsets you need
    fallbacks: ['system-ui', 'sans-serif'],
    display: 'swap',
  },
  // ...
];
```

### Add a serif for headings

```js
fonts: [
  // existing entries...
  {
    provider: fontProviders.bunny(),
    name: 'Fraunces', // or Playfair Display, Source Serif, etc.
    cssVariable: '--font-serif',
    weights: ['400 700'],
    styles: ['normal'],
    subsets: ['latin', 'latin-ext'],
    fallbacks: ['Georgia', 'serif'],
    display: 'swap',
  },
],
```

Use in components:

```astro
<style>
  h1 {
    font-family: var(--font-serif);
  }
</style>
```

### Switch provider (Bunny ↔ Google ↔ local files)

```js
// Google Fonts
provider: fontProviders.google();

// Self-hosted local files
provider: fontProviders.local({
  src: ['./src/assets/fonts/*.woff2'],
});
```

Bunny is GDPR-friendly, fast, and free. Google works the same way for any font available there; `local()` is the fully self-hosted option if you already have the font files.

### Add CJK / Arabic / Hebrew support

These scripts have huge glyph sets — never include them in the default load. Add a dedicated entry and scope it to the locales that need it:

```js
{
  provider: fontProviders.bunny(),
  name: 'Noto Sans JP',
  cssVariable: '--font-cjk',
  weights: [400, 700],
  subsets: ['japanese'],
  fallbacks: ['Hiragino Sans', 'Meiryo', 'sans-serif'],
  display: 'swap',
},
```

Then conditionally apply per locale:

```css
html[lang^='ja'] body {
  font-family: var(--font-cjk);
}
```

### Reverting to system-stack-only

If you add the integration above and later want to remove it (e.g. to get back to the current zero-request default):

1. Delete the `experimental.fonts` block from `astro.config.mjs`.
2. Remove the `<Font />` calls from `BaseLayout.astro`.
3. In `src/styles/global.css`, drop any provider-generated family name from the token so only the system stack remains:
   ```css
   --font-display: system-ui, -apple-system, 'Segoe UI', sans-serif;
   --font-mono: ui-monospace, SFMono-Regular, monospace;
   ```

## Fallback metric overrides

When the integration is active, `astro:fonts` automatically generates `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` so the system fallback during the brief load window has line-box dimensions matching the custom font — zero CLS on font swap. This only applies once you've wired up the integration; the current system-stack default has no swap to begin with, so there's nothing to override.
