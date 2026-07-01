# Fonts

This site ships with **zero remote fonts**. `--font-display` / `--font-mono` in `src/styles/global.css` resolve to the system font stack (`ui-sans-serif`, `ui-monospace`, and their platform equivalents), so there's no font request on cold load and no CLS from a font swap.

Astro's built-in `astro:fonts` integration (a top-level `fonts: []` array in `astro.config.mjs`, no package install required) is not currently wired up — this doc shows how to add it if you want a custom typeface such as Geist.

## CSS variable abstraction

Every component references fonts via CSS custom properties:

```css
font-family: var(--font-display); /* body / UI */
font-family: var(--font-mono); /* code */
```

Defined in `src/styles/global.css`'s `@theme` block, currently pointed at system stacks:

```css
--font-display: 'Geist', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

The leading `'Geist'` / `'Geist Mono'` names are placeholders for a font that isn't loaded — no `@font-face` matches them, so every browser falls through to the system stack immediately after. Once you wire up `fonts:` below, Astro emits `@font-face` rules under a **hashed** family name (not the plain `Geist` you write in config) — repoint the token to that hashed name, or Astro's own generated CSS variable, once you've confirmed what it emits for your setup.

**This means:** adding a font is a `astro.config.mjs` + token edit — no component file changes needed.

## Recipes

### Add Geist (or any Google/Bunny-hosted font)

In `astro.config.mjs`:

```js
import { fontProviders } from 'astro/config';

export default defineConfig({
  // ...existing config
  fonts: [
    {
      provider: fontProviders.bunny(), // GDPR-friendly, matches Google Fonts' catalog
      name: 'Geist',
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
      weights: ['400 700'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'monospace'],
      display: 'swap',
    },
  ],
});
```

Then render `<Font>` where the type is used — typically once per variable near the top of `BaseLayout.astro`:

```astro
---
import { Font } from 'astro:assets';
---

<Font cssVariable="--font-display" preload />
<Font cssVariable="--font-mono" />
```

`astro:fonts` handles subsetting, `@font-face` generation, and fallback metric overrides automatically — no separate license/hosting step for Bunny or Google-provided fonts.

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

Bunny is a reasonable default because it's GDPR-friendly, fast, and free. Google works the same way for any font available there.

### Add CJK / Arabic / Hebrew support

These scripts have huge glyph sets — never include them in a default load. Use `unicodeRange` or split fonts:

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

## Preload strategy

Once you add `<Font>` calls in `BaseLayout.astro`, only preload the weight that renders above the fold:

```astro
<Font cssVariable="--font-display" preload />
<!-- LCP-critical -->
<Font cssVariable="--font-mono" />
<!-- below the fold, deferred -->
```

Preloading too many fonts competes with the hero image for bandwidth.

## Fallback metric overrides

Once a font is wired up, `astro:fonts` automatically generates `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` so the system fallback during the brief load window has near-identical line-box dimensions to the custom font — minimizing (not eliminating) CLS on font swap.

## Reverting to system-only

If you added a font and want to go back to the zero-request default:

1. Remove the `fonts:` array from `astro.config.mjs`.
2. Remove the `<Font />` calls from `BaseLayout.astro`.
3. Repoint the tokens in `src/styles/global.css` to system stacks only:
   ```css
   --font-display: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
   --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
   ```
