/**
 * Low-quality image placeholder (LQIP) generation.
 *
 * Returns a tiny base64-encoded data URL that the `<Image>` component renders
 * as a blurred background while the full image loads. ~200 bytes per image.
 *
 * Behavior:
 *   - SVG sources skip LQIP entirely — they're already small and rasterizing
 *     them would lose vector fidelity.
 *   - Raster sources (JPEG/PNG/WebP/AVIF) get a 4×4 px JPEG, base64-encoded.
 *     Cached per session keyed by image src to avoid recomputation.
 *
 * If a source can't be resolved on disk (e.g., a remote URL passed in), the
 * function returns an empty string — the component falls back to no
 * placeholder. Hero images don't use this anyway.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ImageMetadata } from 'astro';
import sharp from 'sharp';

const cache = new Map<string, string>();

/**
 * Resolve an Astro `ImageMetadata.src` to an absolute filesystem path.
 *
 * During dev, Astro serves images at virtual URLs like `/@fs/...?...`. During
 * build the assets module exposes the original path differently. The safest
 * approach is to walk known import metadata: when a user does
 * `import hero from './hero.jpg'`, the resulting object's `src` is a URL but
 * the file lives somewhere predictable from the project root.
 *
 * Astro 5's `ImageMetadata` doesn't expose the source path directly. This
 * helper does best-effort resolution; if it fails, callers should treat that
 * as a signal to skip LQIP.
 */
async function resolveImagePath(src: string): Promise<string | null> {
  try {
    if (src.startsWith('file://')) {
      return fileURLToPath(src);
    }
    if (src.startsWith('/@fs/')) {
      const rest = src.slice('/@fs'.length).split('?')[0];
      if (rest) return rest;
      return null;
    }
    // Astro build-time URL: /_astro/foo.HASH.jpg
    if (src.startsWith('/_astro/')) {
      // After build, the file lives in dist/_astro/. During dev there's no
      // emitted asset to read. LQIP generation runs at build, so dist/ is the
      // right place — but at the moment getBlurDataUrl is called, dist may not
      // exist yet. Fall through to path-based resolution.
      const cwd = process.cwd();
      const distPath = path.join(cwd, 'dist', src);
      try {
        await fs.access(distPath);
        return distPath;
      } catch {
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getBlurDataUrl(meta: ImageMetadata): Promise<string> {
  // SVGs don't benefit from LQIP — they're tiny and vector.
  if (meta.format === 'svg') return '';

  if (cache.has(meta.src)) return cache.get(meta.src)!;

  const filePath = await resolveImagePath(meta.src);
  if (!filePath) {
    cache.set(meta.src, '');
    return '';
  }

  try {
    const buffer = await sharp(filePath)
      .resize(8, 8, { fit: 'inside' })
      .blur(2)
      .jpeg({ quality: 50, progressive: false })
      .toBuffer();

    const dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    cache.set(meta.src, dataUrl);
    return dataUrl;
  } catch {
    cache.set(meta.src, '');
    return '';
  }
}
