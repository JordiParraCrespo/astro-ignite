# JSON-LD / Schema.org

This template ships typed Schema.org markup via `schema-dts`. All schema nodes are composed into a single `@graph` on each page so cross-references via `@id` resolve correctly.

## How it works

`src/lib/jsonld/` contains one builder file per node type. Layouts import the builders they need and pass the array to `<JsonLd schemas={[...]} />` (rendered from `BaseLayout.astro`), which emits a single `<script type="application/ld+json">` tag with a `@graph` envelope:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": "https://example.com/#organization", ... },
    { "@type": "WebSite", "@id": "https://example.com/#website", ... },
    { "@type": "WebPage", "@id": "https://example.com/getting-started#webpage", ... },
    { "@type": "BreadcrumbList", "@id": "https://example.com/getting-started#breadcrumbs", ... }
  ]
}
```

Cross-references between nodes use `@id` rather than embedding the full object.

## What's wired up in this template

`BaseLayout.astro` always includes `siteSchemas(locale)` (Organization + WebSite) via the `schemas` prop every layout can pass through. On top of that:

- **`DocsLayout.astro`** (every docs content page) adds `breadcrumbListSchema` (built from the page's sidebar-derived breadcrumb trail) and `webPageSchema` (title, description, `inLanguage`, `dateModified` from the entry's `lastUpdated`).
- **`LegalLayout.astro`** (privacy/terms/cookies) adds the same `breadcrumbListSchema` + `webPageSchema` pair for its own crumb trail.

```astro
---
import { breadcrumbListSchema, webPageSchema } from '@/lib/jsonld';

const schemas = [
  breadcrumbListSchema([
    { name: 'Docs', url: '/' },
    { name: title, url },
  ]),
  webPageSchema({ url, title, description, inLanguage: locale, dateModified: lastUpdated }),
];
---

<BaseLayout title={title} description={description} schemas={schemas}>
  <!-- ... -->
</BaseLayout>
```

## Available builders

The barrel (`src/lib/jsonld/index.ts`) exports more than the two wired up above — the rest are unused in this template's stock pages but are ready if you add page types a docs site doesn't ship by default:

| Builder | Type | Used by | Typical page |
| --- | --- | --- | --- |
| `siteSchemas(locale)` | Organization + WebSite | `BaseLayout` (every page) | Every page |
| `breadcrumbListSchema(crumbs)` | BreadcrumbList | `DocsLayout`, `LegalLayout` | Any page with hierarchy |
| `webPageSchema(input)` | WebPage | `DocsLayout`, `LegalLayout` | Generic page |
| `aboutPageSchema(input)` | AboutPage | _not wired up_ | Add if you build an /about page |
| `contactPageSchema(input)` | ContactPage | _not wired up_ | Add if you build a /contact page |
| `collectionPageSchema(input)` | CollectionPage | _not wired up_ | Add if you build an index/listing page |
| `personSchema(input, locale)` | Person | _not wired up_ | Add if you build author/team pages |

> The `jsonld/` directory also ships `blogPosting.ts` and `creativeWork.ts` builder files (mirroring the starter template, which does use them for its blog/projects collections). This docs template has no blog or projects collection, so those two builders aren't exported from the barrel and aren't reachable from any page — leave them alone unless you're adding blog-style content to a docs site.

All wired-up builders are exported from `@/lib/jsonld` (the barrel at `src/lib/jsonld/index.ts`).

## `@id` conventions

Entity fragments are stable and referenced across nodes:

| Entity | `@id` pattern |
| --- | --- |
| Organization | `${siteUrl}/#organization` |
| WebSite | `${siteUrl}/#website` |
| WebPage | `${pageUrl}#webpage` |
| BreadcrumbList | `${pageUrl}#breadcrumbs` |

Use `entityId('organization')` from `@/lib/jsonld` to build these — don't hard-code the URL.

## Helper functions

```ts
import { absoluteUrl, entityId, compact } from '@/lib/jsonld';

absoluteUrl('/getting-started'); // → 'https://example.com/getting-started'
absoluteUrl('https://...'); // → passes through
entityId('organization'); // → 'https://example.com/#organization'
compact({ a: 1, b: undefined }); // → { a: 1 } (removes undefined/null/empty)
```

## Adding a new node type

1. Create `src/lib/jsonld/faq.ts` — define the input interface and builder:

   ```ts
   import type { FAQPage } from 'schema-dts';
   import { absoluteUrl, compact } from './types';

   export interface FaqInput {
     url: string;
     questions: { question: string; answer: string }[];
   }

   export function faqPageSchema(input: FaqInput): FAQPage {
     const url = absoluteUrl(input.url);
     return compact({
       '@type': 'FAQPage',
       '@id': `${url}#faq`,
       mainEntity: input.questions.map((q) => ({
         '@type': 'Question',
         name: q.question,
         acceptedAnswer: { '@type': 'Answer', text: q.answer },
       })),
     }) as FAQPage;
   }
   ```

2. Export from the barrel (`src/lib/jsonld/index.ts`):

   ```ts
   export { faqPageSchema, type FaqInput } from './faq';
   ```

3. Use it in a layout or page:

   ```astro
   import { siteSchemas, faqPageSchema } from '@/lib/jsonld';
   // ...
   <BaseLayout schemas={[...siteSchemas(lang), faqPageSchema({ ... })]}>
   ```

## TypeScript

All builders are typed via `schema-dts`. The `IgniteSchema` type union (`Thing`) covers every possible return type — pass an `IgniteSchema[]` to the `schemas` prop.

```ts
import type { IgniteSchema } from '@/lib/jsonld';

const schemas: IgniteSchema[] = [
  ...siteSchemas(lang),
  webPageSchema({ url: '/', title, description, inLanguage: lang }),
];
```

If `schema-dts` doesn't cover a niche type you need, add the `@type` string manually and cast — `compact()` still strips undefined fields:

```ts
const event = compact({
  '@type': 'Event' as const,
  name: 'Launch day',
  startDate: '2025-01-01',
  organizer: { '@id': entityId('organization') },
}) as Thing;
```
