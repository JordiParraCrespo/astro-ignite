# Delta: templates-perf — reorganize-starter-split-pages-into-per

This change is a compositional refactor of `packages/templates/starter/`
pages. It must not regress the capability's Lighthouse budget, total
transfer, or runtime-dependency posture. No new Requirements are added,
modified, or removed; this delta exists to register the change against
the capability so the harness rule `require_perf_budget_to_close_when`
(which matches `/^templates-/`) fires, and to record the expected impact
plus the post-change perf evidence the implementer must produce.

## ADDED Requirements

_None._

## MODIFIED Requirements

_None._

## REMOVED Requirements

_None._

## Notes

### Expected impact

- **JS bundle.** Astro components compile to per-page bundles. Moving
  markup from a page file into a component file is byte-equivalent
  after compilation — same DOM, same hydration footprint (zero, since
  the starter ships no client framework runtime). I5 (no undeclared
  runtime dep) is enforced explicitly by `S6` and `T21` in the
  proposal/tasks: no entry may be added to
  `packages/templates/starter/package.json` `dependencies`.
- **CSS payload.** Scoped `<style>` blocks relocate from page files
  into the section components they style. Tailwind utility class
  scanning sees the same class set (the markup didn't change, only
  which file holds it), so the compiled stylesheet is identical to
  within whitespace.
- **HTML output.** Rendered DOM is byte-equivalent up to Prettier
  reformatting.
- **Critical CSS.** Beasties inspects rendered HTML + emitted
  `<style>` blocks; both sets are unchanged.

### Risk areas to verify

- **LCP on `/`** — the H1 inside `Hero.astro` is the LCP candidate;
  `Hero.astro` itself is not refactored, so LCP should not move. The
  implementer captures the value in `runs/<ts>/perf.txt` and confirms
  it sits inside the I1 budget (≤ 2.0 s mobile).
- **CLS** — no images move; `Image.astro` invocations in the
  `BlogIndexList` / `ProjectsIndexList` sections keep their explicit
  `width`/`height`/`sizes` attributes (same as in the page they were
  extracted from). Expected CLS = 0.0.
- **Total transfer** — re-check ≤ 150 KB compressed on `/`. The
  implementer runs `node scripts/perf/run.mjs --transfer` and records
  the value.
- **Dep diff** — `pnpm -F @astro-ignite/template-starter exec -- cat
package.json` (or a plain diff against `main`) must show zero added
  entries under `dependencies`.

### Audit hook

All five capability invariants are exercised by `pnpm perf:budget`,
which the proposal binds via S9 and T25:

- I1 — Lighthouse budget on `/`
- I2 — Lighthouse budget on `/blog`
- I3 — total transfer ≤ 150 KB on `/`
- I4 — Beasties critical CSS inlined
- I5 — no undeclared runtime dep added

The implementer files
`openspec/changes/reorganize-starter-split-pages-into-per/runs/<ts>/perf.txt`
with the full report.
