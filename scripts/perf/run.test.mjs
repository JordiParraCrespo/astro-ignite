// Unit test for the pure threshold-comparison helper in run.mjs.
//
// Uses node's built-in `node:test` runner so it works without
// adding vitest to the workspace root (root package.json is not
// listed in design.md's "Files touched" for this change). Run via:
//   node --test scripts/perf/run.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { compareAgainstBudget, compareTransfer, resolveTarget } from './run.mjs';

const THRESHOLDS = {
  scores: {
    performance: 95,
    accessibility: 95,
    'best-practices': 95,
    seo: 95,
  },
  metrics: {
    'largest-contentful-paint': 2000,
    'interaction-to-next-paint': 200,
    'cumulative-layout-shift': 0.05,
    'total-blocking-time': 200,
  },
};

function lhrWith({ scores = {}, metrics = {}, totalBytes } = {}) {
  const defaultScores = {
    performance: 0.99,
    accessibility: 1,
    'best-practices': 1,
    seo: 1,
  };
  const defaultMetrics = {
    'largest-contentful-paint': 1400,
    'interaction-to-next-paint': 80,
    'cumulative-layout-shift': 0.012,
    'total-blocking-time': 60,
  };
  const finalScores = { ...defaultScores, ...scores };
  const finalMetrics = { ...defaultMetrics, ...metrics };

  const categories = {};
  for (const [k, v] of Object.entries(finalScores)) {
    categories[k] = v === null ? null : { score: v };
  }
  const audits = {};
  for (const [k, v] of Object.entries(finalMetrics)) {
    audits[k] = v === null ? null : { numericValue: v };
  }
  if (totalBytes !== undefined) {
    audits['total-byte-weight'] = { numericValue: totalBytes };
  }
  return { categories, audits };
}

test('compareAgainstBudget — every score + metric within budget → anyFail false', () => {
  const lhr = lhrWith();
  const { findings, anyFail } = compareAgainstBudget(lhr, THRESHOLDS);
  assert.equal(anyFail, false);
  assert.ok(findings.length >= 8, 'should produce one finding per score + metric');
  for (const f of findings) {
    assert.equal(f.pass, true, `expected pass for ${f.label} (${f.detail})`);
  }
});

test('compareAgainstBudget — LCP busts the budget → exactly that finding fails', () => {
  const lhr = lhrWith({ metrics: { 'largest-contentful-paint': 3200 } });
  const { findings, anyFail } = compareAgainstBudget(lhr, THRESHOLDS);
  assert.equal(anyFail, true);
  const lcp = findings.find((f) => f.label === 'LCP');
  assert.ok(lcp, 'LCP finding expected');
  assert.equal(lcp.pass, false);
  assert.equal(lcp.actual, 3200);
  assert.equal(lcp.threshold, 2000);
  const failing = findings.filter((f) => !f.pass);
  assert.equal(failing.length, 1, 'only LCP should fail');
});

test('compareAgainstBudget — Accessibility below floor → exactly that finding fails', () => {
  const lhr = lhrWith({ scores: { accessibility: 0.92 } });
  const { findings, anyFail } = compareAgainstBudget(lhr, THRESHOLDS);
  assert.equal(anyFail, true);
  const a11y = findings.find((f) => f.label === 'Accessibility score');
  assert.ok(a11y, 'Accessibility finding expected');
  assert.equal(a11y.pass, false);
  assert.equal(a11y.actual, 92);
  assert.equal(a11y.threshold, 95);
  const failing = findings.filter((f) => !f.pass);
  assert.equal(failing.length, 1, 'only Accessibility should fail');
});

test('compareAgainstBudget — missing CLS audit fails loudly', () => {
  const lhr = lhrWith({ metrics: { 'cumulative-layout-shift': null } });
  const { findings, anyFail } = compareAgainstBudget(lhr, THRESHOLDS);
  assert.equal(anyFail, true);
  const cls = findings.find((f) => f.label === 'CLS');
  assert.ok(cls, 'CLS finding expected even when audit is missing');
  assert.equal(cls.pass, false);
  assert.match(cls.detail, /missing/);
});

test('compareTransfer — within budget → pass', () => {
  const lhr = lhrWith({ totalBytes: 110 * 1024 });
  const { finding, pass } = compareTransfer(lhr, 150);
  assert.equal(pass, true);
  assert.equal(finding.label, 'Total transfer');
  assert.equal(finding.pass, true);
  assert.equal(finding.threshold, 150);
});

test('compareTransfer — over budget → fail', () => {
  const lhr = lhrWith({ totalBytes: 200 * 1024 });
  const { finding, pass } = compareTransfer(lhr, 150);
  assert.equal(pass, false);
  assert.equal(finding.pass, false);
  assert.match(finding.detail, /200\.0 KB/);
});

test('compareTransfer — missing audit fails loudly', () => {
  const lhr = lhrWith();
  const { finding, pass } = compareTransfer(lhr, 150);
  assert.equal(pass, false);
  assert.match(finding.detail, /missing total-byte-weight/);
});

test('resolveTarget — / defaults to starter', () => {
  const t = resolveTarget(['--page', '/']);
  assert.equal(t.pkg, '@astro-ignite/template-starter');
  assert.equal(t.route, '/');
});

test('resolveTarget — /docs/foo routes to docs template', () => {
  const t = resolveTarget(['--page', '/docs/install']);
  assert.equal(t.pkg, '@astro-ignite/template-docs');
  assert.equal(t.route, '/docs/install');
});

test('resolveTarget — --target overrides routing', () => {
  const t = resolveTarget(['--page', '/', '--target', '@astro-ignite/site']);
  assert.equal(t.pkg, '@astro-ignite/site');
  assert.equal(t.route, '/');
});

test('resolveTarget — no --page defaults to starter at /', () => {
  const t = resolveTarget([]);
  assert.equal(t.pkg, '@astro-ignite/template-starter');
  assert.equal(t.route, '/');
});
