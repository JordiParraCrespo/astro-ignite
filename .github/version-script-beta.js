// Rewrites create-astro-ignite's version to a per-commit beta string
// before the beta job calls `npm publish --tag beta`. The bump is not
// committed back — it only exists in the workspace for the publish step.
//
// Adapted from shadcn-ui/ui and Cloudflare wrangler.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const pkgPath = 'packages/create-astro-ignite/package.json';
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const sha = execSync('git rev-parse --short HEAD').toString().trim();

pkg.version = `0.0.0-beta.${sha}`;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Set ${pkg.name} version to ${pkg.version}`);
