import type { PlaywrightTestProject, PlaywrightTestConfig } from '@playwright/test';

export type TargetKind = 'template' | 'app' | 'playground-smoke';

export type Target = {
  name: string;
  kind: TargetKind;
  cwd: string;
  port: number;
  command: string;
  testDirs: string[];
};

const cwd = (p: string) => p;

export const TARGETS: Target[] = [
  {
    name: 'starter',
    kind: 'template',
    cwd: cwd('packages/templates/starter'),
    port: 4321,
    command: 'pnpm exec astro dev --host 127.0.0.1 --port 4321',
    testDirs: ['common', 'starter'],
  },
  {
    name: 'docs-template',
    kind: 'template',
    cwd: cwd('packages/templates/docs'),
    port: 4322,
    command: 'pnpm exec astro dev --host 127.0.0.1 --port 4322',
    testDirs: ['common', 'docs-template'],
  },
  {
    name: 'docs-template-built',
    kind: 'template',
    cwd: cwd('packages/templates/docs'),
    port: 4323,
    command: 'pnpm build && pnpm exec astro preview --host 127.0.0.1 --port 4323',
    testDirs: ['docs-template-built'],
  },
  {
    name: 'site',
    kind: 'app',
    cwd: cwd('apps/site'),
    port: 4324,
    command: 'pnpm exec astro dev --host 127.0.0.1 --port 4324',
    testDirs: ['common', 'site'],
  },
  {
    name: 'docs-app',
    kind: 'app',
    cwd: cwd('apps/docs'),
    port: 4325,
    command: 'pnpm exec astro dev --host 127.0.0.1 --port 4325',
    testDirs: ['common', 'docs-app'],
  },
  {
    name: 'playground',
    kind: 'playground-smoke',
    cwd: cwd('apps/playground'),
    port: 4326,
    command: 'pnpm exec astro preview --host 127.0.0.1 --port 4326',
    testDirs: ['playground'],
  },
];

export const TARGETS_BY_NAME: Record<string, Target> = Object.fromEntries(
  TARGETS.map((t) => [t.name, t])
);

export function baseUrlFor(target: Target): string {
  return `http://127.0.0.1:${target.port}`;
}

export function projectForTarget(
  target: Target,
  use: PlaywrightTestProject['use'] = {}
): PlaywrightTestProject {
  const testMatch = target.testDirs.map((d) => `${d}/**/*.spec.ts`);
  return {
    name: target.name,
    testMatch,
    use: {
      ...use,
      baseURL: baseUrlFor(target),
    },
    metadata: {
      kind: target.kind,
      port: target.port,
      cwd: target.cwd,
    },
  };
}

export function webServerForTarget(
  target: Target
): NonNullable<PlaywrightTestConfig['webServer']> extends Array<infer T> ? T : never {
  return {
    command: target.command,
    cwd: target.cwd,
    port: target.port,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      SITE_E2E: '1',
      NODE_ENV: process.env.NODE_ENV ?? 'development',
    },
  };
}
