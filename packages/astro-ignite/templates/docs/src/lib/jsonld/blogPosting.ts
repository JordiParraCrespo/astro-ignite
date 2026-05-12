import type { BlogPosting } from 'schema-dts';

import { absoluteUrl, compact, entityId } from './types';

export interface BlogPostingInput {
  url: string; // canonical URL (absolute or relative)
  title: string;
  description: string;
  datePublished: Date;
  dateModified?: Date;
  authorSlug: string; // stable id; references Person via @id
  image?: string; // absolute or relative; OG/hero image
  imageAlt?: string;
  keywords?: string[];
  wordCount?: number;
  inLanguage: string;
}

/**
 * BlogPosting schema. References Organization (publisher) and Person (author)
 * by `@id` so the @graph stays normalized.
 */
export function blogPostingSchema(input: BlogPostingInput): BlogPosting {
  const url = absoluteUrl(input.url);
  return compact({
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    headline: input.title,
    description: input.description,
    image: input.image
      ? {
          '@type': 'ImageObject',
          url: absoluteUrl(input.image),
          ...(input.imageAlt ? { caption: input.imageAlt } : {}),
        }
      : undefined,
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    author: { '@id': entityId(`person-${input.authorSlug}`) },
    publisher: { '@id': entityId('organization') },
    mainEntityOfPage: url,
    inLanguage: input.inLanguage,
    keywords: input.keywords?.length ? input.keywords.join(', ') : undefined,
    wordCount: input.wordCount,
  }) as BlogPosting;
}
