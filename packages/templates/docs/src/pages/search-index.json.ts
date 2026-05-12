/**
 * Dev-mode search corpus.
 *
 * Pagefind generates `/pagefind/pagefind.js` at build time via the `postbuild`
 * script — it doesn't exist under `astro dev`. The SearchBox falls back to
 * this JSON endpoint when the Pagefind bundle 404s, so search still works
 * during local development.
 *
 * In production this file is also emitted (cheap), but the SearchBox prefers
 * Pagefind whenever it loads successfully.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';

import { siteConfig } from '@/config/site';
import { sidebar } from '@/config/sidebar';
import { useTranslations, type TranslationKey } from '@/i18n';

type SearchEntry = {
  url: string;
  title: string;
  description: string;
  body: string;
};

const stripMdx = (raw: string): string =>
  raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^import .*$/gm, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_>#~|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);

export const GET: APIRoute = async () => {
  const docs = await getCollection('docs', (e) => !e.data.draft);
  const entries: SearchEntry[] = [];

  for (const entry of docs) {
    const [locale, ...rest] = entry.id.split('/');
    if (!locale) continue;
    const slug = rest.join('/');
    const url = getRelativeLocaleUrl(locale, slug);
    entries.push({
      url,
      title: entry.data.title,
      description: entry.data.description,
      body: stripMdx(entry.body ?? ''),
    });
  }

  for (const locale of siteConfig.locales) {
    const t = useTranslations(locale);
    for (const group of sidebar) {
      const groupLabel = group.groupKey ? t(group.groupKey) : group.group;
      for (const item of group.items) {
        if (!item.slug.startsWith('/')) continue;
        const url = getRelativeLocaleUrl(locale, item.slug);
        const name = item.label ?? (item.labelKey ? t(item.labelKey) : item.slug);
        let description = groupLabel;
        if (item.label) {
          if (item.slug.startsWith('/components/')) {
            const k = `components.summary.${item.label}` as TranslationKey;
            const v = t(k);
            if (v !== k) description = v;
          } else if (item.slug.startsWith('/blocks/')) {
            const k = `blocks.summary.${item.label}` as TranslationKey;
            const v = t(k);
            if (v !== k) description = v;
          }
        }
        entries.push({ url, title: name, description, body: '' });
      }
    }
  }

  return new Response(JSON.stringify({ entries }), {
    headers: { 'content-type': 'application/json' },
  });
};
