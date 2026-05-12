// Used by the stable-release job in .github/workflows/release.yml as the
// `version` step of changesets/action. Equivalent to `changeset version`
// but also refreshes pnpm-lock.yaml — the lone `changeset version` does
// not, and the "Version Packages" PR would otherwise ship with a stale
// lockfile.
//
// Adapted from shadcn-ui/ui and Cloudflare wrangler.

import { execSync } from 'node:child_process';

execSync('pnpm exec changeset version', { stdio: 'inherit' });
execSync('pnpm install --lockfile-only', { stdio: 'inherit' });
