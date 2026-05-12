// Rewrites both publishable packages to the per-commit beta version before
// the beta job runs `npm publish --tag beta`. The bumps are NOT committed
// back — they only exist in the workspace for the publish step.
//
// `astro-ignite` and `create-astro-ignite` ship together at the same
// version: the shim is tightly coupled to a specific astro-ignite version.
//
// Adapted from shadcn-ui/ui and Cloudflare wrangler.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const PUBLISHABLE_PACKAGES = [
  'packages/astro-ignite/package.json',
  'packages/create-astro-ignite/package.json',
];

const sha = execSync('git rev-parse --short HEAD').toString().trim();
const version = `0.0.0-beta.${sha}`;

for (const pkgPath of PUBLISHABLE_PACKAGES) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.version = version;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Set ${pkg.name} version to ${version}`);
}
