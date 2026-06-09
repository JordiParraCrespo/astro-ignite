/**
 * Helpers for the AI-native docs surface.
 *
 * `docToMarkdown` turns a docs collection entry into clean Markdown — the raw
 * source behind every `.md` route and the `/llms-full.txt` bundle. `pageHref`
 * and `mdHref` map an entry id to its HTML path and its `.md` path, mirroring
 * the `.astro` routes (default locale at `/`, others under `/<lang>/`).
 */

import type { CollectionEntry } from 'astro:content';

import { siteConfig } from '@/config/site';

const homeSlug = () => siteConfig.homePath.replace(/^\//, '');

/** `<lang>/<...slug>` → `{ lang, slug }`. */
function parseId(id: string): { lang: string; slug: string } {
  const [lang, ...rest] = id.split('/');
  return { lang: lang ?? siteConfig.defaultLocale, slug: rest.join('/') };
}

/** The canonical page path for a docs entry (mirrors the `.astro` routes). */
export function pageHref(id: string): string {
  const { lang, slug } = parseId(id);
  const prefix = lang === siteConfig.defaultLocale ? '' : `/${lang}`;
  if (slug === homeSlug()) return prefix || '/';
  return `${prefix}/${slug}`;
}

/** The path the entry's raw Markdown is served at (page path + `.md`). */
export function mdHref(id: string): string {
  const { lang, slug } = parseId(id);
  const prefix = lang === siteConfig.defaultLocale ? '' : `/${lang}`;
  return `${prefix}/${slug === homeSlug() ? 'index' : slug}.md`;
}

/** The `[...slug]` param the `.md` route emits for this entry. */
export function mdSlugParam(id: string): string {
  return mdHref(id).replace(/^\//, '').replace(/\.md$/, '');
}

/** Strip MDX `import`/`export` lines so the body reads as plain Markdown. */
function stripMdxNoise(body: string): string {
  return body
    .replace(/^\s*import\s+[^\n]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/^\s*export\s+(?:const|let|var|default|function)[^\n]*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Render an entry as a self-contained Markdown document. */
export function docToMarkdown(entry: CollectionEntry<'docs'>): string {
  const { title, description } = entry.data;
  const body = stripMdxNoise(entry.body ?? '');
  return `# ${title}\n\n> ${description}\n\n${body}\n`;
}
