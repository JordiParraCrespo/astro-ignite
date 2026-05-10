/**
 * Interactive prompts powered by @clack/prompts.
 *
 * `--yes` mode populates a context using sane defaults and skips this entirely.
 */

import * as p from '@clack/prompts';
import path from 'node:path';

import { detectPackageManager } from './pm';
import type {
  CliFlags,
  EmailProvider,
  PackageManager,
  ScaffoldContext,
  TemplateKind,
} from './types';
import { TEMPLATE_LABELS } from './types';

const VALID_LOCALE = /^[a-z]{2}(-[A-Z]{2})?$/;

function defaultProjectDir(): string {
  return 'my-astro-ignite-site';
}

function siteNameFromDir(dir: string): string {
  const base = path.basename(dir).replace(/-+/g, ' ');
  return base.replace(/(^|\s)(\w)/g, (_, p1, p2) => p1 + p2.toUpperCase());
}

export async function gatherContext(flags: CliFlags): Promise<ScaffoldContext | null> {
  const projectDirInput = flags.projectDir ?? defaultProjectDir();
  const targetDir = path.resolve(process.cwd(), projectDirInput);
  const detectedPm = detectPackageManager() ?? 'pnpm';

  if (flags.yes) {
    return {
      targetDir,
      template: flags.template ?? 'starter',
      projectName: path.basename(targetDir),
      siteName: siteNameFromDir(targetDir),
      siteUrl: 'https://example.com',
      defaultLocale: 'en',
      additionalLocales: [],
      email: 'resend',
      packageManager: flags.packageManager ?? detectedPm,
      noInstall: flags.noInstall,
      noGit: flags.noGit,
    };
  }

  // Interactive flow. Template kind comes first — every other prompt is
  // potentially shaped by which template the user picks.
  let template: TemplateKind;
  if (flags.template) {
    template = flags.template;
  } else {
    const choice = (await p.select({
      message: 'Template kind?',
      options: [
        { value: 'starter', label: 'Starter', hint: TEMPLATE_LABELS.starter },
        { value: 'docs', label: 'Docs', hint: TEMPLATE_LABELS.docs },
      ],
      initialValue: 'starter',
    })) as TemplateKind | symbol;
    if (p.isCancel(choice)) return null;
    template = choice as TemplateKind;
  }

  const projectName = await p.text({
    message: 'Project directory?',
    placeholder: projectDirInput,
    initialValue: projectDirInput,
    validate(value) {
      if (!value) return 'Required.';
      if (!/^[a-z0-9][a-z0-9-_./]*$/i.test(value)) {
        return 'Use letters, numbers, dashes, underscores, dots, slashes.';
      }
      return undefined;
    },
  });
  if (p.isCancel(projectName)) return null;

  const resolvedDir = path.resolve(process.cwd(), projectName);

  const siteName = await p.text({
    message: 'Site name?',
    placeholder: siteNameFromDir(resolvedDir),
    initialValue: siteNameFromDir(resolvedDir),
    validate(value) {
      if (!value) return 'Required.';
      return undefined;
    },
  });
  if (p.isCancel(siteName)) return null;

  const siteUrl = await p.text({
    message: 'Site URL? (used in canonical, sitemap, OG)',
    placeholder: 'https://example.com',
    initialValue: 'https://example.com',
    validate(value) {
      if (!value) return 'Required.';
      try {
        new URL(value);
      } catch {
        return 'Must be a valid URL including https://';
      }
      return undefined;
    },
  });
  if (p.isCancel(siteUrl)) return null;

  const defaultLocale = await p.text({
    message: 'Default locale? (e.g. en, es, fr)',
    placeholder: 'en',
    initialValue: 'en',
    validate(value) {
      if (!value) return 'Required.';
      if (!VALID_LOCALE.test(value)) return 'Use a 2-letter code (e.g. en) or BCP-47 (en-US).';
      return undefined;
    },
  });
  if (p.isCancel(defaultLocale)) return null;

  const additionalLocalesRaw = await p.text({
    message: 'Additional locales? (comma-separated, leave empty for monolingual)',
    placeholder: '',
    initialValue: '',
    validate(value) {
      if (!value) return undefined;
      const parts = value.split(',').map((s) => s.trim());
      for (const part of parts) {
        if (!VALID_LOCALE.test(part)) {
          return `"${part}" isn't a valid locale code.`;
        }
        if (part === defaultLocale) {
          return `"${part}" is the default — don't list it again.`;
        }
      }
      return undefined;
    },
  });
  if (p.isCancel(additionalLocalesRaw)) return null;
  const additionalLocales =
    typeof additionalLocalesRaw === 'string' && additionalLocalesRaw.length > 0
      ? additionalLocalesRaw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const email = (await p.select({
    message: 'Email provider for the contact form?',
    options: [
      { value: 'resend', label: 'Resend (recommended)', hint: 'modern, generous free tier' },
      { value: 'smtp', label: 'SMTP', hint: 'use your own SMTP host' },
      { value: 'none', label: 'None', hint: 'console-only stub for now' },
    ],
    initialValue: 'resend',
  })) as EmailProvider | symbol;
  if (p.isCancel(email)) return null;

  const packageManager = (await p.select({
    message: 'Package manager?',
    options: [
      { value: 'pnpm', label: 'pnpm' },
      { value: 'npm', label: 'npm' },
      { value: 'yarn', label: 'yarn' },
      { value: 'bun', label: 'bun' },
    ],
    initialValue: flags.packageManager ?? detectedPm,
  })) as PackageManager | symbol;
  if (p.isCancel(packageManager)) return null;

  return {
    targetDir: resolvedDir,
    template,
    projectName: path.basename(resolvedDir),
    siteName: typeof siteName === 'string' ? siteName : siteNameFromDir(resolvedDir),
    siteUrl: typeof siteUrl === 'string' ? siteUrl : 'https://example.com',
    defaultLocale: typeof defaultLocale === 'string' ? defaultLocale : 'en',
    additionalLocales,
    email: email as EmailProvider,
    packageManager: packageManager as PackageManager,
    noInstall: flags.noInstall,
    noGit: flags.noGit,
  };
}
