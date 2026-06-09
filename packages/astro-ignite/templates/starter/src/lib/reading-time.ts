/**
 * Estimate reading time in whole minutes from a body of text.
 *
 * Counts whitespace-delimited tokens against a 200 words-per-minute baseline
 * (a common average for prose) and clamps to a minimum of 1. Markdown/MDX
 * syntax is counted as-is — close enough for a "{n} min read" badge.
 */

const WORDS_PER_MINUTE = 200;

export function readingTimeMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
