#!/usr/bin/env bash
# SessionStart hook — boots a Claude Code session (local or cloud) into a
# ready-to-drive harness state.
#
#   - In cloud sessions (CLAUDE_CODE_REMOTE=true) it installs dependencies, so a
#     routine-triggered session arrives with the workspace already built.
#   - Everywhere it pins OpenSpec telemetry off and prints `pnpm queue`, so the
#     session starts with the derived harness state in its context window.
#
# Wired from .claude/settings.json (SessionStart, matcher "startup|resume").
# Safe to run repeatedly: install is skipped locally when node_modules exists.
# Always exits 0 — a failed bootstrap must never block the session from starting.

set -uo pipefail

repo_root="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
cd "$repo_root" || exit 0

# Keep OpenSpec telemetry off for every command this session runs (see .env.example).
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "OPENSPEC_TELEMETRY=0" >>"$CLAUDE_ENV_FILE"
fi
export OPENSPEC_TELEMETRY=0

is_cloud="${CLAUDE_CODE_REMOTE:-false}"

# Pin pnpm to package.json's version when corepack + network are available.
# Tolerate failure — falls back to whatever pnpm is already on PATH.
if [ "$is_cloud" = "true" ]; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@9.15.0 --activate >/dev/null 2>&1 || true
fi

# Install deps in the cloud, or locally on a fresh clone. Fast no-op when the
# store is already populated.
if [ "$is_cloud" = "true" ] || [ ! -d node_modules ]; then
  echo "[bootstrap] pnpm install…"
  pnpm install --prefer-offline 2>&1 | tail -n 3 || echo "[bootstrap] pnpm install failed — run it by hand before driving the harness"
fi

# Surface the harness state so the session opens with it in context.
echo ""
echo "[bootstrap] harness queue (pnpm queue):"
pnpm queue 2>/dev/null || echo "[bootstrap] pnpm queue unavailable — is the workspace installed?"

exit 0
