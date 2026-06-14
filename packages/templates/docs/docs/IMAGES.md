# Images

Two components, two roles. Pick the right one.

## `<Image>` — content imagery

For anything **NOT in the initial viewport** (blog post body images, project screenshots, illustrations below the fold, list/grid items below the first row).

```astro
---
import Image from '@/components/image/Image.astro';
import myImage from './my-image.jpg';
---

<Image
  src={myImage}
  alt="Description"
  width={800}
  height={420}
  sizes="(min-width: 768px) 50vw, 100vw"
/>
```

Defaults:

- `loading="lazy"` — defer until near viewport
- `decoding="async"` — non-blocking
- AVIF + WebP + original-format fallback in a `<picture>` element
- Quality 80
- Blur placeholder (LQIP) — ~200 byte base64 thumbnail rendered as background while the real image loads

## `<PriorityImage>` — above-the-fold

For the **single LCP image on the page** (hero section, blog post cover, project cover).

```astro
---
import PriorityImage from '@/components/image/PriorityImage.astro';
---

<PriorityImage src={post.data.heroImage} alt={post.data.heroImageAlt} width={1200} height={630} />
```

Defaults:

- `loading="eager"` — start immediately
- `decoding="sync"` — block render until decoded (faster perceived LCP)
- `fetchpriority="high"` — browser prioritizes over below-the-fold images
- AVIF + WebP + original-format fallback
- Quality 85 (slightly higher than content images — it's the LCP element)
- **No blur placeholder** — would compete with the LCP image

`width` and `height` are **required** on `<PriorityImage>` so the layout reserves the slot before any CSS loads (zero CLS).

## Hero preload via BaseLayout

Components can't reach into `<head>`, so pages with a hero pass it explicitly:

```astro
<BaseLayout title="…" description="…" preloadImages={[heroImage]}>
  <PriorityImage src={heroImage} alt="…" width={1200} height={630} />
</BaseLayout>
```

`BaseLayout` renders `<link rel="preload" as="image">` tags for each — the browser starts the request during HTML parse, before component code runs.

## What's automatic

- **3-format `<picture>`:** AVIF + WebP + original. Modern browsers get AVIF (~50-70% smaller than JPEG); older ones get WebP; ancient ones get JPEG/PNG.
- **Responsive `srcset`:** Astro auto-generates across `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]` widths when `sizes` is set.
- **`width` + `height` attrs:** prevent layout shift even before CSS loads.
- **Format-specific quality:** uniform across formats (q=80 content, q=85 hero). Per-format tuning is possible but rarely worth the complexity.

## Authoring guidelines

1. **Source size: 2× display size max.** Astro downsizes but never upsizes. A 4K hero source for a 1200px slot is wasted bytes at build time and storage. Author at 2400px wide for a retina-ready 1200px display.
2. **Use the source format that compresses best.** Photographs → JPEG. Illustrations with sharp edges → PNG. Astro converts to AVIF + WebP regardless.
3. **Build time scales with `images × formats × widths`.** First build of a post-heavy blog can take a minute. Cached after that.
4. **SVG is NOT optimized through this pipeline.** Ship from `public/` as-is, or import as a component for inline rendering.

## Disabling LQIP (blur placeholder)

The blur placeholder costs ~200 bytes per image and a small build-time step. To disable globally, edit `src/lib/image/blur.ts`:

```ts
export async function getBlurDataUrl(_meta: ImageMetadata): Promise<string> {
  return '';
}
```

The `<Image>` component will skip the blur layer when the data URL is empty.

## Customizing srcset widths

`astro.config.mjs`:

```js
image: {
  responsiveStyles: true,
  experimentalLayout: 'responsive',  // optional
}
```

Or override per-component by passing `widths={[640, 1280]}` to `<Picture>` directly (replace the wrapper if you go this route).

## Art direction (different images per breakpoint)

Not wrapped in v1. Use astro:assets `<Picture>` directly:

```astro
---
import { Picture } from 'astro:assets';
import desktop from './desktop.jpg';
import mobile from './mobile.jpg';
---

<picture>
  <source media="(max-width: 767px)" srcset={mobile.src} />
  <source media="(min-width: 768px)" srcset={desktop.src} />
  <img src={desktop.src} alt="…" width={1200} height={630} />
</picture>
```

For `<PriorityImage>` art direction, build a small variant of the component that takes `mobileSrc` + `desktopSrc` props.
