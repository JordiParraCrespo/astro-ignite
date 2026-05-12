/**
 * design-fetch — pull a Claude Design (claude.ai/design) handoff bundle
 * down to disk and unpack it.
 *
 * Usage:
 *   design-fetch <design-url> [--out <dir>] [--force]
 *   design-fetch --file <path>   [--out <dir>] [--force]
 *
 * Auth: the Claude Design API is gated. Set ANTHROPIC_API_KEY or pass
 * --api-key to authenticate the request. If you already have the bundle
 * downloaded (e.g. exported from claude.ai/design in-browser), point
 * --file at the .tar.gz instead and we'll just extract it.
 *
 * The Claude Design API returns a gzipped tar archive whose root is the
 * project name (e.g. `astro-ignite/`). We stream it to a temp file, then
 * shell out to `tar -xzf` because Node has no built-in tar untar. `tar`
 * ships with macOS and every Linux distro we target.
 */

import { argv, env, exit, stderr, stdout } from 'node:process';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile, readdir, rm, stat, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

import kleur from 'kleur';

type Args = {
  url?: string;
  file?: string;
  out: string;
  force: boolean;
  apiKey?: string;
};

const HELP = `${kleur.bold('design-fetch')} — extract a Claude Design handoff bundle

${kleur.bold('Usage')}
  design-fetch <url> [--out <dir>] [--force] [--api-key <key>]
  design-fetch --file <path>   [--out <dir>] [--force]

${kleur.bold('Arguments')}
  url               Design URL from claude.ai/design or api.anthropic.com/v1/design
  --file <path>     Use a pre-downloaded .tar.gz bundle instead of fetching
  --out <dir>       Output directory (default: ./design)
  --force           Overwrite existing output directory
  --api-key <key>   Anthropic API key (or set ANTHROPIC_API_KEY)
  -h, --help        Show this help

${kleur.bold('Examples')}
  ANTHROPIC_API_KEY=sk-... design-fetch https://claude.ai/design/h/abc123
  design-fetch --file ./bundle.tar.gz --out design/components --force
`;

function parseArgs(raw: string[]): Args | null {
  let url: string | undefined;
  let file: string | undefined;
  let out = './design';
  let force = false;
  let apiKey: string | undefined;

  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a === '-h' || a === '--help') return null;
    if (a === '--force') {
      force = true;
      continue;
    }
    if (a === '--out') {
      const next = raw[i + 1];
      if (!next) throw new Error('--out requires a directory argument');
      out = next;
      i++;
      continue;
    }
    if (a === '--file') {
      const next = raw[i + 1];
      if (!next) throw new Error('--file requires a path argument');
      file = next;
      i++;
      continue;
    }
    if (a === '--api-key') {
      const next = raw[i + 1];
      if (!next) throw new Error('--api-key requires a value');
      apiKey = next;
      i++;
      continue;
    }
    if (a && !a.startsWith('-') && !url) {
      url = a;
      continue;
    }
    if (a) throw new Error(`unknown argument: ${a}`);
  }

  if (!url && !file) throw new Error('a design URL or --file <path> is required');
  if (url && file) throw new Error('pass either a URL or --file, not both');
  return { url, file, out, force, apiKey };
}

function normaliseUrl(input: string): string {
  // claude.ai/design/h/<id> → api.anthropic.com/v1/design/h/<id>
  // The browser URL and API URL share the same `/h/<id>` path; the API host
  // serves the bundle directly. Anything with `?open_file=...` is fine —
  // the API ignores query params.
  const u = new URL(input);
  if (u.hostname.endsWith('claude.ai') && u.pathname.startsWith('/design/')) {
    return `https://api.anthropic.com/v1${u.pathname}${u.search}`;
  }
  return u.toString();
}

async function ensureEmpty(dir: string, force: boolean): Promise<void> {
  try {
    const s = await stat(dir);
    if (!s.isDirectory()) {
      throw new Error(`${dir} exists but is not a directory`);
    }
    const entries = await readdir(dir);
    if (entries.length === 0) return;
    if (!force) {
      throw new Error(`${dir} is not empty. Pass --force to overwrite, or pick a different --out.`);
    }
    await rm(dir, { recursive: true, force: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
  await mkdir(dir, { recursive: true });
}

async function downloadBundle(url: string, apiKey: string | undefined): Promise<string> {
  const headers: Record<string, string> = {
    accept: 'application/gzip, application/octet-stream, */*',
  };
  if (apiKey) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const hint =
      res.status === 401 || res.status === 403 || res.status === 404
        ? '\n  hint: the Design API requires authentication. Set ANTHROPIC_API_KEY or pass --api-key.\n  alternatively, download the bundle in-browser and re-run with --file <path>.'
        : '';
    throw new Error(`fetch failed: ${res.status} ${res.statusText}${hint}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2 || buf[0] !== 0x1f || buf[1] !== 0x8b) {
    throw new Error(
      'response is not a gzip archive — confirm the URL is a Claude Design handoff link'
    );
  }
  const tmp = join(tmpdir(), `design-fetch-${randomUUID()}.tar.gz`);
  await writeFile(tmp, buf);
  return tmp;
}

async function stageLocalFile(path: string): Promise<string> {
  const abs = resolve(path);
  const s = await stat(abs);
  if (!s.isFile()) throw new Error(`${path} is not a file`);
  const tmp = join(tmpdir(), `design-fetch-${randomUUID()}.tar.gz`);
  await copyFile(abs, tmp);
  return tmp;
}

function extractTar(archive: string, into: string): void {
  const res = spawnSync('tar', ['-xzf', archive, '-C', into], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  if (res.status !== 0) {
    throw new Error(`tar exited with code ${res.status ?? 'null'}`);
  }
}

async function listExtracted(dir: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(d: string, rel: string): Promise<void> {
    const entries = await readdir(d, { withFileTypes: true });
    for (const entry of entries) {
      const next = join(d, entry.name);
      const relNext = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(next, relNext);
      } else {
        out.push(relNext);
      }
    }
  }
  await walk(dir, '');
  return out.sort();
}

async function main(): Promise<void> {
  let parsed: Args | null;
  try {
    parsed = parseArgs(argv.slice(2));
  } catch (err) {
    stderr.write(kleur.red(`error: ${(err as Error).message}\n\n`));
    stderr.write(HELP);
    exit(2);
  }
  if (!parsed) {
    stdout.write(HELP);
    return;
  }

  const { url, file, out, force, apiKey } = parsed;
  const outAbs = resolve(out);

  let archive: string;
  if (file) {
    stdout.write(`${kleur.dim('→')} using local bundle ${kleur.cyan(file)}\n`);
    archive = await stageLocalFile(file);
  } else {
    const normalised = normaliseUrl(url!);
    stdout.write(`${kleur.dim('→')} fetching ${kleur.cyan(normalised)}\n`);
    archive = await downloadBundle(normalised, apiKey ?? env.ANTHROPIC_API_KEY);
  }

  stdout.write(`${kleur.dim('→')} extracting to ${kleur.cyan(outAbs)}\n`);
  await ensureEmpty(outAbs, force);
  extractTar(archive, outAbs);
  await rm(archive, { force: true });

  const files = await listExtracted(outAbs);
  stdout.write(`${kleur.green('✓')} extracted ${kleur.bold(String(files.length))} files\n`);
  for (const f of files.slice(0, 20)) stdout.write(`  ${kleur.dim(f)}\n`);
  if (files.length > 20) stdout.write(`  ${kleur.dim(`… and ${files.length - 20} more`)}\n`);
}

main().catch((err: unknown) => {
  stderr.write(kleur.red(`error: ${(err as Error).message ?? err}\n`));
  exit(1);
});
