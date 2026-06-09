/**
 * llms.txt — a Markdown index of the site's primary content for LLMs and AI
 * agents, served at /llms.txt. Follows the https://llmstxt.org convention:
 * an H1 site name, a blockquote summary, then H2 sections of `- [title](url)`
 * links. Content titles + descriptions come straight from the same SEO copy
 * the pages render, so the index never drifts from what humans see.
 *
 * One file covers every locale in `siteConfig.locales`; section headings gain a
 * language suffix only when more than one locale is active. Companion
 * machine-readable feeds live at /sitemap-index.xml and /rss.xml.
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { siteConfig } from '@/config/site';
import { useTranslations, type TranslationKey } from '@/i18n';

interface StaticPage {
  path: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}

const STATIC_PAGES: StaticPage[] = [
  { path: '/', titleKey: 'seo.home.title', descKey: 'seo.home.description' },
  { path: '/about', titleKey: 'seo.about.title', descKey: 'seo.about.description' },
  { path: '/contact', titleKey: 'seo.contact.title', descKey: 'seo.contact.description' },
];

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(siteConfig.url)).origin;
  const { defaultLocale, locales } = siteConfig;
  const multi = locales.length > 1;

  const url = (lang: string, path: string) => {
    const prefix = lang === defaultLocale ? '' : `/${lang}`;
    return origin + (path === '/' ? prefix || '/' : `${prefix}${path}`);
  };
  const suffix = (lang: string) => (multi ? ` (${siteConfig.hreflang[lang] ?? lang})` : '');
  const link = (title: string, href: string, desc?: string) =>
    `- [${title}](${href})${desc ? `: ${desc}` : ''}`;

  const [blog, projects, legal] = await Promise.all([
    getCollection('blog', (e: CollectionEntry<'blog'>) => !e.data.draft && !e.data.noindex),
    getCollection('projects', (e: CollectionEntry<'projects'>) => !e.data.draft),
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

    lines.push(`## Pages${suffix(lang)}`, '');
    for (const p of STATIC_PAGES) {
      lines.push(link(t(p.titleKey), url(lang, p.path), t(p.descKey)));
    }
    lines.push('');

    const posts = blog
      .filter((e) => e.id.startsWith(`${lang}/`))
      .sort((a, b) => +b.data.datePublished - +a.data.datePublished);
    if (posts.length) {
      lines.push(`## ${t('seo.blog.title')}${suffix(lang)}`, '');
      lines.push(link(t('seo.blog.title'), url(lang, '/blog'), t('seo.blog.description')));
      for (const post of posts) {
        const slug = post.id.split('/').slice(1).join('/');
        lines.push(link(post.data.title, url(lang, `/blog/${slug}`), post.data.description));
      }
      lines.push('');
    }

    const work = projects
      .filter((e) => e.id.startsWith(`${lang}/`))
      .sort((a, b) => +b.data.datePublished - +a.data.datePublished);
    if (work.length) {
      lines.push(`## ${t('seo.projects.title')}${suffix(lang)}`, '');
      lines.push(
        link(t('seo.projects.title'), url(lang, '/projects'), t('seo.projects.description'))
      );
      for (const entry of work) {
        // projects id is `<locale>/<slug>/index` → take the slug segment
        const slug = entry.id.split('/')[1]!;
        lines.push(link(entry.data.title, url(lang, `/projects/${slug}`), entry.data.summary));
      }
      lines.push('');
    }

    const docs = legal
      .filter((e) => e.id.startsWith(`${lang}/`))
      .sort((a, b) => a.id.localeCompare(b.id));
    if (docs.length) {
      lines.push(`## ${t('footer.legal')}${suffix(lang)}`, '');
      for (const entry of docs) {
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
