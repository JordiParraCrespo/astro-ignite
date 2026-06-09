/**
 * The component map handed to every rendered doc's `<Content components={…} />`.
 *
 * One source of truth so a new MDX component is wired into all four
 * doc-rendering routes (index + [...slug], default and [lang]) by editing
 * this file alone.
 */

import Banner from '@/components/docs/Banner.astro';
import Callout from '@/components/docs/Callout.astro';
import CardGroup from '@/components/docs/CardGroup.astro';
import CodeBlock from '@/components/docs/CodeBlock.astro';
import CodeGroup from '@/components/docs/CodeGroup.astro';
import Columns from '@/components/docs/Columns.astro';
import Expandable from '@/components/docs/Expandable.astro';
import Frame from '@/components/docs/Frame.astro';
import Icon from '@/components/docs/Icon.astro';
import Mermaid from '@/components/docs/Mermaid.astro';
import ParamField from '@/components/docs/ParamField.astro';
import ResponseField from '@/components/docs/ResponseField.astro';
import Step from '@/components/docs/Step.astro';
import Steps from '@/components/docs/Steps.astro';
import Tile from '@/components/docs/Tile.astro';
import Tiles from '@/components/docs/Tiles.astro';
import Tree from '@/components/docs/Tree.astro';
import Update from '@/components/docs/Update.astro';
import Accordion from '@/components/ui/accordion/accordion.astro';
import AccordionItem from '@/components/ui/accordion/accordion-item.astro';
import Tabs from '@/components/ui/tabs/tabs.astro';
import TabsContent from '@/components/ui/tabs/tabs-content.astro';
import TabsList from '@/components/ui/tabs/tabs-list.astro';
import TabsTrigger from '@/components/ui/tabs/tabs-trigger.astro';
import Tooltip from '@/components/ui/tooltip.astro';

export const mdxComponents = {
  Accordion,
  AccordionItem,
  Banner,
  Callout,
  CardGroup,
  CodeBlock,
  CodeGroup,
  Columns,
  Expandable,
  Frame,
  Icon,
  Mermaid,
  ParamField,
  ResponseField,
  Step,
  Steps,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tile,
  Tiles,
  Tooltip,
  Tree,
  Update,
};
