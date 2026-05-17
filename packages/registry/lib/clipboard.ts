/**
 * Writes text to the user's clipboard via the async Clipboard API.
 *
 * Resolves `true` on success, `false` if the browser blocked the write
 * (no Clipboard API, permission denied, focus loss, insecure context, etc.).
 * Errors are swallowed because callers usually want a single boolean — they
 * are not actionable for the user.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
