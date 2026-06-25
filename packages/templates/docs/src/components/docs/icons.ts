/**
 * Lucide-style stroke icon set shared by the docs MDX components
 * (`Icon`, `Tree`, `Banner`, `Tile`, `Mermaid`). Each entry is the inner
 * markup of a 24×24 `currentColor` stroke SVG — `Icon.astro` provides the
 * outer element. Sourced from the Claude Design handoff (docs-kit.jsx).
 */

export const icons = {
  'arrow-right': '<line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />',
  'arrow-up-right': '<line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" />',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />',
  book: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22z" />',
  chart:
    '<line x1="6" y1="20" x2="6" y2="12" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="18" y1="20" x2="18" y2="14" />',
  check: '<polyline points="20 6 9 17 4 12" />',
  'chevron-down': '<polyline points="6 9 12 15 18 9" />',
  'chevron-right': '<polyline points="9 6 15 12 9 18" />',
  cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 0-9h-.6A6 6 0 1 0 6 13.5" />',
  code: '<polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />',
  'file-code':
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><path d="m9 13-1.5 1.5L9 16" /><path d="m13 13 1.5 1.5L13 16" />',
  folder:
    '<path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />',
  'folder-open':
    '<path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2" /><path d="M3 9h17.5a1.5 1.5 0 0 1 1.45 1.9l-1.7 6A1.5 1.5 0 0 1 18.8 18H4.5A1.5 1.5 0 0 1 3 16.5z" />',
  'git-branch':
    '<line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />',
  globe:
    '<circle cx="12" cy="12" r="9" /><line x1="3" y1="12" x2="21" y2="12" /><path d="M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18z" />',
  key: '<circle cx="8" cy="15" r="4" /><path d="M10.8 12.2 21 2l-1 4 2 1-3 1" />',
  layers:
    '<polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />',
  package:
    '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />',
  plus: '<line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />',
  rocket:
    '<path d="M5 13c-1.5 1-2 4-2 4s3-.5 4-2" /><path d="M12 15c4-1 8-5 8-11 0 0-6 0-9 4-1.2 1.5-2 4-2 4z" /><path d="M9 12 6 9" />',
  search: '<circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" />',
  shield: '<path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />',
  sparkles:
    '<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" /><path d="M19 14l.7 1.9L21.5 17l-1.8.7L19 19.5l-.7-1.8L16.5 17l1.8-.7z" />',
  terminal: '<polyline points="5 8 9 12 5 16" /><line x1="12" y1="16" x2="18" y2="16" />',
  x: '<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />',
  zap: '<polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />',
} as const;

export type IconName = keyof typeof icons;
