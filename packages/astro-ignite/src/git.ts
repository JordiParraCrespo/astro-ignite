/**
 * Minimal git wrapper. Initializes a repo + makes the first commit.
 * Falls back silently if git isn't installed — the user can `git init` later.
 */

import { spawnSync } from 'node:child_process';

function run(args: string[], cwd: string): boolean {
  const result = spawnSync('git', args, {
    cwd,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });
  return result.status === 0;
}

export function initGitRepo(cwd: string): boolean {
  // -b main avoids the "default branch name" warning on fresh installs.
  if (!run(['init', '-b', 'main'], cwd) && !run(['init'], cwd)) {
    return false;
  }
  if (!run(['add', '.'], cwd)) return false;

  // Use a generic commit author — git refuses without one if user has no global config.
  const env = ['-c', 'user.email=astro-ignite@local', '-c', 'user.name=astro-ignite'];
  return run([...env, 'commit', '-m', 'chore: initial commit from astro-ignite'], cwd);
}
