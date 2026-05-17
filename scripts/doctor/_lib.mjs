// Shared doctor helpers. Each check exports `check()` returning Finding[].
// Finding = { severity: 'ok' | 'warn' | 'error', subsystem, message, fix? }

import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../..', import.meta.url));

export function ok(subsystem, message) {
  return { severity: 'ok', subsystem, message };
}
export function warn(subsystem, message, fix) {
  return { severity: 'warn', subsystem, message, fix };
}
export function error(subsystem, message, fix) {
  return { severity: 'error', subsystem, message, fix };
}
