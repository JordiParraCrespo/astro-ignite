/**
 * Template config — read by the create-astro-ignite CLI at scaffold time.
 *
 * NOT copied into the user's generated project. Lives only in the template
 * source so the CLI knows which files are conditional on which prompt answers,
 * which dependencies to add per choice, and which values to substitute.
 *
 * The template is also a real working Astro project — every value below has
 * a sensible dev default so `pnpm dev` from `packages/template/` produces a
 * working site without scaffold-time substitution.
 */

export interface ScaffoldContext {
  projectName: string;
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  additionalLocales: string[];
  email: 'resend' | 'smtp' | 'none';
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun';
}

/**
 * Files included only for certain prompt answers.
 * Predicate returns true → file is copied; false → skipped.
 */
export const conditional: Record<string, (ctx: ScaffoldContext) => boolean> = {
  'src/lib/email/resend.ts': (ctx) => ctx.email === 'resend',
  'src/lib/email/smtp.ts': (ctx) => ctx.email === 'smtp',
  'src/lib/email/index.ts': (ctx) => ctx.email !== 'none',
};

/**
 * Mustache-style placeholders ({{var}}) replaced via regex on text files.
 * Used in non-source files where a sentinel approach is acceptable
 * (.env.example, robots.txt, manifest.webmanifest, generated README, etc.).
 *
 * The keys here are the placeholder tokens that appear inside `{{ }}` in
 * those files. `ctx → string` produces the replacement value.
 */
export const placeholders: Record<string, (ctx: ScaffoldContext) => string> = {
  site_name: (ctx) => ctx.siteName,
  site_url: (ctx) => ctx.siteUrl,
  default_locale: (ctx) => ctx.defaultLocale,
  additional_locales: (ctx) => ctx.additionalLocales.join(', '),
  project_name: (ctx) => ctx.projectName,
};

/**
 * `src/config/site.ts` is a real TS file with valid dev defaults — the CLI
 * does targeted line-based replacement instead of using {{...}} placeholders.
 *
 * Each rule maps a field name to a producer function. `scaffold.ts`
 * regex-matches `<field>: <value>` style lines and substitutes.
 *
 * Keep these surgical — broad string replace would corrupt sample content
 * elsewhere in the template (blog posts, README, etc.).
 */
export const siteConfigReplacements: Record<string, (ctx: ScaffoldContext) => string | string[]> = {
  url: (ctx) => ctx.siteUrl,
  defaultLocale: (ctx) => ctx.defaultLocale,
  locales: (ctx) => [ctx.defaultLocale, ...ctx.additionalLocales],
};

/**
 * Dependency overrides per prompt answer. Merged into the template's
 * package.json at scaffold time.
 */
export function dependencies(ctx: ScaffoldContext): Record<string, string> {
  return {
    ...(ctx.email === 'resend' ? { resend: '^4.0.0' } : {}),
    ...(ctx.email === 'smtp' ? { nodemailer: '^7.0.0' } : {}),
  };
}

export function devDependencies(ctx: ScaffoldContext): Record<string, string> {
  return {
    ...(ctx.email === 'smtp' ? { '@types/nodemailer': '^7.0.0' } : {}),
  };
}

/**
 * File extensions that get placeholder substitution. Anything not in this list
 * is copied verbatim to avoid corrupting binary content.
 */
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

/**
 * Files whose names start with `_` are renamed at copy time (npm strips
 * leading-dot files like .gitignore from packages, so we ship them as
 * `_gitignore`, `_npmrc` etc).
 */
export const renames: Record<string, string> = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
};

/**
 * Files that should NEVER be copied into the user's project — these are
 * template-only metadata.
 */
export const excludeFromScaffold = ['_template.config.ts'] as const;
