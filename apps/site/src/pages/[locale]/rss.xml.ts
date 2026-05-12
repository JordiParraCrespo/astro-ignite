/**
 * Per-locale RSS feed for non-default locales: /<locale>/rss.xml.
 * Default-locale feed is at /rss.xml (sibling file).
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

import { siteConfig } from '@/config/site';

const parser = new MarkdownIt({ html: true });

export async function getStaticPaths() {
  return siteConfig.locales
    .filter((l) => l !== siteConfig.defaultLocale)
    .map((locale) => ({ params: { locale } }));
}

export async function GET(context: APIContext) {
  const locale = context.params.locale!;
  const posts = (
    await getCollection(
      'blog',
      (e: CollectionEntry<'blog'>) => !e.data.draft && e.id.startsWith(`${locale}/`)
    )
  ).sort(
    (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
      +b.data.datePublished - +a.data.datePublished
  );

  return rss({
    title: siteConfig.name[locale] ?? siteConfig.name[siteConfig.defaultLocale]!,
    description:
      siteConfig.description[locale] ?? siteConfig.description[siteConfig.defaultLocale]!,
    site: context.site!,
    items: posts.slice(0, 20).map((post: CollectionEntry<'blog'>) => {
      const slug = post.id.split('/').slice(1).join('/');
      return {
        title: post.data.title,
        pubDate: post.data.datePublished,
        description: post.data.description,
        link: `/${locale}/blog/${slug}`,
        content: sanitizeHtml(parser.render(post.body ?? ''), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'picture', 'source']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'width', 'height', 'srcset'],
          },
        }),
      };
    }),
    customData: `<language>${siteConfig.hreflang[locale] ?? locale}</language>`,
  });
}
