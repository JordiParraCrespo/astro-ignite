/**
 * Scaffolder — copies the chosen template into the target directory.
 *
 * Templates live at `packages/templates/<kind>/` in the monorepo. tsup
 * bundles the CLI but does NOT bundle the template assets — we resolve the
 * template path relative to the CLI's `dist/index.js` at runtime. In dev
 * (running from source), templates resolve to `../../templates/<kind>/`.
 * In a published npm package, they ship under `<pkg>/templates/<kind>/`.
 *
 * Steps:
 *   1. Walk template tree, skipping ignored files and conditional ones the
 *      user didn't pick.
 *   2. Copy each file. Apply `{{var}}` substitution on text files.
 *   3. Rename `_gitignore` → `.gitignore` etc.
 *   4. Rewrite `src/config/site.ts` (URL, defaultLocale, locales).
 *   5. Rewrite `package.json` (name, conditional deps).
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { ScaffoldContext, TemplateKind } from './types';

const SUBSTITUTABLE_EXTENSIONS = new Set([
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
]);

/** Files/dirs at template root that NEVER get copied into user projects. */
const TOP_LEVEL_EXCLUDE = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.output',
  '_template.config.ts',
]);

/** Files renamed at copy time (npm strips dotfiles). */
const RENAMES: Record<string, string> = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc',
};

interface ConditionalRule {
  predicate: (ctx: ScaffoldContext) => boolean;
}

const CONDITIONAL_FILES: Record<string, ConditionalRule> = {
  'src/lib/email/resend.ts': { predicate: (ctx) => ctx.email === 'resend' },
  'src/lib/email/smtp.ts': { predicate: (ctx) => ctx.email === 'smtp' },
  'src/lib/email/index.ts': { predicate: (ctx) => ctx.email !== 'none' },
};

/** Resolve where a specific template's source tree lives relative to the running CLI. */
export async function resolveTemplateRoot(template: TemplateKind): Promise<string> {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    // Published-package layout: <pkg>/dist/index.js + <pkg>/templates/<kind>/
    path.resolve(here, `../templates/${template}`),
    // Monorepo dev: CLI dist/ → packages/create-astro-ignite/dist/, templates at packages/templates/<kind>/
    path.resolve(here, `../../../templates/${template}`),
    path.resolve(here, `../../templates/${template}`),
    path.resolve(here, `../../../packages/templates/${template}`),
  ];
  for (const c of candidates) {
    try {
      const stat = await fs.stat(path.join(c, 'package.json'));
      if (stat.isFile()) return c;
    } catch {
      // try next candidate
    }
  }
  throw new Error(
    `Could not locate the "${template}" template directory. Searched:\n${candidates
      .map((c) => `  - ${c}`)
      .join('\n')}`
  );
}

/** Replace `{{var}}` placeholders in a string. */
function applySubstitutions(content: string, ctx: ScaffoldContext): string {
  const replacements: Record<string, string> = {
    '{{site_name}}': ctx.siteName,
    '{{site_url}}': ctx.siteUrl,
    '{{default_locale}}': ctx.defaultLocale,
    '{{additional_locales}}': ctx.additionalLocales.join(', '),
    '{{project_name}}': ctx.projectName,
  };
  let result = content;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.split(key).join(value);
  }
  return result;
}

async function walkAndCopy(
  srcRoot: string,
  destRoot: string,
  ctx: ScaffoldContext,
  rel: string = ''
): Promise<void> {
  const srcDir = path.join(srcRoot, rel);
  const entries = await fs.readdir(srcDir, { withFileTypes: true });
  await fs.mkdir(path.join(destRoot, rel), { recursive: true });

  for (const entry of entries) {
    if (rel === '' && TOP_LEVEL_EXCLUDE.has(entry.name)) continue;

    const relPath = path.posix.join(rel, entry.name);

    if (entry.isDirectory()) {
      await walkAndCopy(srcRoot, destRoot, ctx, relPath);
      continue;
    }

    // Conditional skip
    const conditional = CONDITIONAL_FILES[relPath];
    if (conditional && !conditional.predicate(ctx)) continue;

    const srcPath = path.join(srcRoot, relPath);
    const destName = RENAMES[entry.name] ?? entry.name;
    const destPath = path.join(destRoot, rel, destName);

    if (entry.isSymbolicLink()) {
      // Preserve symlinks verbatim (e.g. CLAUDE.md → AGENTS.md). Don't read
      // through to the target — that would scaffold a duplicate file instead.
      const link = await fs.readlink(srcPath);
      await fs.symlink(link, destPath);
      continue;
    }

    const ext = path.extname(entry.name);
    if (SUBSTITUTABLE_EXTENSIONS.has(ext)) {
      const raw = await fs.readFile(srcPath, 'utf8');
      const transformed = applySubstitutions(raw, ctx);
      await fs.writeFile(destPath, transformed, 'utf8');
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

/**
 * Surgical line-based replacement on `src/config/site.ts` so it ships with
 * real user values instead of the dev defaults.
 */
async function rewriteSiteConfig(targetDir: string, ctx: ScaffoldContext): Promise<void> {
  const filePath = path.join(targetDir, 'src/config/site.ts');
  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch {
    return;
  }

  const allLocales = [ctx.defaultLocale, ...ctx.additionalLocales];

  // Each pattern rewrites a single field's literal value. Anchored to the
  // structure of the dev defaults — see packages/template/src/config/site.ts.
  content = content
    .replace(/url:\s*'http:\/\/localhost:4321'/, `url: ${JSON.stringify(ctx.siteUrl)}`)
    .replace(/defaultLocale:\s*'en'/, `defaultLocale: ${JSON.stringify(ctx.defaultLocale)}`)
    .replace(
      /locales:\s*\['en'\]/,
      `locales: [${allLocales.map((l) => JSON.stringify(l)).join(', ')}]`
    );

  // Rewrite the locale-keyed name + organization to use the chosen siteName,
  // for the default locale.
  const namePattern = new RegExp(`(${ctx.defaultLocale}:\\s*)'astro-ignite'`, 'g');
  content = content.replace(namePattern, `$1${JSON.stringify(ctx.siteName)}`);

  // For non-default locales, replace 'astro-ignite' literals as well.
  // (The template ships en + es; both have `'astro-ignite'` baked in.)
  content = content.replace(/'astro-ignite'/g, JSON.stringify(ctx.siteName));

  await fs.writeFile(filePath, content, 'utf8');
}

/**
 * Rewrite package.json: set `name`, drop the `private` flag, add conditional
 * deps based on email choice (only if the template uses email).
 */
async function rewritePackageJson(targetDir: string, ctx: ScaffoldContext): Promise<void> {
  const filePath = path.join(targetDir, 'package.json');
  let raw: string;
  try {
    raw = await fs.readFile(filePath, 'utf8');
  } catch {
    return;
  }
  const pkg = JSON.parse(raw);

  pkg.name = ctx.projectName;
  pkg.version = '0.1.0';
  pkg.private = true;
  delete pkg.description;

  pkg.dependencies = pkg.dependencies ?? {};
  pkg.devDependencies = pkg.devDependencies ?? {};

  // Only inject email transport deps if the template actually has the email
  // module (the CLI ships `index.ts` only when ctx.email !== 'none' AND the
  // template ships email lib files in the first place — docs doesn't).
  const hasEmailModule = await fileExists(path.join(targetDir, 'src/lib/email/index.ts'));
  if (hasEmailModule) {
    if (ctx.email === 'resend') {
      pkg.dependencies['resend'] = '^4.0.0';
    } else if (ctx.email === 'smtp') {
      pkg.dependencies['nodemailer'] = '^7.0.0';
      pkg.devDependencies['@types/nodemailer'] = '^7.0.0';
    }
  }

  await fs.writeFile(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const stat = await fs.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

/** Make sure the target directory exists and is empty (or doesn't exist). */
export async function ensureEmptyTarget(targetDir: string): Promise<void> {
  try {
    const entries = await fs.readdir(targetDir);
    if (entries.length > 0) {
      throw new Error(`Target directory "${targetDir}" already exists and is not empty.`);
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      await fs.mkdir(targetDir, { recursive: true });
      return;
    }
    throw err;
  }
}

export async function scaffoldProject(ctx: ScaffoldContext): Promise<void> {
  const templateRoot = await resolveTemplateRoot(ctx.template);
  await walkAndCopy(templateRoot, ctx.targetDir, ctx);
  await rewriteSiteConfig(ctx.targetDir, ctx);
  await rewritePackageJson(ctx.targetDir, ctx);
}
