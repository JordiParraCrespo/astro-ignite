/**
 * Template config — read by the create-astro-ignite CLI at scaffold time.
 *
 * The docs template has NO contact form (no email transport options) and no
 * blog/projects collections. The template config below is intentionally
 * narrower than the starter's.
 */

import type { ScaffoldContext } from '../../create-astro-ignite/src/types';

/** Files included only for certain prompt answers. None today — docs template
 *  doesn't conditionalize on email/etc. */
export const conditional: Record<string, (ctx: ScaffoldContext) => boolean> = {};

/** Mustache-style placeholders ({{var}}) replaced via regex on text files. */
export const placeholders: Record<string, (ctx: ScaffoldContext) => string> = {
  site_name: (ctx) => ctx.siteName,
  site_url: (ctx) => ctx.siteUrl,
  default_locale: (ctx) => ctx.defaultLocale,
  additional_locales: (ctx) => ctx.additionalLocales.join(', '),
  project_name: (ctx) => ctx.projectName,
};

/** site.ts replacement rules — same shape as the starter template. */
export const siteConfigReplacements: Record<string, (ctx: ScaffoldContext) => string | string[]> = {
  url: (ctx) => ctx.siteUrl,
  defaultLocale: (ctx) => ctx.defaultLocale,
  locales: (ctx) => [ctx.defaultLocale, ...ctx.additionalLocales],
};

export function dependencies(_ctx: ScaffoldContext): Record<string, string> {
  return {};
}

export function devDependencies(_ctx: ScaffoldContext): Record<string, string> {
  return {};
}

export const substitutableExtensions = [
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.json',
  '.md',
  '.mdx',
  '.html',
  '.txt',
  '.webmanifest',
  '.xml',
  '.svg',
  '.css',
] as const;

export const renames: Record<string, string> = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
};

export const excludeFromScaffold = ['_template.config.ts'] as const;
