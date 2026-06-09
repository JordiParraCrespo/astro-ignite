/**
 * Blog data helpers — the single source of truth for querying the `blog`
 * collection across routes (index, pagination, tags, single post). Centralised
 * here because the same locale-filter + sort + adjacency + tag logic is needed
 * by six route files and would otherwise drift.
 *
 * Conventions: entry ids are `<locale>/<slug>` (Astro 6 i18n collections).
 * Lists are newest-first by `datePublished`.
 */

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { siteConfig } from '@/config/site';

export type BlogPost = CollectionEntry<'blog'>;

/** Posts per page on the blog index + `/blog/page/<n>` routes. */
export const POSTS_PER_PAGE = 6;

const byDateDesc = (a: BlogPost, b: BlogPost) => +b.data.datePublished - +a.data.datePublished;

/** Slug without the locale prefix (e.g. `en/welcome` → `welcome`). */
export function postSlug(post: BlogPost): string {
  return post.id.split('/').slice(1).join('/');
}

/** Non-draft posts for one locale, newest first. */
export async function getPostsForLocale(locale: string): Promise<BlogPost[]> {
  const posts = await getCollection(
    'blog',
    (e: BlogPost) => !e.data.draft && e.id.startsWith(`${locale}/`)
  );
  return posts.sort(byDateDesc);
}

export interface AdjacentPosts {
  /** The chronologically previous (older) post, if any. */
  prev?: BlogPost;
  /** The chronologically next (newer) post, if any. */
  next?: BlogPost;
}

/**
 * Newer/older neighbours of `current` within a newest-first `posts` list.
 * `next` is the newer post (earlier in the list), `prev` is the older one.
 */
export function adjacentPosts(posts: BlogPost[], current: BlogPost): AdjacentPosts {
  const i = posts.findIndex((p) => p.id === current.id);
  if (i === -1) return {};
  return {
    next: i > 0 ? posts[i - 1] : undefined,
    prev: i < posts.length - 1 ? posts[i + 1] : undefined,
  };
}

/**
 * Up to `limit` posts that share the most tags with `current` (same locale),
 * ranked by shared-tag count then recency. Empty when `current` has no tags.
 */
export function relatedPosts(posts: BlogPost[], current: BlogPost, limit = 3): BlogPost[] {
  const tags = new Set(current.data.tags);
  if (tags.size === 0) return [];
  return posts
    .filter((p) => p.id !== current.id)
    .map((p) => ({ post: p, score: p.data.tags.filter((tag) => tags.has(tag)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || +b.post.data.datePublished - +a.post.data.datePublished)
    .slice(0, limit)
    .map((x) => x.post);
}

/** URL-safe tag slug (lowercased + encoded). */
export function tagSlug(tag: string): string {
  return encodeURIComponent(tag.toLowerCase());
}

export interface TagCount {
  tag: string;
  count: number;
}

/** Unique tags across `posts`, with counts, sorted by count desc then name. */
export function collectTags(posts: BlogPost[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Non-default locales — the set the `[lang]/` route tree generates paths for. */
export function nonDefaultLocales(): string[] {
  return siteConfig.locales.filter((l) => l !== siteConfig.defaultLocale);
}

export interface PageMeta {
  current: number;
  total: number;
  /** Absolute (locale-aware) URL of the previous page, if any. */
  prevUrl?: string;
  /** Absolute (locale-aware) URL of the next page, if any. */
  nextUrl?: string;
}
