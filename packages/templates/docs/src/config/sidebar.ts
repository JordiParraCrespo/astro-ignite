/**
 * Sidebar configuration.
 *
 * Each `group` is a section heading; `items` are the links underneath.
 * `slug` references one of:
 *   - a doc entry by its content-collection id (filename without extension)
 *   - an absolute path like `/components/button` (any Astro page route)
 *   - an external URL (starts with `http`)
 *
 * For translatable labels, use `groupKey` / `labelKey` (i18n dictionary path);
 * fall back to the literal `group` / `label` when no key is provided.
 *
 * `tab` splits the sidebar into top-level sections (a segmented row above the
 * groups, like Mintlify's tabs). Groups sharing a `tab` show together; groups
 * without one show under every tab. The row only renders once two or more
 * distinct tabs exist, so a single-section site never sees it.
 *
 * Edit this file to reshape the sidebar — order, grouping, labels.
 */

import type { TranslationKey } from '@/i18n';
import type { IconName } from '@/components/docs/icons';

export interface SidebarItem {
  /** Doc-collection slug, absolute path (`/...`), or external URL. */
  slug: string;
  /** Override the label; defaults to the doc's frontmatter title. */
  label?: string;
  /** Translation key for the label — wins over `label` if both set. */
  labelKey?: TranslationKey;
  /** Optional inline badge (e.g. "new", "soon"). */
  badge?: string;
  /** Optional leading icon. */
  icon?: IconName;
}

export interface SidebarGroup {
  group: string;
  /** Translation key for the group heading — wins over `group` if set. */
  groupKey?: TranslationKey;
  items: SidebarItem[];
  /** Collapsed by default? Renders as a foldable section. */
  collapsed?: boolean;
  /** Optional icon shown before the group heading. */
  icon?: IconName;
  /** Top-level tab this group belongs to (see the file comment). */
  tab?: string;
}

export const sidebar: SidebarGroup[] = [
  {
    group: 'Start here',
    icon: 'rocket',
    groupKey: 'sidebar.startHere',
    items: [
      { slug: 'introduction' },
      { slug: 'quick-start' },
      { slug: 'authoring' },
      { slug: 'features' },
    ],
  },
  {
    group: 'Reference',
    icon: 'file-code',
    groupKey: 'sidebar.reference',
    items: [{ slug: 'benchmarks' }],
  },
  {
    group: 'Project',
    icon: 'git-branch',
    groupKey: 'sidebar.project',
    items: [
      { slug: 'roadmap' },
      { slug: 'https://github.com/JordiParraCrespo/astro-ignite', label: 'GitHub' },
    ],
  },
];
