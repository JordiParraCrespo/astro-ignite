/**
 * Content collections for the docs template — Zod-typed, MDX-driven.
 *
 * - `docs`: per-locale documentation entries at `src/content/docs/<locale>/...`.
 *   Entry id is `<locale>/<slug>` (e.g. `en/introduction`). The sidebar
 *   config in `src/config/sidebar.ts` references slugs WITHOUT the locale
 *   prefix; the resolver adds the current locale at render time.
 *
 * - `legal`: privacy / terms / cookies templates per locale, identical shape
 *   to the starter template's collection. Renders via `src/pages/legal/[...slug].astro`
 *   with locale-aware parallels in `[lang]/legal/[...slug].astro`.
 */

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    title: z.string().min(1).max(70),
    description: z.string().min(40).max(160),
    /** Optional canonical URL for republished content. */
    canonical: z.string().url().optional(),
    /** Hide from sidebar + sitemap. Page still renders if hit directly. */
    draft: z.boolean().default(false),
    /** Hide from search engines. */
    noindex: z.boolean().default(false),
    /** Date the doc was last meaningfully updated. */
    lastUpdated: z.coerce.date().optional(),
    /** Reading time override (auto-computed from word count if omitted). */
    readingTime: z.number().optional(),
    /** Optional in-line tags rendered above the title. */
    tags: z.array(z.string()).default([]),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/content/legal' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    lastUpdated: z.coerce.date(),
    version: z.string().default('1.0'),
  }),
});

export const collections = { docs, legal };
