/**
 * llms.txt — a Markdown index of the documentation for LLMs and AI agents,
 * served at /llms.txt. Follows the https://llmstxt.org convention: an H1 site
 * name, a blockquote summary, then H2 sections of `- [title](url)` links.
 * Titles + descriptions come from each doc's frontmatter, so the index never
 * drifts from what renders.
 *
 * One file covers every locale in `siteConfig.locales`; section headings gain a
 * language suffix only when more than one locale is active. Companion
 * machine-readable feeds live at /sitemap-index.xml and /rss.xml.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { siteConfig } from '@/config/site';
import { useTranslations } from '@/i18n';

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(siteConfig.url)).origin;
  const { defaultLocale, locales } = siteConfig;
  const multi = locales.length > 1;
  const homeSlug = siteConfig.homePath.replace(/^\//, '');

  const url = (lang: string, path: string) => {
    const prefix = lang === defaultLocale ? '' : `/${lang}`;
    return origin + (path === '/' ? prefix || '/' : `${prefix}${path}`);
  };
  const suffix = (lang: string) => (multi ? ` (${siteConfig.hreflang[lang] ?? lang})` : '');
  const link = (title: string, href: string, desc?: string) =>
    `- [${title}](${href})${desc ? `: ${desc}` : ''}`;

  const [docs, legal] = await Promise.all([
    getCollection('docs', (e: CollectionEntry<'docs'>) => !e.data.draft && !e.data.noindex),
    getCollection('legal'),
  ]);

  const lines: string[] = [
    `# ${siteConfig.name[defaultLocale]}`,
    '',
    `> ${siteConfig.description[defaultLocale] ?? ''}`,
    '',
    'Structured for LLMs and AI agents. Full machine-readable indexes: ' +
      `[sitemap](${origin}/sitemap-index.xml), [RSS](${origin}/rss.xml).`,
    '',
  ];

  for (const lang of locales) {
    const t = useTranslations(lang);
    const homeId = `${lang}/${homeSlug}`;

    const pages = docs
      .filter((e) => e.id.startsWith(`${lang}/`))
      // Home doc first, then alphabetical by title for a stable index.
      .sort((a, b) => {
        if (a.id === homeId) return -1;
        if (b.id === homeId) return 1;
        return a.data.title.localeCompare(b.data.title);
      });

    if (pages.length) {
      lines.push(`## Documentation${suffix(lang)}`, '');
      for (const entry of pages) {
        const slug = entry.id.split('/').slice(1).join('/');
        const href = entry.id === homeId ? url(lang, '/') : url(lang, `/${slug}`);
        lines.push(link(entry.data.title, href, entry.data.description));
      }
      lines.push('');
    }

    const docsLegal = legal
      .filter((e) => e.id.startsWith(`${lang}/`))
      .sort((a, b) => a.id.localeCompare(b.id));
    if (docsLegal.length) {
      lines.push(`## ${t('footer.legal')}${suffix(lang)}`, '');
      for (const entry of docsLegal) {
        const slug = entry.id.split('/').slice(1).join('/');
        lines.push(link(entry.data.title, url(lang, `/legal/${slug}`)));
      }
      lines.push('');
    }
  }

  const body =
    lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trimEnd() + '\n';
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
