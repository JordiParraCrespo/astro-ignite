import type { BreadcrumbList, ListItem } from 'schema-dts';

import { absoluteUrl, compact } from './types';

export interface Breadcrumb {
  name: string;
  url: string; // relative or absolute
}

/**
 * BreadcrumbList for a page hierarchy. Always include the trail starting from
 * the home page so search engines can render the full breadcrumb in SERPs.
 */
export function breadcrumbListSchema(crumbs: Breadcrumb[]): BreadcrumbList {
  const itemListElement: ListItem[] = crumbs.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.url),
  }));

  return compact({
    '@type': 'BreadcrumbList',
    itemListElement,
  }) as BreadcrumbList;
}
