/**
 * Shared JSON-LD types and helpers.
 *
 * All schema builders return `schema-dts`-typed objects. They're composed into
 * a `@graph` by `<JsonLd>` so cross-references via `@id` resolve correctly:
 *
 *   - Organization @id: `${url}#organization`
 *   - WebSite @id: `${url}#website`
 *   - Person @id: `${url}#person-${slug}`
 *   - BlogPosting @id: `${url}#blogposting`
 *   - WebPage @id: `${url}#webpage`
 *   - BreadcrumbList @id: `${url}#breadcrumbs`
 */

import type { Thing } from 'schema-dts';

import { siteConfig } from '@/config/site';

/** Build an absolute URL from a path. Site URL anchor; path is relative. */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = siteConfig.url.replace(/\/$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
}

/** Build a `@id` URL for a logical entity (e.g. `'#organization'` → full URL with fragment). */
export function entityId(fragment: string): string {
  const base = siteConfig.url.replace(/\/$/, '');
  return `${base}/#${fragment.replace(/^#/, '')}`;
}

/** Drop undefined keys from a JSON-LD object so the rendered script is clean. */
export function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === 'object' && !Array.isArray(v)) {
      const nested = compact(v as Record<string, unknown>);
      if (Object.keys(nested).length > 0) out[k] = nested;
      continue;
    }
    out[k] = v;
  }
  return out as T;
}

/** Composable Thing — the union of every schema type a builder might return. */
export type IgniteSchema = Thing;
