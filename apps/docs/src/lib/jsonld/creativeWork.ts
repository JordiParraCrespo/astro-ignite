import type { CreativeWork } from 'schema-dts';

import { absoluteUrl, compact, entityId } from './types';

export interface CreativeWorkInput {
  url: string;
  title: string;
  description: string;
  datePublished: Date;
  dateModified?: Date;
  image?: string;
  imageAlt?: string;
  inLanguage: string;
  /** Optional CreativeWork.creativeWorkStatus — feeds project status badge. */
  status?: string;
  /** Tech stack / keywords. */
  keywords?: string[];
  /** Optional creator override; defaults to site Organization. */
  creatorName?: string;
}

/**
 * CreativeWork schema for portfolio/case-study pages. Generic enough to fit
 * most project types; users with code-heavy portfolios may swap to
 * SoftwareApplication, design portfolios may switch to ImageObject collections.
 */
export function creativeWorkSchema(input: CreativeWorkInput): CreativeWork {
  const url = absoluteUrl(input.url);
  return compact({
    '@type': 'CreativeWork',
    '@id': `${url}#creativework`,
    name: input.title,
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
    creator: input.creatorName
      ? { '@type': 'Person', name: input.creatorName }
      : { '@id': entityId('organization') },
    publisher: { '@id': entityId('organization') },
    url,
    inLanguage: input.inLanguage,
    creativeWorkStatus: input.status,
    keywords: input.keywords?.length ? input.keywords.join(', ') : undefined,
  }) as CreativeWork;
}
