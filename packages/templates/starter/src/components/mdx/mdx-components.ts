/**
 * The component map handed to every rendered post's `<Content components={…} />`.
 *
 * One source of truth so a new MDX component is available in all four
 * content-rendering routes (blog + projects, default and [lang]) by editing
 * this file alone. Components listed here can be used in `.mdx` without an
 * import.
 */

import Callout from '@/components/mdx/Callout.astro';
import CodeBlock from '@/components/mdx/CodeBlock.astro';
import Figure from '@/components/mdx/Figure.astro';

export const mdxComponents = {
  Callout,
  CodeBlock,
  Figure,
};
