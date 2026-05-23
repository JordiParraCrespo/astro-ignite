/**
 * RSS feed for the default locale, served at /rss.xml.
 *
 * Surfaces the most recently updated docs entries from the default locale,
 * sorted newest-first by `lastUpdated`. Per-locale feeds for other locales
 * live at /[lang]/rss.xml (sibling file).
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';

import { siteConfig } from '@/config/site';

const FEED_LIMIT = 20;

const dateOf = (entry: CollectionEntry<'docs'>) => entry.data.lastUpdated ?? new Date(0);

export async function GET(context: APIContext) {
  const locale = siteConfig.defaultLocale;
  const homeId = `${locale}/${siteConfig.homePath.replace(/^\//, '')}`;

  const entries = (
    await getCollection(
      'docs',
      (e: CollectionEntry<'docs'>) => !e.data.draft && e.id.startsWith(`${locale}/`)
    )
  ).sort((a, b) => +dateOf(b) - +dateOf(a));

  return rss({
    title: siteConfig.name[locale] ?? siteConfig.name[siteConfig.defaultLocale]!,
    description:
      siteConfig.description[locale] ?? siteConfig.description[siteConfig.defaultLocale]!,
    site: context.site!,
    items: entries.slice(0, FEED_LIMIT).map((entry) => {
      const slug = entry.id.split('/').slice(1).join('/');
      return {
        title: entry.data.title,
        pubDate: dateOf(entry),
        description: entry.data.description,
        link: entry.id === homeId ? '/' : `/${slug}`,
      };
    }),
    customData: `<language>${siteConfig.hreflang[locale] ?? locale}</language>`,
  });
}
