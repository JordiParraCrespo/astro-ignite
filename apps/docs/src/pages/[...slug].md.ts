/**
 * Raw-Markdown route — every doc page is also served at `<path>.md`.
 *
 * The default-locale home renders at `/index.md`; every other page mirrors its
 * HTML path with a `.md` extension (`/quick-start.md`, `/es/quick-start.md`).
 * Powers the doc header's "View / Copy as Markdown" actions and the
 * agent-readable surface alongside `/llms.txt` and `/llms-full.txt`.
 *
 * One file covers every configured locale; entries in unconfigured locales are
 * skipped so the route stays in lock-step with the rendered pages.
 */

import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { siteConfig } from '@/config/site';
import { docToMarkdown, mdSlugParam } from '@/lib/docs-md';

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection(
    'docs',
    (e: CollectionEntry<'docs'>) =>
      !e.data.draft && siteConfig.locales.includes(e.id.split('/')[0]!)
  );
  return docs.map((entry) => ({ params: { slug: mdSlugParam(entry.id) }, props: { entry } }));
};

export const GET: APIRoute = ({ props }) => {
  const entry = props.entry as CollectionEntry<'docs'>;
  return new Response(docToMarkdown(entry), {
    headers: { 'content-type': 'text/markdown; charset=utf-8' },
  });
};
