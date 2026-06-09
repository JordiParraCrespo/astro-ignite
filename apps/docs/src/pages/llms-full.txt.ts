/**
 * llms-full.txt — the full text of every documentation page in one file,
 * served at /llms-full.txt. Where /llms.txt is an index of links, this is the
 * complete corpus an agent can ingest in a single fetch. Companion to the
 * per-page `.md` routes.
 *
 * One file covers every configured locale; default-locale pages come first,
 * then the rest in path order so the bundle is stable across builds.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { siteConfig } from '@/config/site';
import { docToMarkdown, pageHref } from '@/lib/docs-md';

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(siteConfig.url)).origin;
  const { defaultLocale, locales } = siteConfig;

  const docs = (
    await getCollection('docs', (e: CollectionEntry<'docs'>) => !e.data.draft && !e.data.noindex)
  ).filter((e) => locales.includes(e.id.split('/')[0]!));

  docs.sort((a, b) => {
    const la = a.id.split('/')[0]!;
    const lb = b.id.split('/')[0]!;
    if (la !== lb) {
      if (la === defaultLocale) return -1;
      if (lb === defaultLocale) return 1;
    }
    return pageHref(a.id).localeCompare(pageHref(b.id));
  });

  const header = [
    `# ${siteConfig.name[defaultLocale]}`,
    '',
    `> ${siteConfig.description[defaultLocale] ?? ''}`,
    '',
    'The full text of every documentation page, concatenated for LLMs and AI ' +
      `agents. Link index: ${origin}/llms.txt. Per-page Markdown: append .md to ` +
      'any page URL (home pages map to index.md: / → /index.md).',
    '',
  ].join('\n');

  const sections = docs.map(
    (entry) => `---\n\nSource: ${origin + pageHref(entry.id)}\n\n${docToMarkdown(entry)}`
  );

  const body = `${header}\n${sections.join('\n')}`.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
