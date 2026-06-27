# MDX Component Kit

The docs template ships 21 components pre-wired into the MDX renderer. Every component is plain Astro + vanilla JS, token-resolved, and yours to edit.

## How it works

All components are registered in `src/components/docs/mdx-components.ts`. Astro passes this map to the MDX renderer in `astro.config.mjs`:

```ts
// astro.config.mjs
import { mdxComponents } from './src/components/docs/mdx-components.ts';
export default defineConfig({
  integrations: [mdx({ components: mdxComponents })],
});
```

That makes every component available in `.mdx` files **without a per-file import**. You can still add an explicit import at the top of a file — it overrides the global registration for that file.

The `authoring.mdx` page in `src/content/docs/` shows live examples of every component rendered on the docs site itself.

---

## Content primitives

### Callout

Highlighted aside with an optional variant and title.

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'note' \| 'info' \| 'tip' \| 'check' \| 'warning' \| 'danger'` | `'note'` |
| `title` | `string` | Auto-filled from variant |

```mdx
<Callout variant="warning" title="Heads up">
  This action cannot be undone.
</Callout>
```

`danger` and `warning` variants render with `role="alert"` for screen readers.

---

### Steps / Step

Numbered step sequence. Steps auto-number via CSS counters — reordering renumbers without JS.

| Prop (Step) | Type | Default |
| --- | --- | --- |
| `title` | `string` | — |

```mdx
<Steps>
  <Step title="Install dependencies">
    Run `pnpm install` in the project root.
  </Step>
  <Step title="Start the dev server">
    Run `pnpm dev` and open the URL in your terminal.
  </Step>
</Steps>
```

---

### CodeBlock

Syntax-highlighted code block with a copy button.

| Prop | Type | Default |
| --- | --- | --- |
| `filename` | `string` | `'snippet'` |
| `language` | `string` | — |
| `prompt` | `boolean` | `false` |

```mdx
<CodeBlock filename="astro.config.mjs" language="ts">
```ts
export default defineConfig({ ... });
```
</CodeBlock>
```

`prompt={true}` adds a muted `$ ` prefix that is stripped when the user copies.

---

### CodeGroup

Tabbed container for multiple `<CodeBlock>` children. Each block's `filename` becomes a tab label.

```mdx
<CodeGroup>
  <CodeBlock filename="pnpm">
  ```bash
  pnpm install
  ```
  </CodeBlock>
  <CodeBlock filename="npm">
  ```bash
  npm install
  ```
  </CodeBlock>
</CodeGroup>
```

Tab selection persists to `localStorage` and syncs across all `<CodeGroup>` instances on the page.

---

### CardGroup

Responsive grid of cards.

| Prop | Type | Default |
| --- | --- | --- |
| `cols` | `2 \| 3 \| 4` | `2` |

```mdx
<CardGroup cols={3}>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</CardGroup>
```

Collapses to a single column on small viewports.

---

### Frame

Bordered figure wrapper for images and screenshots.

| Prop | Type | Default |
| --- | --- | --- |
| `caption` | `string` | — |

```mdx
<Frame caption="The three-column docs layout.">
  <Image src={screenshot} alt="Docs layout" />
</Frame>
```

Renders as `<figure>` with an optional `<figcaption>`.

---

### Columns

Generic multi-column grid. Use for arbitrary content (unlike `<CardGroup>`, which expects cards).

| Prop | Type | Default |
| --- | --- | --- |
| `cols` | `2 \| 3 \| 4` | `2` |

```mdx
<Columns cols={2}>
  **Left column content**

  **Right column content**
</Columns>
```

---

### Expandable

Collapsible disclosure for nested content. Use with `<ParamField>` or `<ResponseField>` to show object properties inline.

| Prop | Type | Default |
| --- | --- | --- |
| `title` | `string` | required |
| `hint` | `string` | — |
| `open` | `boolean` | `false` |

```mdx
<Expandable title="options" hint="object · 3 properties">
  <ParamField name="timeout" type="number" default="5000">
    Request timeout in milliseconds.
  </ParamField>
</Expandable>
```

Backed by a native `<details>` element.

---

### ParamField

API parameter row with badges for type, location, required status, and deprecation.

| Prop | Type | Default |
| --- | --- | --- |
| `name` | `string` | required |
| `type` | `string` | — |
| `location` | `'body' \| 'query' \| 'path' \| 'header'` | — |
| `required` | `boolean` | `false` |
| `default` | `string` | — |
| `deprecated` | `boolean` | `false` |

```mdx
<ParamField name="api_key" type="string" location="header" required>
  Your API key from the dashboard.
</ParamField>
```

---

### ResponseField

Response schema row. Identical to `<ParamField>` minus the `location` badge.

| Prop | Type | Default |
| --- | --- | --- |
| `name` | `string` | required |
| `type` | `string` | — |
| `required` | `boolean` | `false` |
| `default` | `string` | — |
| `deprecated` | `boolean` | `false` |

```mdx
<ResponseField name="id" type="string" required>
  Unique identifier for the created resource.
</ResponseField>
```

---

### Icon

Inline SVG icon, sized and colored via `currentColor`.

| Prop | Type | Default |
| --- | --- | --- |
| `name` | `IconName` | required |
| `size` | `number` | `16` |
| `stroke` | `number` | `1.6` |

Available icon names (28): `arrow-right`, `arrow-up-right`, `bell`, `book`, `chart`, `check`, `chevron-down`, `chevron-right`, `cloud`, `code`, `copy`, `file`, `file-code`, `folder`, `folder-open`, `git-branch`, `globe`, `key`, `layers`, `mail`, `package`, `plus`, `rocket`, `search`, `shield`, `sparkles`, `terminal`, `x`, `zap`

```mdx
<Icon name="rocket" size={20} />
```

To add an icon, extend the `icons` map in `src/components/docs/Icon.astro`.

---

### Tree

File/folder tree with auto-derived icons and box-drawing connectors.

```ts
interface TreeItem {
  name: string;
  icon?: IconName;    // overrides auto-derived icon
  tag?: string;       // small badge label
  muted?: boolean;
  children?: TreeItem[];
}
```

```mdx
<Tree items={[
  { name: 'src', children: [
    { name: 'components', children: [
      { name: 'docs', children: [
        { name: 'Callout.astro' },
      ]},
    ]},
    { name: 'pages' },
  ]},
  { name: 'astro.config.mjs' },
]} />
```

Icons auto-derive from structure: `folder-open` (root with children), `folder` (nested with children), `file-code` (`.ts`, `.astro`, `.mjs`, `.json`), `file` (default).

---

### Update

Changelog entry in a timeline layout.

| Prop | Type | Default |
| --- | --- | --- |
| `date` | `string` | required |
| `title` | `string` | required |
| `version` | `string` | — |
| `tag` | `'minor' \| 'patch' \| 'major' \| 'breaking'` | — |

```mdx
<Update date="Jun 27" title="Docs template ships" version="0.5.0" tag="minor">
  New MDX component kit with 21 components pre-wired.
</Update>
```

Tag colors: `minor` → blue, `patch` → green, `major` / `breaking` → red.

---

### Mermaid

Client-side Mermaid diagram. Lazy-loads the library only when the diagram scrolls near the viewport.

| Prop | Type | Default |
| --- | --- | --- |
| `code` | `string` | required |
| `title` | `string` | `'mermaid'` |

```mdx
<Mermaid code={`
graph TD
  A[User] --> B[CLI]
  B --> C[Template]
`} />
```

Colors resolve from the active design tokens and re-render when the theme toggles.

---

### Banner

Site-wide announcement, pinned above the header or inline as a notice.

| Prop | Type | Default |
| --- | --- | --- |
| `id` | `string` | required |
| `variant` | `'solid' \| 'subtle'` | `'solid'` |
| `icon` | `IconName` | Auto per variant |
| `href` | `string` | — |
| `linkText` | `string` | — |
| `dismissible` | `boolean` | `true` |

```mdx
<Banner id="v1-launch" href="/changelog" linkText="Read more" dismissible>
  Version 1.0 is out!
</Banner>
```

Dismissal persists to `localStorage` keyed by `id`. Bump the `id` to re-show a dismissed banner.

---

### Tiles / Tile

Compact link grid — lighter than cards, intended for navigation.

| Prop (Tiles) | Type | Default |
| --- | --- | --- |
| `cols` | `2 \| 3 \| 4` | `3` |

| Prop (Tile) | Type | Default |
| --- | --- | --- |
| `title` | `string` | required |
| `href` | `string` | required |
| `icon` | `IconName` | `'book'` |

```mdx
<Tiles cols={3}>
  <Tile title="Quick start" href="/quick-start" icon="rocket">
    Up and running in two commands.
  </Tile>
  <Tile title="Components" href="/authoring" icon="layers">
    Full MDX component reference.
  </Tile>
</Tiles>
```

---

## UI atoms

The following atoms from `src/components/ui/` are also pre-wired and available in MDX.

### Accordion / AccordionItem

```mdx
<Accordion>
  <AccordionItem title="What is astro-ignite?">
    A shadcn-style CLI that scaffolds a production-grade Astro site.
  </AccordionItem>
</Accordion>
```

Backed by native `<details name>` for exclusive open behavior.

---

### Tabs / TabsList / TabsTrigger / TabsContent

```mdx
<Tabs defaultValue="pnpm">
  <TabsList>
    <TabsTrigger value="pnpm">pnpm</TabsTrigger>
    <TabsTrigger value="npm">npm</TabsTrigger>
  </TabsList>
  <TabsContent value="pnpm">
    `pnpm install`
  </TabsContent>
  <TabsContent value="npm">
    `npm install`
  </TabsContent>
</Tabs>
```

Backed by the `<ai-tabs>` custom element.

---

### Tooltip

```mdx
<Tooltip tip="Opens in a new tab">
  <a href="https://example.com">Link</a>
</Tooltip>
```

CSS-only; no JS required.

---

### Card family

```mdx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Short description.</CardDescription>
  </CardHeader>
</Card>
```

---

## AiActions

`<AiActions>` is placed by `DocsLayout` in the page header — you don't add it to MDX. It renders a popover with:

- **Copy as Markdown** — copies the raw MDX source to the clipboard
- **View raw** — opens `/path.md` (the `.md` route served by the template)
- **Open in ChatGPT** — deep-links the page into a ChatGPT conversation
- **Open in Claude** — deep-links the page into a Claude conversation

To change which actions appear, edit `src/components/docs/AiActions.astro`.

---

## Adding a component

1. Create `src/components/docs/MyComponent.astro`:

   ```astro
   ---
   interface Props {
     title: string;
     variant?: 'default' | 'highlight';
   }
   const { title, variant = 'default' } = Astro.props;
   ---
   <div class:list={['my-component', variant]}>
     <strong>{title}</strong>
     <slot />
   </div>
   ```

2. Register it in `src/components/docs/mdx-components.ts`:

   ```ts
   import MyComponent from './MyComponent.astro';
   export const mdxComponents = {
     // ...existing entries
     MyComponent,
   };
   ```

3. Use it in any `.mdx` file — no per-file import needed:

   ```mdx
   <MyComponent title="Hello" variant="highlight">
     Content goes here.
   </MyComponent>
   ```

## Customizing an existing component

Every component is in `src/components/docs/` and owned by your repo — edit the Astro file directly. Styling uses Tailwind utilities resolving `--color-*` tokens. Scoped `<style>` blocks are reserved for what Tailwind can't express (counters, keyframes, pseudo-elements); each carries a `<!-- tailwind-exception: <reason> -->` comment.
