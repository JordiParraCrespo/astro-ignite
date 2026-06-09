/**
 * Projects data helpers — the single source of truth for querying the
 * `projects` collection across routes (index, single project, llms.txt).
 * Centralised here because the same locale-filter + sort + slug logic is
 * needed by several route files and would otherwise drift.
 *
 * Conventions: entry ids are `<locale>/<slug>` — the glob loader matches an
 * `index.mdx` two folders deep, and Astro strips the trailing `/index`.
 */

import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

/** Sort direction by `datePublished`: `'desc'` = newest first (default). */
export type SortOrder = 'asc' | 'desc';

const byDate =
  (order: SortOrder) =>
  (a: Project, b: Project): number => {
    const delta = +a.data.datePublished - +b.data.datePublished;
    return order === 'asc' ? delta : -delta;
  };

/** Slug without the locale prefix (e.g. `en/example` → `example`). */
export function projectSlug(project: Project): string {
  return project.id.split('/').slice(1).join('/');
}

/** Non-draft projects for one locale, sorted by `datePublished` (newest first by default). */
export async function getProjectsForLocale(
  locale: string,
  order: SortOrder = 'desc'
): Promise<Project[]> {
  const projects = await getCollection(
    'projects',
    (e: Project) => !e.data.draft && e.id.startsWith(`${locale}/`)
  );
  return projects.sort(byDate(order));
}
