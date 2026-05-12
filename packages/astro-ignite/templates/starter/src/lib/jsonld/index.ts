/**
 * JSON-LD builders. Each function returns a `schema-dts`-typed Schema.org
 * object. Compose multiple into an array and pass to `<JsonLd schemas={[...]}>`
 * to render a single `@graph` script tag.
 *
 * `siteSchemas(locale)` is the standard pair every page should include:
 * Organization + WebSite. Pages add their own page-specific schemas on top.
 */

import { organizationSchema } from './organization';
import { websiteSchema } from './website';

import type { IgniteSchema } from './types';

export { organizationSchema };
export { websiteSchema };
export { personSchema, type PersonInput } from './person';
export { breadcrumbListSchema, type Breadcrumb } from './breadcrumbList';
export { blogPostingSchema, type BlogPostingInput } from './blogPosting';
export { creativeWorkSchema, type CreativeWorkInput } from './creativeWork';
export {
  webPageSchema,
  aboutPageSchema,
  contactPageSchema,
  collectionPageSchema,
  type WebPageInput,
} from './webPage';

export { absoluteUrl, entityId, compact } from './types';
export type { IgniteSchema };

/**
 * The site-wide schemas every page should include. Pages compose:
 *
 *   <JsonLd schemas={[
 *     ...siteSchemas(locale),
 *     blogPostingSchema(...),
 *     breadcrumbListSchema(...),
 *   ]} />
 */
export function siteSchemas(locale: string): IgniteSchema[] {
  return [organizationSchema(locale), websiteSchema(locale)];
}
