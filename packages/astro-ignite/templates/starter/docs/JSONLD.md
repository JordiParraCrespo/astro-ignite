# JSON-LD / Schema.org

The starter template ships typed Schema.org markup via `schema-dts`. All schema nodes are composed into a single `@graph` on each page so cross-references via `@id` resolve correctly.

## How it works

`src/lib/jsonld/` contains one builder file per node type. Layouts import the builders they need and pass the array to `<JsonLd schemas={[...]} />`, which renders a single `<script type="application/ld+json">` tag with a `@graph` envelope:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#organization", ... },
    { "@type": "WebSite", "@id": "https://example.com/#website", ... },
    { "@type": "BlogPosting", "@id": "https://example.com/blog/my-post#blogposting", ... }
  ]
}
```

Cross-references between nodes use `@id` rather than embedding the full object:

```json
{ "@type": "BlogPosting", "author": { "@id": "https://example.com/#person-jordi" }, ... }
```

## Standard page setup

Call `siteSchemas(locale)` to get the Organization + WebSite pair that every page must include, then append page-specific schemas:

```astro
---
import { JsonLd } from '@/components/seo/JsonLd.astro';
import {
  siteSchemas,
  blogPostingSchema,
  breadcrumbListSchema,
} from '@/lib/jsonld';
---

<JsonLd schemas={[
  ...siteSchemas(lang),
  blogPostingSchema({ url, title, description, datePublished, authorSlug, inLanguage: lang }),
  breadcrumbListSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: title, url },
  ]),
]} />
```

## Available builders

| Builder | Type | Typical page |
| --- | --- | --- |
| `siteSchemas(locale)` | Organization + WebSite | Every page |
| `webPageSchema(input)` | WebPage | Generic page |
| `aboutPageSchema(input)` | AboutPage | /about |
| `contactPageSchema(input)` | ContactPage | /contact |
| `collectionPageSchema(input)` | CollectionPage | /blog, /projects |
| `blogPostingSchema(input)` | BlogPosting | /blog/[slug] |
| `creativeWorkSchema(input)` | CreativeWork | /projects/[slug] |
| `personSchema(input, locale)` | Person | Author pages |
| `breadcrumbListSchema(crumbs)` | BreadcrumbList | Any page with hierarchy |

All builders are exported from `@/lib/jsonld` (the barrel at `src/lib/jsonld/index.ts`).

## `@id` conventions

Entity fragments are stable and referenced across nodes:

| Entity | `@id` pattern |
| --- | --- |
| Organization | `${siteUrl}/#organization` |
| WebSite | `${siteUrl}/#website` |
| Person | `${siteUrl}/#person-${slug}` |
| WebPage | `${pageUrl}#webpage` |
| BlogPosting | `${pageUrl}#blogposting` |
| BreadcrumbList | `${pageUrl}#breadcrumbs` |

Use `entityId('organization')` from `@/lib/jsonld` to build these — don't hard-code the URL.

## Helper functions

```ts
import { absoluteUrl, entityId, compact } from '@/lib/jsonld';

absoluteUrl('/blog/my-post')   // → 'https://example.com/blog/my-post'
absoluteUrl('https://...')     // → passes through
entityId('organization')       // → 'https://example.com/#organization'
compact({ a: 1, b: undefined }) // → { a: 1 } (removes undefined/null/empty)
```

## Adding a new node type

1. Create `src/lib/jsonld/product.ts` — define the input interface and builder:

   ```ts
   import type { Product } from 'schema-dts';
   import { absoluteUrl, compact, entityId } from './types';

   export interface ProductInput {
     url: string;
     name: string;
     description: string;
     image?: string;
     inLanguage: string;
   }

   export function productSchema(input: ProductInput): Product {
     const url = absoluteUrl(input.url);
     return compact({
       '@type': 'Product',
       '@id': `${url}#product`,
       name: input.name,
       description: input.description,
       brand: { '@id': entityId('organization') },
       image: input.image ? absoluteUrl(input.image) : undefined,
       inLanguage: input.inLanguage,
     }) as Product;
   }
   ```

2. Export from the barrel (`src/lib/jsonld/index.ts`):

   ```ts
   export { productSchema, type ProductInput } from './product';
   ```

3. Use it in a layout:

   ```astro
   import { siteSchemas, productSchema } from '@/lib/jsonld';
   // ...
   <JsonLd schemas={[...siteSchemas(lang), productSchema({ ... })]} />
   ```

## What to add where

- **Every page** — `siteSchemas(lang)` + a `WebPage`-variant schema
- **Blog post layout** — `blogPostingSchema` + `personSchema` (for the author) + `breadcrumbListSchema`
- **Project layout** — `creativeWorkSchema` + `breadcrumbListSchema`
- **Index pages** (`/blog`, `/projects`) — `collectionPageSchema`
- **About page** — `aboutPageSchema` + `personSchema` (for the primary author)
- **Contact page** — `contactPageSchema`

## TypeScript

All builders are typed via `schema-dts`. The `IgniteSchema` type union (`Thing`) covers every possible return type — pass an `IgniteSchema[]` to `<JsonLd>`.

```ts
import type { IgniteSchema } from '@/lib/jsonld';

const schemas: IgniteSchema[] = [
  ...siteSchemas(lang),
  webPageSchema({ url: '/', title, description, inLanguage: lang }),
];
```

If `schema-dts` doesn't cover a niche type you need (e.g. `Event`, `Recipe`), add the `@type` string manually and cast — the `compact()` helper still strips undefined fields:

```ts
const event = compact({
  '@type': 'Event' as const,
  name: 'Launch day',
  startDate: '2025-01-01',
  organizer: { '@id': entityId('organization') },
}) as Thing;
```
