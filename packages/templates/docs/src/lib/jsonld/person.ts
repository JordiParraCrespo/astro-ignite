import type { Person } from 'schema-dts';

import { absoluteUrl, compact, entityId } from './types';

export interface PersonInput {
  /** Stable slug (matches authors collection id). Used in `@id`. */
  slug: string;
  name: string;
  /** Bio for the requested locale (already resolved by caller). */
  bio?: string;
  image?: string;
  url?: string;
  email?: string;
  social?: Record<string, string | undefined>;
}

/**
 * Person schema for authors. Referenced from `BlogPosting.author` via `@id`.
 */
export function personSchema(input: PersonInput, locale: string): Person {
  const sameAs = Object.values(input.social ?? {}).filter(
    (v): v is string => typeof v === 'string' && v.length > 0
  );

  return compact({
    '@type': 'Person',
    '@id': entityId(`person-${input.slug}`),
    name: input.name,
    description: input.bio,
    image: input.image ? absoluteUrl(input.image) : undefined,
    url: input.url,
    email: input.email,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    inLanguage: locale,
  }) as Person;
}
