/**
 * Content collections — typed via Zod, loaded via Astro 6's `glob` loader.
 *
 * Conventions:
 *   - Per-locale folder structure: src/content/<collection>/<locale>/<slug>...
 *   - Authors are language-neutral except for `bio` which is locale-keyed
 *   - All public-facing schemas length-cap title (≤70) + description (70-160)
 *     to enforce SEO-friendly metadata at build time
 *   - draft + featured booleans default to false
 */

import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(70),
      description: z.string().min(70).max(160),
      datePublished: z.coerce.date(),
      dateModified: z.coerce.date().optional(),
      author: reference('authors'),
      heroImage: image(),
      heroImageAlt: z.string().min(1),
      ogImage: image().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      canonical: z.string().url().optional(),
      noindex: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*/*/index.mdx', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(70),
      description: z.string().min(70).max(160),
      summary: z.string().min(1).max(280),
      datePublished: z.coerce.date(),
      dateUpdated: z.coerce.date().optional(),
      heroImage: image(),
      heroImageAlt: z.string().min(1),
      ogImage: image().optional(),
      techStack: z.array(z.string()).default([]),
      links: z
        .object({
          live: z.string().url().optional(),
          repo: z.string().url().optional(),
          demo: z.string().url().optional(),
          caseStudy: z.string().url().optional(),
        })
        .default({}),
      role: z.string().optional(),
      client: z.string().optional(),
      status: z.enum(['shipped', 'in-progress', 'archived']).default('shipped'),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
    }),
});

const authors = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      bio: z.record(z.string(), z.string()),
      image: image(),
      url: z.string().url().optional(),
      email: z.string().email().optional(),
      social: z
        .object({
          twitter: z.string().url().optional(),
          github: z.string().url().optional(),
          linkedin: z.string().url().optional(),
          mastodon: z.string().url().optional(),
          bluesky: z.string().url().optional(),
        })
        .default({}),
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

export const collections = { blog, projects, authors, legal };
