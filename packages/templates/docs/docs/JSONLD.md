# JSON-LD / Schema.org

The docs template ships typed Schema.org markup via `schema-dts`. All schema nodes are composed into a single `@graph` on each page so cross-references via `@id` resolve correctly.

## How it works

`src/lib/jsonld/` contains one builder file per node type. Layouts import the builders they need and pass the array to `<JsonLd schemas={[...]} />`, which renders a single `<script type="application/ld+json">` tag with a `@graph` envelope:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#organization", ... },
    { "@type": "WebSite", "@id": "https://example.com/#website", ... },
    { "@type": "WebPage", "@id": "https://example.com/quick-start#webpage", ... },
    { "@type": "BreadcrumbList", "@id": "https://example.com/quick-start#breadcrumbs", ... }
  ]
}
```

Cross-references between nodes use `@id` rather than embedding the full object:

```json
{ "@type": "WebSite", "publisher": { "@id": "https://example.com/#organization" }, ... }
```

## Standard page setup

`DocsLayout` handles the `@graph` for you — it calls `siteSchemas(lang)`, `webPageSchema(...)`, and `breadcrumbListSchema(...)` automatically. You only need to extend this when a page warrants additional schema nodes.

To add schemas from within an `.mdx` doc page:

```astro
---
// src/pages/[...slug].astro (or the equivalent [lang] mirror)
import { siteSchemas, webPageSchema, breadcrumbListSchema } from '@/lib/jsonld';
const schemas = [
  ...siteSchemas(lang),
  webPageSchema({ url, title, description, inLanguage: lang }),
  breadcrumbListSchema([
    { name: 'Home', url: '/' },
    { name: entry.data.title, url },
  ]),
];
---
<DocsLayout {entry} {headings} {schemas} />
```

## Available builders

| Builder | Type | Typical use |
| --- | --- | --- |
| `siteSchemas(locale)` | Organization + WebSite | Every page (auto-included by DocsLayout) |
| `webPageSchema(input)` | WebPage | Generic docs page (auto-included by DocsLayout) |
| `breadcrumbListSchema(crumbs)` | BreadcrumbList | Any page with hierarchy (auto-included by DocsLayout) |
| `aboutPageSchema(input)` | AboutPage | An /about page if you add one |
| `contactPageSchema(input)` | ContactPage | A /contact page if you add one |
| `collectionPageSchema(input)` | CollectionPage | A category or index landing page |
| `blogPostingSchema(input)` | BlogPosting | A changelog or blog-style page |
| `creativeWorkSchema(input)` | CreativeWork | Reference docs, specifications |
| `personSchema(input, locale)` | Person | An author or team member page |

All builders are exported from `@/lib/jsonld` (the barrel at `src/lib/jsonld/index.ts`).

## `@id` conventions

Entity fragments are stable and referenced across nodes:

| Entity | `@id` pattern |
| --- | --- |
| Organization | `${siteUrl}/#organization` |
| WebSite | `${siteUrl}/#website` |
| Person | `${siteUrl}/#person-${slug}` |
| WebPage | `${pageUrl}#webpage` |
| BreadcrumbList | `${pageUrl}#breadcrumbs` |

Use `entityId('organization')` from `@/lib/jsonld` to build these — don't hard-code the URL.

## Helper functions

```ts
import { absoluteUrl, entityId, compact } from '@/lib/jsonld';

absoluteUrl('/quick-start')    // → 'https://example.com/quick-start'
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

3. Use it in a layout or page:

   ```astro
   import { siteSchemas, productSchema } from '@/lib/jsonld';
   // ...
   <JsonLd schemas={[...siteSchemas(lang), productSchema({ ... })]} />
   ```

## TypeScript

All builders are typed via `schema-dts`. The `IgniteSchema` type union (`Thing`) covers every possible return type — pass an `IgniteSchema[]` to `<JsonLd>`.

```ts
import type { IgniteSchema } from '@/lib/jsonld';

const schemas: IgniteSchema[] = [
  ...siteSchemas(lang),
  webPageSchema({ url: '/', title, description, inLanguage: lang }),
];
```

If `schema-dts` doesn't cover a niche type you need (e.g. `Event`), add the `@type` string manually and cast — the `compact()` helper still strips undefined fields:

```ts
const event = compact({
  '@type': 'Event' as const,
  name: 'Launch day',
  startDate: '2025-01-01',
  organizer: { '@id': entityId('organization') },
}) as Thing;
```
