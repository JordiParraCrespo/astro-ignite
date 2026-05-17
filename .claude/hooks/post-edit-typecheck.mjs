#!/usr/bin/env node
// Post-Edit/Write/MultiEdit hook. Runs `pnpm typecheck && pnpm format:check` ONLY
// when the edited file lives under packages/ or apps/. Anything else exits silently.
//
// Hook stdin payload (Claude Code): JSON with at least `tool_input.file_path`.
// Exit codes: 0 = silent, 2 = block (with stderr surfacing to the agent).

import { spawnSync } from 'node:child_process';

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  let payload = null;
  try {
    payload = JSON.parse(input || '{}');
  } catch {
    process.exit(0);
  }
  const filePath = payload?.tool_input?.file_path ?? payload?.tool_input?.notebook_path ?? '';
  if (!filePath) process.exit(0);

  // Skip if the edit isn't in packages/ or apps/
  if (!/\/(packages|apps)\//.test(filePath)) process.exit(0);

  // Skip on `.md` / `.json` edits — typecheck won't catch anything useful and slows iteration.
  if (/\.(md|mdx|json|jsonc|yml|yaml)$/.test(filePath)) process.exit(0);

  // Run typecheck. If it fails, surface to the agent via stderr + exit 2 (block).
  const tc = spawnSync('pnpm', ['-r', 'typecheck'], { encoding: 'utf8', timeout: 40000 });
  if (tc.status !== 0) {
    process.stderr.write(`typecheck failed after edit to ${filePath}:\n`);
    process.stderr.write(tc.stdout?.slice(-2000) ?? '');
    process.stderr.write(tc.stderr?.slice(-2000) ?? '');
    process.exit(2);
  }
  process.exit(0);
});
