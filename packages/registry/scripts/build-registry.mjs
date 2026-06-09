#!/usr/bin/env node
/**
 * Build step: emit one shadcn-conformant registry-item JSON per `registry.json`
 * item, with each file's source inlined as `content`. The output is hosted on
 * `apps/site` at `/r/<name>.json` so any project can install an atom with
 * `npx shadcn@latest add @astro-ignite/<name>` (the `@astro-ignite` namespace
 * is configured consumer-side; see `packages/registry/README.md`).
 *
 * Usage: node scripts/build-registry.mjs --out <dir>   (default: dist/r)
 *
 * The functions are exported so the test (`build-registry.test.mjs`) can assert
 * every manifest item produces a corresponding emitted file.
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const REGISTRY_DIR = resolve(HERE, '..');
const ITEM_SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json';
export const NAMESPACE = '@astro-ignite';

export async function readManifest(registryDir = REGISTRY_DIR) {
  return JSON.parse(await readFile(join(registryDir, 'registry.json'), 'utf8'));
}

/**
 * Resolve every manifest item into a registry-item object with file contents
 * inlined. This is exactly the payload shadcn fetches from `/r/<name>.json`.
 */
export async function buildRegistryItems(registryDir = REGISTRY_DIR) {
  const manifest = await readManifest(registryDir);
  const localNames = new Set(manifest.items.map((i) => i.name));
  // A bare registryDependency name resolves against shadcn's *default* registry.
  // Rewrite deps that point at our own items to the namespaced form so a
  // consumer's `@astro-ignite` namespace resolves them against this registry.
  const namespaceDep = (dep) =>
    localNames.has(dep) && !dep.includes('/') ? `${NAMESPACE}/${dep}` : dep;

  const items = [];
  for (const item of manifest.items) {
    const files = [];
    for (const file of item.files) {
      const content = await readFile(join(registryDir, file.path), 'utf8');
      files.push({ ...file, content });
    }
    const deps = item.registryDependencies?.map(namespaceDep);
    items.push({
      $schema: ITEM_SCHEMA,
      name: item.name,
      type: item.type,
      ...(item.title ? { title: item.title } : {}),
      ...(item.description ? { description: item.description } : {}),
      ...(deps ? { registryDependencies: deps } : {}),
      files,
    });
  }
  return items;
}

export async function writeRegistry({ registryDir = REGISTRY_DIR, outDir } = {}) {
  if (!outDir) throw new Error('writeRegistry: outDir is required');
  const items = await buildRegistryItems(registryDir);
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const item of items) {
    await writeFile(join(outDir, `${item.name}.json`), JSON.stringify(item, null, 2) + '\n');
  }
  // Top-level index, for registry browse / shadcn's MCP server.
  const manifest = await readManifest(registryDir);
  await writeFile(join(outDir, 'registry.json'), JSON.stringify(manifest, null, 2) + '\n');
  return items.map((i) => i.name);
}

function parseOut(argv) {
  const i = argv.indexOf('--out');
  const raw = i !== -1 && argv[i + 1] ? argv[i + 1] : 'dist/r';
  return isAbsolute(raw) ? raw : resolve(process.cwd(), raw);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = parseOut(process.argv.slice(2));
  const names = await writeRegistry({ outDir });
  for (const name of names) console.log(`  ✓ /r/${name}.json`);
  console.log(`registry: ${names.length} item(s) emitted to ${outDir}`);
}
