#!/usr/bin/env node
/**
 * E2E scaffold test.
 *
 * 1. Wipes apps/playground.
 * 2. Runs the built CLI against it with `--yes --no-install --no-git`.
 * 3. Asserts expected files were generated.
 * 4. Optionally installs deps and runs `astro check` + `astro build`
 *    (skipped by default — opt in via `--full`).
 *
 * Usage:
 *   node ./scripts/scaffold-test.mjs                # scaffold + assert files
 *   node ./scripts/scaffold-test.mjs --full         # also install + check + build
 *   node ./scripts/scaffold-test.mjs --pm=pnpm      # force a specific pm in --full mode
 */

import { rmSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const playground = resolve(repoRoot, 'apps/playground');
// Use the local `astro-ignite` CLI directly — the `create-astro-ignite` shim
// just runs `npx astro-ignite@latest`, which would scaffold from the published
// version instead of the PR's local templates.
const cliEntry = resolve(repoRoot, 'packages/astro-ignite/dist/index.js');

const args = process.argv.slice(2);
const arg = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const has = (name) => args.includes(`--${name}`);

const pm = arg('pm') ?? 'pnpm';
const full = has('full');

console.log(`\n→ scaffold-test starting (pm=${pm}, full=${full})\n`);

// 1. wipe playground
if (existsSync(playground)) {
  console.log(`  ✓ wiping ${playground}`);
  rmSync(playground, { recursive: true, force: true });
}
mkdirSync(playground, { recursive: true });

// 2. assert CLI is built
if (!existsSync(cliEntry)) {
  console.error(`  ✗ CLI not built. Run: pnpm --filter astro-ignite build`);
  process.exit(1);
}

// 3. run scaffold (invoke `bootstrap` since we're using astro-ignite directly)
console.log(`  → scaffolding ${playground}`);
execSync(
  `node ${cliEntry} bootstrap ${playground} --yes --no-install --no-git --pm=${pm}`,
  { stdio: 'inherit', cwd: repoRoot }
);

// 4. assert expected files
const expected = [
  'package.json',
  '.gitignore',
  '.prettierrc.json',
  '.prettierignore',
  'tsconfig.json',
  'astro.config.mjs',
  'eslint.config.js',
  'README.md',
  'docs/FONTS.md',
  'docs/OG.md',
  'docs/ANALYTICS.md',
  'docs/IMAGES.md',
  'docs/LEGAL.md',
  'docs/BENCHMARKS.md',
  'public/favicon.svg',
  'public/manifest.webmanifest',
  'public/og/og-default.png',
  'src/pages/robots.txt.ts',
  'src/config/site.ts',
  'src/i18n/en.json',
  'src/i18n/index.ts',
  'src/styles/global.css',
  'src/components/common/Header.astro',
  'src/components/common/Footer.astro',
  'src/components/legal/CookieBanner.astro',
  'src/components/common/Analytics.astro',
  'src/components/common/ThemeToggle.astro',
  'src/components/common/Hero.astro',
  'src/components/seo/SEO.astro',
  'src/components/seo/JsonLd.astro',
  'src/components/image/Image.astro',
  'src/components/image/PriorityImage.astro',
  'src/layouts/BaseLayout.astro',
  'src/layouts/ArticleLayout.astro',
  'src/layouts/ProjectLayout.astro',
  'src/layouts/LegalLayout.astro',
  'src/lib/email/index.ts',
  'src/lib/email/resend.ts',
  'src/lib/jsonld/index.ts',
  'src/lib/image/blur.ts',
  'src/actions/index.ts',
  'src/content.config.ts',
  'src/content/blog/en/welcome.mdx',
  'src/content/legal/en/privacy.mdx',
  'src/pages/index.astro',
  'src/pages/about.astro',
  'src/pages/contact.astro',
  'src/pages/404.astro',
  'src/pages/blog/index.astro',
  'src/pages/blog/[...slug].astro',
  'src/pages/projects/index.astro',
  'src/pages/projects/[...slug].astro',
  'src/pages/legal/[...slug].astro',
  'src/pages/rss.xml.ts',
];

console.log('\n  → asserting scaffold output');
let missing = 0;
for (const file of expected) {
  if (!existsSync(resolve(playground, file))) {
    console.error(`    ✗ missing: ${file}`);
    missing++;
  }
}
if (missing > 0) {
  console.error(`\n  ✗ ${missing} expected file(s) missing.`);
  process.exit(1);
}
console.log(`    ✓ all ${expected.length} expected files present`);

// 5. assert files that should NOT be present (conditionals + template internals)
const excluded = ['_template.config.ts', 'src/lib/email/smtp.ts'];
for (const file of excluded) {
  if (existsSync(resolve(playground, file))) {
    console.error(`    ✗ unexpected file present: ${file}`);
    process.exit(1);
  }
}
console.log(`    ✓ ${excluded.length} excluded file(s) correctly absent`);

// 6. assert package.json was rewritten with name + email-conditional dep
const pkg = JSON.parse(readFileSync(resolve(playground, 'package.json'), 'utf8'));
if (pkg.name !== 'playground') {
  console.error(`    ✗ package.json name is "${pkg.name}", expected "playground"`);
  process.exit(1);
}
if (!pkg.dependencies?.resend) {
  console.error('    ✗ package.json missing "resend" dependency (email default = resend)');
  process.exit(1);
}
if (pkg.dependencies?.nodemailer) {
  console.error('    ✗ package.json includes "nodemailer" but email = resend');
  process.exit(1);
}
console.log('    ✓ package.json correctly rewritten');

// 7. assert site.ts substitution worked
const siteTs = readFileSync(resolve(playground, 'src/config/site.ts'), 'utf8');
if (!/url:\s*'https:\/\/example\.com'/.test(siteTs)) {
  console.error('    ✗ site.ts URL not substituted');
  process.exit(1);
}
if (!/locales:\s*\['en'\]/.test(siteTs)) {
  console.error('    ✗ site.ts locales not substituted');
  process.exit(1);
}
console.log('    ✓ site.ts substitutions applied');

if (!full) {
  console.log('\n→ scaffold-test ok (use --full to also install + build)\n');
  process.exit(0);
}

// 8. install + check + build
console.log(`\n  → ${pm} install (full mode)`);
execSync(`${pm} install`, { stdio: 'inherit', cwd: playground });

console.log(`\n  → ${pm} run check`);
execSync(`${pm} run check`, { stdio: 'inherit', cwd: playground });

console.log(`\n  → ${pm} run lint`);
execSync(`${pm} run lint`, { stdio: 'inherit', cwd: playground });

console.log(`\n  → ${pm} run format:check`);
execSync(`${pm} run format:check`, { stdio: 'inherit', cwd: playground });

console.log(`\n  → ${pm} run build`);
execSync(`${pm} run build`, { stdio: 'inherit', cwd: playground });

console.log('\n→ scaffold-test ok (full)\n');
