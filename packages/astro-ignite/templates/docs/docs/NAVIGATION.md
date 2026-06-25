# Navigation

The docs layout has four navigation surfaces: sidebar, on-page TOC, prev/next links, and breadcrumbs. All are derived from content and config — no manual route registration.

## Sidebar

The sidebar is defined in `src/config/sidebar.ts`. Edit this file to reshape sections, order links, and add external references.

### Structure

```ts
export const sidebar: SidebarGroup[] = [
  {
    group: 'Start here', // section heading (visible text)
    groupKey: 'sidebar.startHere', // optional i18n key — wins over `group` when set
    items: [
      { slug: 'introduction' },
      { slug: 'quick-start', label: 'Quick start' },
      { slug: 'authoring', badge: 'new' },
    ],
  },
];
```

### Slug types

| Value                    | Resolves to                                               |
| ------------------------ | --------------------------------------------------------- |
| `'introduction'`         | Doc entry at `src/content/docs/{locale}/introduction.mdx` |
| `'/components/button'`   | Absolute Astro page route `/components/button`            |
| `'https://github.com/…'` | External link (opens in new tab, gets ↗ icon)             |

### Item fields

| Field      | Type             | Description                                                        |
| ---------- | ---------------- | ------------------------------------------------------------------ |
| `slug`     | `string`         | Required. Doc slug, absolute path, or external URL.                |
| `label`    | `string`         | Override the link text. Defaults to the doc's frontmatter `title`. |
| `labelKey` | `TranslationKey` | i18n key for the label — wins over `label` if both are set.        |
| `badge`    | `string`         | Inline tag shown after the label (e.g. `'new'`, `'beta'`).         |

### Collapsed groups

A group can start collapsed on mobile and expand on interaction:

```ts
{
  group: 'Reference',
  collapsed: true,
  items: [{ slug: 'api' }],
}
```

Collapsed groups are rendered with the same visual style as expanded ones — `collapsed` is a hint for future drawer-style rendering; the current implementation shows all items.

### Hiding items with no translation

The sidebar automatically hides items that have no doc entry in the current locale. If `src/content/docs/es/quick-start.mdx` doesn't exist, the "Quick start" link is omitted from the Spanish sidebar without any config change.

### Adding a new section

1. Append a `SidebarGroup` object to the `sidebar` array.
2. Add i18n strings for `groupKey` (and any `labelKey` values) to each locale file in `src/i18n/`.

## On-page TOC

`src/components/docs/OnThisPage.astro` receives Astro's `headings` array from `entry.render()` and renders H2 + H3 anchors as the right-column outline.

- H1 is the page title — never appears in the TOC.
- H4 and deeper are intentionally excluded as too granular.
- Active section is tracked via `IntersectionObserver`, highlighted with a left border.

To include H4s, edit the filter in `OnThisPage.astro`:

```ts
const items = headings.filter((h) => h.depth === 2 || h.depth === 3 || h.depth === 4);
```

The TOC only renders when a page has at least one qualifying heading — pages with no H2/H3 headings get no right column.

## Prev / Next links

`src/components/docs/PrevNext.astro` orders pages by the `order` frontmatter field within each section (folder):

```yaml
---
title: Install
order: 2
---
```

Pages without an `order` field sort alphabetically by slug after ordered pages. Pages in different sidebar groups don't link to each other — prev/next navigation stays within a group's items as defined in `sidebar.ts`.

## Breadcrumbs

`src/components/docs/Breadcrumbs.astro` derives the crumb path from the URL segments — no config needed. A page at `/guide/install` produces "Guide / Install". Folder names are title-cased automatically.

To rename a breadcrumb segment without renaming the folder, set a `section` key in the page's frontmatter:

```yaml
---
title: Install
section: Getting started
---
```

If the `section` field is present, it overrides the folder-name-derived segment.
