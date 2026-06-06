/**
 * The component map handed to every rendered doc's `<Content components={…} />`.
 *
 * One source of truth so a new MDX component is wired into all four
 * doc-rendering routes (index + [...slug], default and [lang]) by editing
 * this file alone.
 */

import Callout from '@/components/docs/Callout.astro';
import CardGroup from '@/components/docs/CardGroup.astro';
import CodeBlock from '@/components/docs/CodeBlock.astro';
import CodeGroup from '@/components/docs/CodeGroup.astro';
import Frame from '@/components/docs/Frame.astro';
import Step from '@/components/docs/Step.astro';
import Steps from '@/components/docs/Steps.astro';

export const mdxComponents = {
  Callout,
  CardGroup,
  CodeBlock,
  CodeGroup,
  Frame,
  Step,
  Steps,
};
