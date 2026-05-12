/**
 * RSS feed for the default locale, served at /rss.xml.
 * Per-locale feeds for other locales live at /[locale]/rss.xml (sibling file).
 */

import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { APIContext } from 'astro';
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';

import { siteConfig } from '@/config/site';

const parser = new MarkdownIt({ html: true });

export async function GET(context: APIContext) {
  const locale = siteConfig.defaultLocale;
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
        link: `/blog/${slug}`,
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
