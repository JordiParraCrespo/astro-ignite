/**
 * Per-locale RSS feed for non-default locales: /<lang>/rss.xml.
 * Default-locale feed is at /rss.xml (sibling file).
 *
 * Surfaces the most recently updated docs entries from this locale,
 * sorted newest-first by `lastUpdated`.
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

import { siteConfig } from '@/config/site';

const FEED_LIMIT = 20;

const dateOf = (entry: CollectionEntry<'docs'>) => entry.data.lastUpdated ?? new Date(0);

export async function getStaticPaths() {
  return siteConfig.locales
    .filter((l) => l !== siteConfig.defaultLocale)
    .map((lang) => ({ params: { lang } }));
}

export async function GET(context: APIContext) {
  const lang = context.params.lang!;
  const homeId = `${lang}/${siteConfig.homePath.replace(/^\//, '')}`;

  const entries = (
    await getCollection(
      'docs',
      (e: CollectionEntry<'docs'>) => !e.data.draft && e.id.startsWith(`${lang}/`)
    )
  ).sort((a, b) => +dateOf(b) - +dateOf(a));

  return rss({
    title: siteConfig.name[lang] ?? siteConfig.name[siteConfig.defaultLocale]!,
    description: siteConfig.description[lang] ?? siteConfig.description[siteConfig.defaultLocale]!,
    site: context.site!,
    items: entries.slice(0, FEED_LIMIT).map((entry) => {
      const slug = entry.id.split('/').slice(1).join('/');
      return {
        title: entry.data.title,
        pubDate: dateOf(entry),
        description: entry.data.description,
        link: entry.id === homeId ? `/${lang}/` : `/${lang}/${slug}`,
      };
    }),
    customData: `<language>${siteConfig.hreflang[lang] ?? lang}</language>`,
  });
}
