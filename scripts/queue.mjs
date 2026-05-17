#!/usr/bin/env node
// `pnpm queue` — print the derived state of every feature in openspec/feature_list.json.

import { queueSnapshot } from './lib/state.mjs';

const snapshot = await queueSnapshot();

const icon = {
  pending: '·',
  spec_ready: '◷',
  in_progress: '►',
  done: '✓',
  blocked: '✗',
};

console.log('');
for (const f of snapshot) {
  const i = icon[f.state] ?? '?';
  console.log(`${i} #${f.id} ${f.name.padEnd(34)} ${f.state.padEnd(12)} ${f.title}`);
}
console.log('');

const counts = snapshot.reduce((acc, f) => ({ ...acc, [f.state]: (acc[f.state] ?? 0) + 1 }), {});
const parts = Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ');
console.log(`Summary: ${parts}`);
