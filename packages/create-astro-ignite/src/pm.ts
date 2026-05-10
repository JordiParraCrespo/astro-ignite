/**
 * Package manager detection + invocation.
 *
 * On `npm create`, `pnpm create`, `yarn create`, `bun create`, the invoking
 * package manager sets `npm_config_user_agent` like `pnpm/9.15.0 ...`.
 * Parse the leading token to suggest the same PM as the default.
 */

import { spawn } from 'node:child_process';

import type { PackageManager } from './types';

const VALID: ReadonlySet<PackageManager> = new Set(['npm', 'pnpm', 'yarn', 'bun']);

export function detectPackageManager(): PackageManager | null {
  const ua = process.env.npm_config_user_agent;
  if (!ua) return null;
  const head = ua.split(/\s+/)[0];
  if (!head) return null;
  const name = head.split('/')[0];
  if (name && VALID.has(name as PackageManager)) {
    return name as PackageManager;
  }
  return null;
}

export function installCommand(pm: PackageManager): string[] {
  switch (pm) {
    case 'npm':
      return ['install'];
    case 'pnpm':
      return ['install'];
    case 'yarn':
      return ['install'];
    case 'bun':
      return ['install'];
  }
}

export function devScriptCommand(pm: PackageManager): string {
  return pm === 'npm' ? 'npm run dev' : `${pm} dev`;
}

/** Run a child command, streaming stdio to the parent terminal. */
export function runCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<{ ok: boolean; code: number | null }> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    proc.on('close', (code) => {
      resolve({ ok: code === 0, code });
    });
    proc.on('error', () => {
      resolve({ ok: false, code: 1 });
    });
  });
}
