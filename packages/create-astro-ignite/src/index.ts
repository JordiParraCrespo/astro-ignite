// Thin shim: `npm create astro-ignite@<tag>` runs this, which delegates to
// `astro-ignite bootstrap` from the sibling package via npx. The package on
// npm needs to exist independently (npm's `create-*` convention), but all
// actual logic — templates, prompts, scaffolding — lives in `astro-ignite`.

import { spawnSync } from 'node:child_process';

// The shim publishes at the same version as `astro-ignite`. The release
// pipeline (changesets for stable, version-script-beta.js for per-PR betas)
// keeps both packages on the same version string.
const VERSION_SPEC = process.env.ASTRO_IGNITE_VERSION ?? 'latest';

const args = [`astro-ignite@${VERSION_SPEC}`, 'bootstrap', ...process.argv.slice(2)];
const result = spawnSync('npx', ['--yes', ...args], { stdio: 'inherit' });
process.exit(result.status ?? 1);
