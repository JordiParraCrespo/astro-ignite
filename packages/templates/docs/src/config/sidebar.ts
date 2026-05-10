/**
 * Sidebar configuration.
 *
 * Each `group` is a section heading; `items` are the links underneath.
 * `slug` references a doc entry by its content-collection id (filename
 * without extension, e.g. `getting-started/introduction` for
 * `src/content/docs/getting-started/introduction.mdx`).
 *
 * Edit this file to reshape the sidebar — order, grouping, labels.
 */

export interface SidebarItem {
  /** Slug of a doc entry, OR an external URL (starts with http). */
  slug: string;
  /** Override the label; defaults to the doc's frontmatter title. */
  label?: string;
  /** Optional inline badge (e.g. "new", "soon"). */
  badge?: string;
}

export interface SidebarGroup {
  group: string;
  items: SidebarItem[];
  /** Collapsed by default? (UI hint, not enforced.) */
  collapsed?: boolean;
}

export const sidebar: SidebarGroup[] = [
  {
    group: 'Start here',
    items: [{ slug: 'introduction' }, { slug: 'quick-start' }, { slug: 'the-five-prompts' }],
  },
  {
    group: 'Coming soon',
    items: [{ slug: 'roadmap' }],
  },
];
