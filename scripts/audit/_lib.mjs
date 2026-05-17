// Shared helpers for the audit scripts.
//
// Audit contract (per AGENTS.md T2):
// - CLI: node scripts/audit/<name>.mjs [--flag]...
// - stdout: human-readable report
// - stderr: one JSON line with { audit, pass, hits, notes }
// - exit code: 0 pass, non-zero fail

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

export async function walkFiles(dir, predicate = () => true) {
 const out = [];
 async function recur(current) {
 let entries;
 try {
 entries = await readdir(current, { withFileTypes: true });
 } catch {
 return;
 }
 for (const entry of entries) {
 if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro' || entry.name === '.turbo' || entry.name.startsWith('.git')) continue;
 const full = join(current, entry.name);
 if (entry.isDirectory()) {
 await recur(full);
 } else if (entry.isFile() && predicate(full, entry.name)) {
 out.push(full);
 }
 }
 }
 await recur(dir);
 return out;
}

export async function grepFiles(files, regex) {
 const hits = [];
 for (const file of files) {
 let content;
 try {
 content = await readFile(file, 'utf8');
 } catch {
 continue;
 }
 const lines = content.split('\n');
 for (let i = 0; i < lines.length; i++) {
 const match = lines[i].match(regex);
 if (match) {
 hits.push({ file: relative(ROOT, file), line: i + 1, snippet: lines[i].trim().slice(0, 200), match: match[0] });
 }
 }
 }
 return hits;
}

export function emitResult({ audit, pass, hits = [], notes = '' }) {
 // Human report → stdout
 if (pass) {
 console.log(`✅ ${audit} PASS${notes ? ` — ${notes}` : ''}`);
 } else {
 console.log(`❌ ${audit} FAIL${notes ? ` — ${notes}` : ''}`);
 for (const h of hits.slice(0, 50)) {
 const loc = h.line ? `${h.file}:${h.line}` : h.file;
 console.log(` ${loc} — ${h.snippet ?? h.message ?? ''}`);
 }
 if (hits.length > 50) console.log(` ... and ${hits.length - 50} more`);
 }
 // Machine report → stderr (one line)
 process.stderr.write(JSON.stringify({ audit, pass, hits, notes }) + '\n');
 process.exit(pass ? 0 : 1);
}

export function flag(argv, name) {
 return argv.includes(`--${name}`);
}

export function flagValue(argv, name) {
 const idx = argv.indexOf(`--${name}`);
 if (idx === -1) return undefined;
 return argv[idx + 1];
}

export function exists(path) {
 return existsSync(path);
}

export async function templateDirs() {
 const root = join(ROOT, 'packages/templates');
 if (!exists(root)) return [];
 const entries = await readdir(root, { withFileTypes: true });
 return entries.filter((e) => e.isDirectory()).map((e) => join(root, e.name));
}
