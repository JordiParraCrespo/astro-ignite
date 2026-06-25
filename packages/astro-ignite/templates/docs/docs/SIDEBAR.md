# Sidebar navigation

The docs template generates a 3-column layout with a sidebar on the left. The sidebar is configured entirely in `src/config/sidebar.ts` — no MDX frontmatter or filesystem conventions drive it; you control order and grouping explicitly.

## Structure

The sidebar is a flat array of `SidebarGroup` entries. Each group is a collapsible section with a heading and an ordered list of links:

```ts
// src/config/sidebar.ts
export const sidebar: SidebarGroup[] = [
  {
    group: 'Getting started',
    groupKey: 'sidebar.gettingStarted', // optional i18n key
    items: [
      { slug: 'introduction' },          // → /introduction (current locale)
      { slug: 'quick-start' },
      { slug: 'configuration' },
    ],
  },
  {
    group: 'Reference',
    collapsed: true,                     // collapsed by default
    items: [
      { slug: 'api', label: 'API reference' }, // override the doc's title
      { slug: 'https://github.com/...', label: 'GitHub' }, // external URL
    ],
  },
];
```

## `SidebarItem` fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `slug` | `string` | yes | Doc entry slug, absolute path, or external URL |
| `label` | `string` | no | Overrides the doc's frontmatter `title` |
| `labelKey` | `TranslationKey` | no | i18n key — wins over `label` if both set |
| `badge` | `string` | no | Inline badge text (e.g. `'new'`, `'soon'`) |

## `SidebarGroup` fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `group` | `string` | yes | Section heading (fallback if no `groupKey`) |
| `groupKey` | `TranslationKey` | no | i18n key for the heading — wins over `group` |
| `items` | `SidebarItem[]` | yes | Ordered list of links in this section |
| `collapsed` | `boolean` | no | Render as folded on first load |

## Slug resolution

`slug` is resolved differently depending on the value:

- **Doc entry slug** (e.g. `'introduction'`) — maps to `/{locale}/introduction` for non-default locales and `/introduction` for the default locale. The component automatically prefixes the current locale.
- **Absolute path** (starts with `/`) — used as-is. Useful for Astro pages outside the docs collection (e.g. `/components/button`). Not locale-prefixed.
- **External URL** (starts with `http`) — renders as an external link with `target="_blank"`.

Doc slugs in `sidebar.ts` should NOT include the locale prefix — the renderer adds it at render time based on `Astro.params.lang`.

## Ordering within a group

Items render in array order. There is no automatic sorting. The `order` frontmatter field has no effect on sidebar position — it is only used for prev/next navigation. To reorder sidebar items, reorder the array.

## Prev / Next links

`src/components/docs/PrevNext.astro` derives prev/next from the flattened sidebar — the same order the sidebar defines. If a page isn't in `sidebar.ts`, it won't appear in prev/next links (it still renders if a user navigates to it directly).

## Translating group headings and labels

Add the key to `src/i18n/en.json`:

```json
{
  "sidebar.gettingStarted": "Getting started",
  "sidebar.reference": "Reference"
}
```

Add translated values to every other locale file. Then reference via `groupKey`:

```ts
{ group: 'Getting started', groupKey: 'sidebar.gettingStarted', items: [...] }
```

If `groupKey` is missing the literal `group` string is shown — acceptable for groups that don't need translation.

## Hiding a page from the sidebar

Add `draft: true` to the page's frontmatter — the page will still render if hit directly, but it won't appear in the sidebar or in prev/next links. Useful for work-in-progress content.

```yaml
---
title: Unreleased feature
description: Not ready yet.
draft: true
---
```

## Badges

Use `badge` to surface status labels inline with a sidebar item:

```ts
{ slug: 'webhooks', label: 'Webhooks', badge: 'new' },
{ slug: 'ai-integration', label: 'AI integration', badge: 'soon' },
```

Badges render as small pill tags next to the link. The text is arbitrary — any short string works.

## Breadcrumbs

`src/components/docs/Breadcrumbs.astro` derives the breadcrumb trail from the URL path and the doc's frontmatter `title`. No sidebar configuration is required. The top-level entry always points to the home route (`/`).

## Adding a page outside the docs collection

If you need a custom Astro page (e.g. an interactive demo at `/playground`) in the sidebar:

1. Create `src/pages/playground.astro` (and `src/pages/[lang]/playground.astro` if you want it localised)
2. Add it to `sidebar.ts` using an absolute path:
   ```ts
   { slug: '/playground', label: 'Playground', badge: 'new' }
   ```

Absolute-path items are not locale-prefixed, so ensure the route handles locale logic itself if needed.
