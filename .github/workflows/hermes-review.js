const { GitHub } = require('@octokit/rest');
const OpenAI = require('openai');
require('dotenv').config();

const github = new GitHub({ auth: process.env.GITHUB_TOKEN });
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.HERMES_API_KEY,
});

const { PR_NUMBER, REPO, HERMES_MODEL } = process.env;

(async () => {
  // 1. Get PR diff
  const pr = await github.pulls.get({
    owner: REPO.split('/')[0],
    repo: REPO.split('/')[1],
    pull_number: Number(PR_NUMBER),
  });

  const diff = await github.pulls.get({
    owner: REPO.split('/')[0],
    repo: REPO.split('/')[1],
    pull_number: Number(PR_NUMBER),
    mediaType: { format: 'diff' },
  });

  // 2. Build prompt
  const prompt = `You are a code reviewer for astro-ignite, a CLI that scaffolds Astro sites.

Review this PR. Focus on:
- Conformance to AGENTS.md rules (i18n, CSS layers, token usage)
- Template invariants (parallel routes, getStaticPaths, Action adapter pinning)
- Registry component patterns (atoms only, no framework deps)
- General code quality, bugs, performance

PR title: ${pr.data.title}
PR body: ${pr.data.body || '(none)'}

Diff:
${diff.data}

Provide:
1. Summary (2-3 lines)
2. Issues found (bullet list, severity: HIGH/MED/LOW)
3. Suggested fixes (brief)
4. Approve? (YES/NO)

Format as plain text.`;

  // 3. Call LLM
  const response = await openai.chat.completions.create({
    model: HERMES_MODEL,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
  });

  const review = response.choices[0].message.content;

  // 4. Post review comment on PR
  await github.issues.createComment({
    owner: REPO.split('/')[0],
    repo: REPO.split('/')[1],
    issue_number: Number(PR_NUMBER),
    body: `## 🤖 Hermes PR Review\n\n${review}`,
  });

  console.log('Review posted.');
})();
