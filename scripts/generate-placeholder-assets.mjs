#!/usr/bin/env node
/**
 * Generate placeholder PNG assets matching the cursor `>_` brand identity.
 *
 * Run from repo root:
 *   node ./scripts/generate-placeholder-assets.mjs
 *
 * Generates:
 *   - public/og/og-default.png  (1200×630)  — wordmark + cursor mark on near-black
 *   - public/icon-192.png       (192×192)   — cursor mark, square
 *   - public/icon-512.png       (512×512)
 *   - public/icon-maskable.png  (512×512)   — with safe-area padding
 *   - public/apple-touch-icon.png (180×180)
 *
 * All placeholders are pure-Zinc neutral, dark-first to match the brand.
 * Replace with real branded assets pre-launch.
 */

import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../packages/template/public');

const FG = '#fafafa';
const BG = '#0a0a0a';

// Square brand (cursor mark, centered) used for icons. Caret block sits
// flush right of the `>` glyph; both vertically centered in the safe area.
const squareSvg = (size) => {
  const fontSize = Math.round(size * 0.46);
  const caretWidth = Math.round(size * 0.18);
  const caretHeight = Math.round(size * 0.05);
  const caretX = Math.round(size * 0.55);
  const caretY = Math.round(size * 0.46);
  const textX = Math.round(size * 0.27);
  const textY = Math.round(size * 0.62);
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${BG}"/>
    <text x="${textX}" y="${textY}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="${fontSize}" font-weight="500" fill="${FG}">&gt;</text>
    <rect x="${caretX}" y="${caretY}" width="${caretWidth}" height="${caretHeight}" fill="${FG}"/>
  </svg>`;
};

// Maskable adds extra inner padding (safe area = inner 80%).
const maskableSvg = (size) => {
  const padding = Math.round(size * 0.1);
  const inner = size - padding * 2;
  const fontSize = Math.round(inner * 0.46);
  const caretWidth = Math.round(inner * 0.18);
  const caretHeight = Math.round(inner * 0.05);
  const caretX = padding + Math.round(inner * 0.55);
  const caretY = padding + Math.round(inner * 0.46);
  const textX = padding + Math.round(inner * 0.27);
  const textY = padding + Math.round(inner * 0.62);
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${BG}"/>
    <text x="${textX}" y="${textY}" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="${fontSize}" font-weight="500" fill="${FG}">&gt;</text>
    <rect x="${caretX}" y="${caretY}" width="${caretWidth}" height="${caretHeight}" fill="${FG}"/>
  </svg>`;
};

// 1200×630 OG image: cursor mark + wordmark lockup, hairline, tagline.
const ogSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <rect width="1200" height="630" fill="${BG}"/>
    <g transform="translate(80, 200)">
      <text x="0" y="120" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="160" font-weight="500" fill="${FG}">&gt;</text>
      <rect x="125" y="56" width="62" height="14" fill="${FG}"/>
      <text x="240" y="115" font-family="-apple-system, system-ui, sans-serif" font-size="100" font-weight="500" fill="${FG}" letter-spacing="-5">astro-ignite</text>
    </g>
    <line x1="80" y1="430" x2="1120" y2="430" stroke="#27272a" stroke-width="1"/>
    <text x="80" y="490" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="22" fill="#a1a1aa" letter-spacing="-0.005em">shadcn-style CLI for production-grade Astro sites</text>
    <text x="80" y="525" font-family="ui-monospace, 'SF Mono', Menlo, monospace" font-size="22" fill="#71717a" letter-spacing="-0.005em">SEO + i18n + perf, in five prompts.</text>
  </svg>`;

const targets = [
  { name: 'og/og-default.png', svg: ogSvg, w: 1200, h: 630 },
  { name: 'icon-192.png', svg: squareSvg(192), w: 192, h: 192 },
  { name: 'icon-512.png', svg: squareSvg(512), w: 512, h: 512 },
  { name: 'icon-maskable.png', svg: maskableSvg(512), w: 512, h: 512 },
  { name: 'apple-touch-icon.png', svg: squareSvg(180), w: 180, h: 180 },
];

async function main() {
  for (const t of targets) {
    const outPath = resolve(publicDir, t.name);
    await mkdir(dirname(outPath), { recursive: true });
    await sharp(Buffer.from(t.svg)).resize(t.w, t.h, { fit: 'cover' }).png({ quality: 90 }).toFile(outPath);
    console.log(`  ✓ ${t.name} (${t.w}×${t.h})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
