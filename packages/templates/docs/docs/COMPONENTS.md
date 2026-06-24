# MDX Components

The docs template ships a set of Astro components you can drop into any `.mdx` page. They live in `src/components/docs/` and are registered globally in `src/components/docs/mdx-components.ts` — so you can import and use them in any doc page.

## Callout

Highlights important content with a tinted, bordered block.

```mdx
import Callout from '@/components/docs/Callout.astro';

<Callout variant="tip" title="Optional custom title">
  Body copy — any MDX is fine here.
</Callout>
```

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'note' \| 'tip' \| 'warning' \| 'danger'` | `'note'` |
| `title` | `string` | variant's built-in default |

Each variant maps to a status color token: `note` → neutral, `tip` → `--color-success`, `warning` → `--color-warning`, `danger` → `--color-danger`. The tint and border are derived via `color-mix()` so both themes stay consistent.

## Steps / Step

Numbered walkthroughs. Steps renumber automatically when reordered — no counters to maintain.

```mdx
import Steps from '@/components/docs/Steps.astro';
import Step from '@/components/docs/Step.astro';

<Steps>
  <Step title="Install">Run the create command.</Step>
  <Step title="Configure">Edit `src/config/site.ts`.</Step>
  <Step title="Deploy">Push to your host.</Step>
</Steps>
```

`title` is optional on `Step`. If omitted, the step renders the number badge and body without a heading.

## CodeBlock

A code snippet with a filename tab and a copy button.

```mdx
import CodeBlock from '@/components/docs/CodeBlock.astro';

<CodeBlock filename="terminal" language="bash">
  {`npm create astro-ignite@latest my-site`}
</CodeBlock>
```

| Prop | Type | Default |
| --- | --- | --- |
| `filename` | `string` | `'snippet'` |
| `language` | `string` | — |

Use template literals (`{\`...\`}`) for the content so whitespace is preserved. Shiki syntax highlighting applies inside the `<pre>` if you pass highlighted HTML as the slot — see [Highlighted fenced blocks](#highlighted-fenced-blocks) below.

## CodeGroup

Combines several `<CodeBlock>` children into one tabbed panel. Each child's `filename` becomes a tab label.

```mdx
import CodeGroup from '@/components/docs/CodeGroup.astro';
import CodeBlock from '@/components/docs/CodeBlock.astro';

<CodeGroup>
  <CodeBlock filename="npm">{`npm create astro-ignite@latest my-site`}</CodeBlock>
  <CodeBlock filename="pnpm">{`pnpm create astro-ignite my-site`}</CodeBlock>
  <CodeBlock filename="yarn">{`yarn create astro-ignite my-site`}</CodeBlock>
</CodeGroup>
```

The tab strip and a single copy button are synthesized by the `<ai-code-group>` custom element — no framework runtime.

## Frame

Centers and frames media with a border and optional caption. Use it around screenshots or diagrams so they look intentional rather than inline.

```mdx
import Frame from '@/components/docs/Frame.astro';

<Frame caption="The scaffold prompt flow">
  <img src="/screenshots/prompt.png" alt="CLI prompts" width="800" height="450" />
</Frame>
```

| Prop | Type | Default |
| --- | --- | --- |
| `caption` | `string` | — |

Pair with the `Image` atom (`@/components/image/Image.astro`) for automatic AVIF + WebP and responsive `srcset`.

## CardGroup

Lays children out in a responsive N-column grid that collapses to one column on mobile. Pair it with the `Card` atom family.

```mdx
import CardGroup from '@/components/docs/CardGroup.astro';
import Card from '@/components/ui/card/card.astro';
import CardHeader from '@/components/ui/card/card-header.astro';
import CardTitle from '@/components/ui/card/card-title.astro';
import CardDescription from '@/components/ui/card/card-description.astro';

<CardGroup cols={2}>
  <Card>
    <CardHeader>
      <CardTitle>Quick start</CardTitle>
      <CardDescription>Bootstrap a site in under a minute.</CardDescription>
    </CardHeader>
  </Card>
  <Card>
    <CardHeader>
      <CardTitle>Templates</CardTitle>
      <CardDescription>Starter or docs — pick what fits.</CardDescription>
    </CardHeader>
  </Card>
</CardGroup>
```

| Prop | Type | Default |
| --- | --- | --- |
| `cols` | `2 \| 3 \| 4` | `2` |

## AiActions

The "use this page with AI" menu in the doc header. Lets readers copy the page as Markdown, view the raw `.md`, or open it in ChatGPT / Claude with the page URL pre-loaded as context.

`AiActions` is wired into `DocsLayout` automatically — you don't need to add it to individual pages. The `markdownPath` prop is set by the layout from the page's slug.

```astro
<!-- In DocsLayout.astro — already wired -->
<AiActions markdownPath={`/${slug}.md`} />
```

If you build a custom layout and want the menu, import it explicitly and pass the Markdown path. The links work without JS; only the "Copy as Markdown" button requires the Clipboard API.

## Highlighted fenced blocks

Raw fenced code blocks use Shiki at build time — zero client cost. Add line highlights or diff markers with Shiki transformer syntax:

````md
```ts {2}
const config = {
  primary: 'var(--color-primary)', // this line is highlighted
};
```

```ts
const before = 1; // [!code --]
const after = 2;  // [!code ++]
```
````

For a copy button, use `<CodeBlock>` instead.

## Adding a new component

1. Create `src/components/docs/YourComponent.astro`.
2. Register it in `src/components/docs/mdx-components.ts` so it's available across every doc page.
3. Import it at the top of any `.mdx` file that uses it:

```mdx
import YourComponent from '@/components/docs/YourComponent.astro';
```
