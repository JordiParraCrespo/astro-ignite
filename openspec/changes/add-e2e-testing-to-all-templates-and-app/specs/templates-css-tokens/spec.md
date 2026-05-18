# Delta: templates-css-tokens — add-e2e-testing-to-all-templates-and-app

The long-lived `templates-css-tokens` spec lists invariants **I1–I4**
covering token-only colour, zinc-only-in-global, the `.light` / `.dark`
class wiring, and the layered CSS strategy. The static audits at
`scripts/audit/tokens-only.mjs` cover I1–I2 and the configuration side
of I3; the _behavioural_ side of I3 (does the toggle actually flip the
class, and does the choice persist across reloads?) has been
unverified. This change does not modify I1–I4. It adds an end-to-end
test that drives the live theme toggle and files **I5** so the toggle
becomes a first-class invariant rather than an implicit promise.

## ADDED Requirements

### Requirement: Theme toggle behaviour is covered by an e2e test

For every non-playground target, an end-to-end test SHALL drive the
`ThemeToggle` component in a real browser and assert that:

1. On a fresh visit (no `theme` value in `localStorage`), the visible
   theme matches the user's `prefers-color-scheme` media query (the
   anti-flash inline script's fallback path),
2. Clicking the toggle once flips `<html>.classList` between
   `light` ↔ `dark` (or adds the explicit class when no class was
   present),
3. `localStorage.getItem('theme')` is updated to `'light'` or `'dark'`
   to match the visible state,
4. After `page.reload()`, the class persists — proving the anti-flash
   inline script reads `localStorage` on the next visit.

The implemented starter toggle is binary (light ↔ dark, with system
preference as the unset default). The spec asserts this implemented
behaviour. If the toggle ever grows a third "system" entry, this
requirement is amended in lockstep with the component.

#### Scenario: First-visit toggle persists

- **GIVEN** a fresh browser context with `localStorage` cleared
- **WHEN** the test clicks the theme toggle once
- **THEN** `<html>.classList.contains('light')` is `true`,
  `localStorage.getItem('theme')` is `'light'`, and after
  `page.reload()` the class is still present.

#### Scenario: Toggling twice returns to baseline

- **GIVEN** the toggle has been clicked once
- **WHEN** the test clicks it a second time
- **THEN** `.light` is removed from `<html>.classList`,
  `localStorage.getItem('theme')` is `'dark'`, and `<html>` no longer
  carries the explicit-light class.

## MODIFIED Requirements

_None._ The "Tri-state dark mode flips tokens via `.light` / `.dark`"
requirement and its audit (`scripts/audit/tokens-only.mjs --darkmode`)
are unchanged.

## REMOVED Requirements

_None._

## Invariants delta

| Id  | Statement                                                             | Audit                           |
| --- | --------------------------------------------------------------------- | ------------------------------- |
| I5  | Theme toggle flips `<html>.classList` and persists via `localStorage` | `pnpm test:e2e --grep '@theme'` |

I5 is the behavioural complement to the existing I3 (the static check
that the class wiring is present in `global.css`). Both stay in place;
the audits are layered, not exclusive.

## Notes

- The test does not assert specific token values (e.g.
  `--color-bg: #fff` under `.light`). Token values are a styling
  decision owned by `global.css` and may change without breaking the
  contract that "the toggle works". The test asserts the _mechanism_;
  the visual outcome is covered by Lighthouse / scaffold:test.
- "Tri-state" in the existing spec language refers to the three
  observable states: explicit-light, explicit-dark, follow-system.
  The user-visible toggle is binary (it cycles between explicit-light
  and explicit-dark), which is consistent with that language because
  the third state is "no explicit choice", reached by clearing
  `localStorage` rather than by clicking the button.
