---
'astro-ignite': minor
'create-astro-ignite': minor
---

**Form atoms: `select`, `checkbox`, `radio-group`, `switch`.** The registry and both scaffolded templates now ship the form controls a "shadcn-style" kit is expected to have — closing the credibility gap of having inputs but no select/checkbox/radio/switch.

- All four are **native HTML, zero-JS, tokens-only**: `select` is a styled `<select>` with a token-driven chevron; `checkbox` is an `appearance-none` `<input type="checkbox">` with a CSS-only checkmark; `radio-group` is a `<fieldset>` + `radio-group-item` (label-wrapped `<input type="radio">`); `switch` is a `role="switch"` checkbox rendered as a CSS-only toggle. A11y-clean: associated labels, `focus-visible` rings, full keyboard support.
- Registered in `registry.json` with `registryDependencies: ["cn"]`, mirrored into `packages/templates/{starter,docs}/src/components/ui/` and `apps/docs`.
- **The starter contact form is rebuilt from the atoms** — `Label` + `Input` + `Textarea` + a new `Select` "subject" field — replacing the previous hand-rolled inputs. The Astro Actions + Zod flow is intact (`subject` added to the schema and threaded through the email transports).
