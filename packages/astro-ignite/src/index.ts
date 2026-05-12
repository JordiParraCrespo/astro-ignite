import * as p from '@clack/prompts';
import kleur from 'kleur';

import { gatherContext } from './prompts';
import { ensureEmptyTarget, scaffoldProject } from './scaffold';
import { devScriptCommand, installCommand, runCommand } from './pm';
import { initGitRepo } from './git';
import type { CliFlags, PackageManager, TemplateKind } from './types';
import { TEMPLATE_KINDS } from './types';

type Subcommand = 'bootstrap' | 'help';

function parseSubcommand(argv: string[]): { command: Subcommand; rest: string[] } {
  const first = argv[0];
  if (!first || first === '--help' || first === '-h') return { command: 'help', rest: [] };
  if (first === 'bootstrap' || first === 'init') return { command: 'bootstrap', rest: argv.slice(1) };
  // Backwards compat with `create-astro-ignite`: bare positional/flag args go to bootstrap.
  return { command: 'bootstrap', rest: argv };
}

function parseBootstrapFlags(argv: string[]): CliFlags {
  const flags: CliFlags = {
    yes: false,
    noInstall: false,
    noGit: false,
  };
  for (const arg of argv) {
    if (arg === '--yes' || arg === '-y') flags.yes = true;
    else if (arg === '--no-install') flags.noInstall = true;
    else if (arg === '--no-git') flags.noGit = true;
    else if (arg.startsWith('--pm=')) {
      const pm = arg.slice('--pm='.length);
      if (['npm', 'pnpm', 'yarn', 'bun'].includes(pm)) {
        flags.packageManager = pm as PackageManager;
      }
    } else if (arg.startsWith('--template=')) {
      const template = arg.slice('--template='.length);
      if (TEMPLATE_KINDS.includes(template as TemplateKind)) {
        flags.template = template as TemplateKind;
      } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown template "${template}". Available: ${TEMPLATE_KINDS.join(', ')}`);
        process.exit(1);
      }
    } else if (arg === '--help' || arg === '-h') {
      printBootstrapHelp();
      process.exit(0);
    } else if (!arg.startsWith('-') && !flags.projectDir) {
      flags.projectDir = arg;
    }
  }
  return flags;
}

function printTopHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`
${kleur.bold('astro-ignite')} — bootstrap and maintain production-grade Astro sites

${kleur.bold('Usage:')}
  npx astro-ignite <command> [options]

${kleur.bold('Commands:')}
  bootstrap [project-dir]   Scaffold a new Astro project from a template
  help                      Show this help

${kleur.bold('Examples:')}
  npx astro-ignite bootstrap my-site
  npx astro-ignite bootstrap --yes --template=docs

${kleur.bold('Shortcut for bootstrap:')}
  npm create astro-ignite@latest my-site   # same as: npx astro-ignite bootstrap my-site

Run ${kleur.cyan('npx astro-ignite bootstrap --help')} for the full flag list.
`);
}

function printBootstrapHelp(): void {
  // eslint-disable-next-line no-console
  console.log(`
${kleur.bold('astro-ignite bootstrap')} — scaffold a new Astro project

${kleur.bold('Usage:')}
  npx astro-ignite bootstrap [project-dir] [options]
  npm create astro-ignite@latest [project-dir] [options]

${kleur.bold('Options:')}
  -y, --yes                     Skip prompts and use defaults
      --no-install              Skip package install
      --no-git                  Skip git init
      --pm=<npm|pnpm|yarn|bun>  Force a specific package manager
      --template=<kind>         Force a template kind (${TEMPLATE_KINDS.join(' | ')})
  -h, --help                    Show this help

${kleur.bold('Defaults (with --yes):')}
  Template:        starter
  Site URL:        https://example.com
  Default locale:  en
  Email provider:  resend
`);
}

export async function runBootstrap(argv: string[]): Promise<void> {
  const flags = parseBootstrapFlags(argv);

  // eslint-disable-next-line no-console
  console.clear();
  p.intro(`${kleur.bgCyan().black(' astro-ignite ')} ${kleur.dim('— bootstrapping')}`);

  const ctx = await gatherContext(flags);
  if (!ctx) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  p.note(
    [
      `${kleur.bold('Template:')}     ${ctx.template}`,
      `${kleur.bold('Directory:')}    ${ctx.targetDir}`,
      `${kleur.bold('Site name:')}    ${ctx.siteName}`,
      `${kleur.bold('Site URL:')}     ${ctx.siteUrl}`,
      `${kleur.bold('Locales:')}      ${[ctx.defaultLocale, ...ctx.additionalLocales].join(', ')}`,
      `${kleur.bold('Email:')}        ${ctx.email}`,
      `${kleur.bold('Package mgr:')}  ${ctx.packageManager}`,
    ].join('\n'),
    'Summary'
  );

  if (!flags.yes) {
    const confirm = await p.confirm({
      message: 'Proceed?',
      initialValue: true,
    });
    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Cancelled.');
      process.exit(0);
    }
  }

  const scaffoldStep = p.spinner();
  scaffoldStep.start('Scaffolding template');
  try {
    await ensureEmptyTarget(ctx.targetDir);
    await scaffoldProject(ctx);
    scaffoldStep.stop('Scaffolded');
  } catch (err) {
    scaffoldStep.stop('Scaffold failed');
    const message = err instanceof Error ? err.message : String(err);
    p.cancel(message);
    process.exit(1);
  }

  if (!ctx.noInstall) {
    const installStep = p.spinner();
    installStep.start(`Installing dependencies with ${ctx.packageManager}`);
    const result = await runCommand(
      ctx.packageManager,
      installCommand(ctx.packageManager),
      ctx.targetDir
    );
    if (!result.ok) {
      installStep.stop('Install failed (continuing — you can run install yourself)');
    } else {
      installStep.stop('Dependencies installed');
    }
  }

  if (!ctx.noGit) {
    const gitStep = p.spinner();
    gitStep.start('Initializing git');
    const ok = initGitRepo(ctx.targetDir);
    gitStep.stop(ok ? 'Git initialized' : 'Git skipped (not installed?)');
  }

  const dirRel = ctx.targetDir.startsWith(process.cwd())
    ? '.' + ctx.targetDir.slice(process.cwd().length)
    : ctx.targetDir;
  p.outro(
    [
      kleur.green('Done.'),
      '',
      `Next steps:`,
      `  ${kleur.cyan(`cd ${dirRel}`)}`,
      ctx.noInstall ? `  ${kleur.cyan(`${ctx.packageManager} install`)}` : null,
      `  ${kleur.cyan(devScriptCommand(ctx.packageManager))}`,
      '',
      kleur.dim('Read README.md for what to edit first.'),
    ]
      .filter(Boolean)
      .join('\n')
  );
}

async function main(): Promise<void> {
  const { command, rest } = parseSubcommand(process.argv.slice(2));
  switch (command) {
    case 'bootstrap':
      await runBootstrap(rest);
      return;
    case 'help':
      printTopHelp();
      return;
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
