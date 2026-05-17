// Derived state for the spec-driven harness.
// State is computed from the filesystem; no mutable status field anywhere.
// See AGENTS.md.

import { readFile, readdir, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

/**
 * Derived state for a feature name. One of:
 * - 'pending' no changes/<name>/, no archive/*-<name>/
 * - 'blocked' changes/<name>/BLOCKED.md exists (takes precedence)
 * - 'spec_ready' changes/<name>/ exists, no APPROVED marker
 * - 'in_progress' APPROVED exists, latest run is open (no review.md, or CHANGES_REQUESTED)
 * - 'done' archive/*-<name>/ exists
 *
 * Edge case: if both archive and changes exist for the same name (mid-archive
 * crash), the archive wins — the change folder should be moved.
 */
export async function featureState(name) {
 const changeDir = join(ROOT, 'openspec/changes', name);
 const archiveRoot = join(ROOT, 'openspec/archive');

 // 1. Archive present → done
 if (existsSync(archiveRoot)) {
 const entries = await readdir(archiveRoot, { withFileTypes: true });
 for (const e of entries) {
 if (e.isDirectory() && e.name.endsWith(`-${name}`)) return 'done';
 }
 }

 // 2. No change folder → pending
 if (!existsSync(changeDir)) return 'pending';

 // 3. BLOCKED.md takes precedence
 if (existsSync(join(changeDir, 'BLOCKED.md'))) return 'blocked';

 // 4. No APPROVED marker → spec_ready
 if (!existsSync(join(changeDir, 'APPROVED'))) return 'spec_ready';

 // 5. APPROVED + latest run pending review or CHANGES_REQUESTED → in_progress
 const latest = await latestRunDir(name);
 if (!latest) return 'in_progress'; // approved but no run started yet
 const reviewPath = join(latest, 'review.md');
 if (!existsSync(reviewPath)) return 'in_progress';
 const review = await readFile(reviewPath, 'utf8');
 if (/Verdict:\s*\*\*APPROVED\*\*/i.test(review)) {
 // Latest run approved but not yet archived — the leader hasn't run archive yet.
 // Treat as in_progress (the archive step is the closing action).
 return 'in_progress';
 }
 return 'in_progress';
}

/**
 * Return the absolute path of the latest runs/<ts>/ for a feature, or null.
 */
export async function latestRunDir(name) {
 const runsRoot = join(ROOT, 'openspec/changes', name, 'runs');
 if (!existsSync(runsRoot)) return null;
 const entries = await readdir(runsRoot, { withFileTypes: true });
 const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
 if (dirs.length === 0) return null;
 return join(runsRoot, dirs[dirs.length - 1]);
}

/**
 * Create a new runs/<ISO-timestamp>/ subdir under the change folder and
 * return its absolute path. Called by the leader when it transitions a
 * feature to in_progress (or restarts a failed attempt).
 */
export async function newRunDir(name) {
 const ts = new Date().toISOString().replace(/[:.]/g, '-');
 const dir = join(ROOT, 'openspec/changes', name, 'runs', ts);
 await mkdir(dir, { recursive: true });
 return dir;
}

/**
 * Pick the lowest-id non-done feature.
 */
export async function nextFeature() {
 const fl = JSON.parse(await readFile(join(ROOT, 'openspec/feature_list.json'), 'utf8'));
 const features = (fl.features ?? []).slice().sort((a, b) => a.id - b.id);
 for (const f of features) {
 const s = await featureState(f.name);
 if (s !== 'done') return { feature: f, state: s };
 }
 return null;
}

/**
 * Snapshot of every feature with its derived state. Used by `pnpm queue`.
 */
export async function queueSnapshot() {
 const fl = JSON.parse(await readFile(join(ROOT, 'openspec/feature_list.json'), 'utf8'));
 const features = (fl.features ?? []).slice().sort((a, b) => a.id - b.id);
 return Promise.all(features.map(async (f) => ({ ...f, state: await featureState(f.name) })));
}
