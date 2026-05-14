import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { getRelativeLocaleUrl } from 'astro:i18n';

export const GLYPH_MAP: Record<string, string> = {
  perf: '100/100',
  i18n: 'i18n',
  seo: '{ }',
  agents: 'agt',
  process: 'proc',
  astro: 'astro',
  cli: 'cli',
  email: '✉',
  legal: '§',
  ci: 'ci',
  css: 'css',
  introduction: '01',
};

export const glyphFor = (tags: readonly string[] | undefined): string => {
  if (!tags || tags.length === 0) return '>_';
  return GLYPH_MAP[tags[0]!] ?? '>_';
};

export const initialsFor = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]!.toUpperCase())
    .slice(0, 2)
    .join('');

export const readingTime = (body: string | undefined): number => {
  if (!body) return 1;
  const words = body.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export type BlogCardData = {
  post: CollectionEntry<'blog'>;
  href: string;
  dateText: string;
  dateIso: string;
  authorName: string;
  authorInitials: string;
  number: string;
  glyph: string;
  minutes: number;
  tags: readonly string[];
};

export async function getBlogCards(locale: string): Promise<BlogCardData[]> {
  const posts = (
    await getCollection(
      'blog',
      (entry: CollectionEntry<'blog'>) => entry.id.startsWith(`${locale}/`) && !entry.data.draft
    )
  ).sort(
    (a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) =>
      +b.data.datePublished - +a.data.datePublished
  );

  const total = posts.length;
  const dateFmt = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return Promise.all(
    posts.map(async (post, index) => {
      const slug = post.id.split('/').slice(1).join('/');
      const author = await getEntry(post.data.author);
      const authorName = author?.data.name ?? 'Anonymous';
      const tags = post.data.tags ?? [];
      return {
        post,
        href: getRelativeLocaleUrl(locale, `/blog/${slug}`),
        dateText: dateFmt.format(post.data.datePublished),
        dateIso: post.data.datePublished.toISOString(),
        authorName,
        authorInitials: initialsFor(authorName),
        number: `No. ${String(total - index).padStart(3, '0')}`,
        glyph: glyphFor(tags),
        minutes: readingTime(post.body),
        tags,
      };
    })
  );
}
