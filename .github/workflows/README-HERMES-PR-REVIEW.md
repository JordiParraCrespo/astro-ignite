# Hermes PR Review — Setup

## What it does
Runs free LLM (via OpenRouter) on every PR, posts review as comment.

## 1. Add Secrets to GitHub Repo

Settings → Secrets → Actions → New repository secret:

- `HERMES_API_KEY` — your OpenRouter or StepFun key
- Optional: `HERMES_MODEL` — default: `openrouter/google/gemma-7b-it` (free)

## 2. Files Added

`.github/workflows/hermes-pr-review.yml` — GitHub Action
`.github/workflows/hermes-review.js` — review script

## 3. Test Locally

```bash
export GITHUB_TOKEN=ghp_xxx
export HERMES_API_KEY=your_key
export HERMES_MODEL=openrouter/google/gemma-7b-it
export PR_NUMBER=1
export REPO=owner/repo

node .github/workflows/hermes-review.js
```

## 4. Customize

Edit `.github/workflows/hermes-review.js` — change the prompt or add project-specific checks (e.g., enforce AGENTS.md rules).
