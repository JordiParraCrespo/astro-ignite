/**
 * Shared types for the CLI.
 *
 * The shape mirrors each template's `_template.config.ts` — the CLI
 * populates a ScaffoldContext and passes it to the scaffolder.
 */

export type EmailProvider = 'resend' | 'smtp' | 'none';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

/**
 * Template kinds. Add a new `packages/templates/<name>/` directory and
 * extend this union to ship a new template.
 */
export type TemplateKind = 'starter' | 'docs';

export const TEMPLATE_KINDS: TemplateKind[] = ['starter', 'docs'];

export const TEMPLATE_LABELS: Record<TemplateKind, string> = {
  starter: 'Starter — marketing site with blog, projects, contact, legal',
  docs: 'Docs — 3-column documentation site (sidebar, TOC, full-text search)',
};

export interface ScaffoldContext {
  /** Absolute target directory (already created by the CLI). */
  targetDir: string;
  /** Which template to scaffold from. */
  template: TemplateKind;
  /** package.json `name` field — defaults to the directory's basename. */
  projectName: string;
  /** Site display name (locale-keyed in siteConfig but a single string here). */
  siteName: string;
  /** Canonical site URL — must include scheme. */
  siteUrl: string;
  /** Default locale code (e.g. 'en'). */
  defaultLocale: string;
  /** Additional locales (excluding the default). */
  additionalLocales: string[];
  /** Email transport choice. Used by templates with a contact form (e.g. starter). */
  email: EmailProvider;
  /** Selected package manager (used for installs + lockfile). */
  packageManager: PackageManager;
  /** Skip `<pm> install` step. */
  noInstall: boolean;
  /** Skip git init step. */
  noGit: boolean;
}

export interface CliFlags {
  /** Positional arg: target directory name. */
  projectDir?: string;
  /** Skip prompts; use defaults. */
  yes: boolean;
  /** Skip install. */
  noInstall: boolean;
  /** Skip git. */
  noGit: boolean;
  /** Override package manager from flag. */
  packageManager?: PackageManager;
  /** Override template kind from flag. */
  template?: TemplateKind;
}
