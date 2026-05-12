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
 * Edit this file to reshape the sidebar — order, grouping, labels.
 */

import type { TranslationKey } from '@/i18n';

export interface SidebarItem {
  /** Doc-collection slug, absolute path (`/...`), or external URL. */
  slug: string;
  /** Override the label; defaults to the doc's frontmatter title. */
  label?: string;
  /** Translation key for the label — wins over `label` if both set. */
  labelKey?: TranslationKey;
  /** Optional inline badge (e.g. "new", "soon"). */
  badge?: string;
}

export interface SidebarGroup {
  group: string;
  /** Translation key for the group heading — wins over `group` if set. */
  groupKey?: TranslationKey;
  items: SidebarItem[];
  /** Collapsed by default? Renders as a foldable section. */
  collapsed?: boolean;
}

export const sidebar: SidebarGroup[] = [
  {
    group: 'Start here',
    groupKey: 'sidebar.startHere',
    items: [{ slug: 'introduction' }, { slug: 'quick-start' }, { slug: 'features' }],
  },
  {
    group: 'Reference',
    groupKey: 'sidebar.reference',
    items: [{ slug: 'benchmarks' }],
  },
  {
    group: 'Components',
    groupKey: 'components.group',
    collapsed: true,
    items: [
      { slug: '/components', labelKey: 'components.overview' },
      { slug: '/components/button', label: 'button' },
      { slug: '/components/link', label: 'link' },
      { slug: '/components/badge', label: 'badge' },
      { slug: '/components/card', label: 'card' },
      { slug: '/components/input', label: 'input' },
      { slug: '/components/textarea', label: 'textarea' },
      { slug: '/components/label', label: 'label' },
      { slug: '/components/separator', label: 'separator' },
      { slug: '/components/alert', label: 'alert' },
      { slug: '/components/avatar', label: 'avatar' },
      { slug: '/components/skeleton', label: 'skeleton' },
      { slug: '/components/kbd', label: 'kbd' },
      { slug: '/components/tabs', label: 'tabs' },
      { slug: '/components/accordion', label: 'accordion' },
      { slug: '/components/dialog', label: 'dialog' },
      { slug: '/components/dropdown-menu', label: 'dropdown-menu' },
      { slug: '/components/tooltip', label: 'tooltip' },
      { slug: '/components/toast', label: 'toast' },
    ],
  },
  {
    group: 'Blocks',
    groupKey: 'blocks.group',
    collapsed: true,
    items: [
      { slug: '/blocks', labelKey: 'blocks.overview' },
      { slug: '/blocks/page-hero', label: 'page-hero' },
      { slug: '/blocks/breadcrumb', label: 'breadcrumb' },
      { slug: '/blocks/release-pill', label: 'release-pill' },
      { slug: '/blocks/command-block', label: 'command-block' },
      { slug: '/blocks/terminal-preview', label: 'terminal-preview' },
      { slug: '/blocks/feature-grid', label: 'feature-grid' },
      { slug: '/blocks/post-list', label: 'post-list' },
      { slug: '/blocks/prev-next-nav', label: 'prev-next-nav' },
      { slug: '/blocks/author-card', label: 'author-card' },
      { slug: '/blocks/project-card', label: 'project-card' },
      { slug: '/blocks/metadata-grid', label: 'metadata-grid' },
      { slug: '/blocks/toc-rail', label: 'toc-rail' },
      { slug: '/blocks/not-found-state', label: 'not-found-state' },
      { slug: '/blocks/notice-banner', label: 'notice-banner' },
    ],
  },
  {
    group: 'Project',
    groupKey: 'sidebar.project',
    items: [
      { slug: 'roadmap' },
      { slug: 'https://github.com/JordiParraCrespo/astro-ignite', label: 'GitHub' },
    ],
  },
];
