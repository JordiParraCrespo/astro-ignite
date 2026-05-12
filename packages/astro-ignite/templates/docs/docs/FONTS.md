# Fonts

This site uses **Geist Sans** + **Geist Mono** via Astro 5's built-in `astro:fonts` integration with the Bunny Fonts provider. Self-hosted, subsetted, with automatic fallback metric overrides for zero CLS on font swap.

## Why Geist

- Vercel/shadcn aesthetic — clean, neutral, modern.
- Variable font, ~25KB on the wire (vs ~80KB for Inter Variable).
- MIT/OFL licensed.
- Latin + Latin-Extended coverage.

**Limitation:** no Cyrillic, Greek, CJK, Arabic, or Hebrew. If your locales need those, swap to Inter (broader coverage) — see below.

## CSS variable abstraction

Every component references fonts via CSS custom properties:

```css
font-family: var(--font-display); /* body / UI */
font-family: var(--font-mono); /* code */
```

Defined in `src/styles/global.css` `@theme` block. Astro fonts integration generates the matching `@font-face` rules.

This means: **swap fonts by editing `astro.config.mjs` only — no component file changes needed.**

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

That's it.

### Add a serif for headings

```js
fonts: [
  // existing entries...
  {
    provider: fontProviders.bunny(),
    name: 'Fraunces',                    // or Playfair Display, Source Serif, etc.
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

Bunny is the default because it's GDPR-friendly, fast, and free. Google works the same way for any font available there.

### Go system-stack-only (zero font payload)

1. Delete the `experimental.fonts` block from `astro.config.mjs`.
2. Remove the `<Font />` calls from `BaseLayout.astro`.
3. In `src/styles/global.css`, change the variables to system stacks only:
   ```css
   --font-display: system-ui, -apple-system, 'Segoe UI', sans-serif;
   --font-mono: ui-monospace, SFMono-Regular, monospace;
   ```

Result: zero font HTTP requests, fastest possible LCP, native-OS look.

### Add CJK / Arabic / Hebrew support

These scripts have huge glyph sets — never include them in the default load. Use `unicode-range` or split fonts:

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

In `BaseLayout.astro`:

```astro
<Font cssVariable="--font-display" preload />
<!-- LCP-critical -->
<Font cssVariable="--font-mono" />
<!-- below the fold, deferred -->
```

Only preload weights you render above the fold. Preloading too many fonts competes with the hero image for bandwidth.

## Fallback metric overrides

`astro:fonts` automatically generates `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` so the system fallback during the brief load window has identical line-box dimensions to the custom font.

**Result: zero CLS on font swap.** Don't disable this unless you know what you're doing.
