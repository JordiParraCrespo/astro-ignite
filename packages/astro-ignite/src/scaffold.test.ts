import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ensureEmptyTarget, scaffoldProject } from './scaffold';
import type { ScaffoldContext } from './types';

function mkTmp(): string {
  return path.join(
    tmpdir(),
    `astro-ignite-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function makeCtx(overrides: Partial<ScaffoldContext> = {}): ScaffoldContext {
  return {
    targetDir: mkTmp(),
    template: 'starter',
    projectName: 'my-test-site',
    siteName: 'My Test Site',
    siteUrl: 'https://test.example',
    defaultLocale: 'en',
    additionalLocales: [],
    email: 'resend',
    packageManager: 'pnpm',
    noInstall: true,
    noGit: true,
    ...overrides,
  };
}

describe('ensureEmptyTarget', () => {
  it('creates the target dir if missing', async () => {
    const ctx = makeCtx();
    await ensureEmptyTarget(ctx.targetDir);
    const stat = await fs.stat(ctx.targetDir);
    expect(stat.isDirectory()).toBe(true);
    await fs.rm(ctx.targetDir, { recursive: true, force: true });
  });

  it('throws when the target dir exists and is not empty', async () => {
    const ctx = makeCtx();
    await fs.mkdir(ctx.targetDir, { recursive: true });
    await fs.writeFile(path.join(ctx.targetDir, 'oops.txt'), 'not empty');
    await expect(ensureEmptyTarget(ctx.targetDir)).rejects.toThrow(
      /already exists and is not empty/
    );
    await fs.rm(ctx.targetDir, { recursive: true, force: true });
  });
});

describe('scaffoldProject', () => {
  let target: string;

  beforeEach(() => {
    target = mkTmp();
  });

  afterEach(async () => {
    await fs.rm(target, { recursive: true, force: true });
  });

  it('emits the expected file tree (resend)', async () => {
    const ctx = makeCtx({ targetDir: target, email: 'resend' });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    // Required files present
    for (const rel of [
      'package.json',
      'astro.config.mjs',
      'tsconfig.json',
      '.gitignore',
      'src/config/site.ts',
      'src/lib/email/index.ts',
      'src/lib/email/resend.ts',
      'src/components/common/Header.astro',
      'src/pages/index.astro',
    ]) {
      const stat = await fs.stat(path.join(target, rel));
      expect(stat.isFile(), `expected ${rel} to exist`).toBe(true);
    }

    // SMTP-only files absent
    await expect(fs.stat(path.join(target, 'src/lib/email/smtp.ts'))).rejects.toThrow();

    // Template internals not copied
    await expect(fs.stat(path.join(target, '_template.config.ts'))).rejects.toThrow();
  });

  it('includes smtp.ts and excludes resend.ts when email=smtp', async () => {
    const ctx = makeCtx({ targetDir: target, email: 'smtp' });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    const smtp = await fs.stat(path.join(target, 'src/lib/email/smtp.ts'));
    expect(smtp.isFile()).toBe(true);
    await expect(fs.stat(path.join(target, 'src/lib/email/resend.ts'))).rejects.toThrow();
  });

  it('excludes both transports + index when email=none', async () => {
    const ctx = makeCtx({ targetDir: target, email: 'none' });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    await expect(fs.stat(path.join(target, 'src/lib/email/index.ts'))).rejects.toThrow();
    await expect(fs.stat(path.join(target, 'src/lib/email/resend.ts'))).rejects.toThrow();
    await expect(fs.stat(path.join(target, 'src/lib/email/smtp.ts'))).rejects.toThrow();
  });

  it('rewrites site.ts URL, locales, and site name', async () => {
    const ctx = makeCtx({
      targetDir: target,
      siteName: 'Acme Co.',
      siteUrl: 'https://acme.example',
      defaultLocale: 'es',
      additionalLocales: ['en', 'fr'],
    });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    const siteTs = await fs.readFile(path.join(target, 'src/config/site.ts'), 'utf8');
    expect(siteTs).toMatch(/url:\s*"https:\/\/acme\.example"/);
    expect(siteTs).toMatch(/defaultLocale:\s*"es"/);
    expect(siteTs).toMatch(/locales:\s*\["es",\s*"en",\s*"fr"\]/);
    // site name replacement (was 'astro-ignite' literal in template)
    expect(siteTs).toContain('"Acme Co."');
    expect(siteTs).not.toContain("'astro-ignite'");
  });

  it('rewrites package.json name + version + email-conditional deps', async () => {
    const ctx = makeCtx({ targetDir: target, projectName: 'my-cool-blog', email: 'smtp' });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    const raw = await fs.readFile(path.join(target, 'package.json'), 'utf8');
    const pkg = JSON.parse(raw);
    expect(pkg.name).toBe('my-cool-blog');
    expect(pkg.version).toBe('0.1.0');
    expect(pkg.private).toBe(true);
    expect(pkg.dependencies.nodemailer).toBeDefined();
    expect(pkg.dependencies.resend).toBeUndefined();
    expect(pkg.devDependencies['@types/nodemailer']).toBeDefined();
  });

  it('renames _gitignore to .gitignore', async () => {
    const ctx = makeCtx({ targetDir: target });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    const gi = await fs.stat(path.join(target, '.gitignore'));
    expect(gi.isFile()).toBe(true);
    await expect(fs.stat(path.join(target, '_gitignore'))).rejects.toThrow();
  });

  it('preserves CLAUDE.md → AGENTS.md as a symlink (not a duplicate file)', async () => {
    const ctx = makeCtx({ targetDir: target });
    await ensureEmptyTarget(target);
    await scaffoldProject(ctx);

    const claudePath = path.join(target, 'CLAUDE.md');
    const lstat = await fs.lstat(claudePath);
    expect(lstat.isSymbolicLink(), 'CLAUDE.md should be a symlink').toBe(true);
    const target_ = await fs.readlink(claudePath);
    expect(target_).toBe('AGENTS.md');

    const agents = await fs.stat(path.join(target, 'AGENTS.md'));
    expect(agents.isFile()).toBe(true);
  });
});
