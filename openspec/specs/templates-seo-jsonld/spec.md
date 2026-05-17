# Capability: templates-seo-jsonld

## Purpose

Every page contributes a typed `schema-dts` node to a single `@graph`
JSON-LD block emitted by the layout. The graph is the SEO contract;
hand-rolled `<script type="application/ld+json">` blocks are forbidden.

## Boundary

Owned by: `packages/templates/<kind>/src/layouts/`, every `.astro` page
that contributes a node, `src/lib/seo/graph.ts` (the assembler).

Touched by: nothing else.

## Requirements

### Requirement: Layout assembles a single `@graph`

The base layout SHALL emit exactly one `<script type="application/ld+json">`
block whose payload is `{ "@context": "https://schema.org", "@graph": [
... nodes ] }`. No page emits its own JSON-LD block independently.

#### Scenario: A blog post renders

- **GIVEN** a blog post page contributes a `BlogPosting` node
- **WHEN** the layout renders
- **THEN** the page has exactly one JSON-LD script, and it contains the
  `BlogPosting` inside `@graph`.

### Requirement: All nodes are typed via `schema-dts`

Every node added to the graph SHALL be typed against `schema-dts` types
(`WebSite`, `Organization`, `WebPage`, `BlogPosting`, `BreadcrumbList`,
etc.). `any`, `unknown`, or untyped object literals are forbidden.

#### Scenario: A page contributes a custom node

- **GIVEN** a page wants to add a `Product` node
- **WHEN** the type-check runs
- **THEN** the node satisfies `Product` from `schema-dts` or the build
  fails.

### Requirement: Cross-references use `@id`

When one node references another (a `BlogPosting`'s `author` pointing at
an `Organization`), the reference SHALL be `{ "@id": "<url>" }`, not an
inlined duplicate.

#### Scenario: BlogPosting references Organization

- **GIVEN** the site Organization has `@id: "https://example.com/#org"`
- **WHEN** a BlogPosting sets `author`
- **THEN** the value is `{ "@id": "https://example.com/#org" }`.

## Invariants (audit table)

| Id  | Statement                                           | Audit                                          |
| --- | --------------------------------------------------- | ---------------------------------------------- |
| I1  | Layout emits exactly one JSON-LD `@graph` script    | `node scripts/audit/jsonld-graph.mjs`          |
| I2  | No page emits standalone JSON-LD outside the layout | `node scripts/audit/jsonld-graph.mjs --strict` |
| I3  | All graph nodes are typed via `schema-dts`          | `node scripts/audit/jsonld-graph.mjs --typed`  |
