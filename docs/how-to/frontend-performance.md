# Keep frontend work on the critical path small

Apply these patterns in each consuming application. OpenSiteStack supplies
site/theme contracts; it does not own a brand's fonts, assets, controls or
browser preference policy.

- Apply a saved/system/site color preference before the first paint when the
  site has a color-mode switch. Make its initial state agree with the hydrated
  control, validate stored values, tolerate unavailable storage and preserve
  explicit user choices. Test default-dark sites and stored overrides with
  client chunks blocked. The system-font reference has no color-mode switch,
  so it does not add a redundant bootstrap.
- Use local licensed fonts and content-addressed URLs with immutable caching.
  Preload only font faces used above the fold for the resolved site. A late font
  swap can cause layout work after paint; preloading every font can instead
  delay LCP. Keep license files with copies and measure the trade-off. The
  reference uses system fonts and therefore needs no font preloads.
- Prepare generated assets explicitly before dev/build/type/lint steps that
  import them. A dependency-only container stage commonly has only package
  manifests; an install-time hook must not require application source files.
- Use native buttons for actions, links for navigation, native selects for
  simple choices and native disclosure/dialog elements where appropriate.
  Preserve focus visibility, Escape, tab behavior and focus return. A UI
  dependency should earn its initial bundle and hydration cost.
- Keep pure CSS-variant helpers in a module separate from interactive UI
  primitives. A link that only needs class names should not import a component
  module that also imports a browser runtime. Preserve the component's public
  API with a compatibility re-export if needed, and measure the production
  bundle rather than assuming the bundler removed unused client boundaries.
- Prioritize the actual LCP image and use responsive sizes/quality. CSS
  backgrounds discovered late may benefit from a page-specific image preload.
  Avoid preloading legal-page or below-fold media on every route.
- Review route prefetching against actual likely navigation. Avoid needless
  background fetches and duplicate client work on a reading page. Preserve
  normal links/navigation; do not delay content or disable functionality merely
  to improve an audit score.

Use the [rendered gates](quality-gates.md) for repeatable measurements. Distinguish
transfer, script evaluation, blocking time, font/layout work and LCP discovery;
a smaller download alone does not prove a faster interaction. Add CPU stress
runs only as labelled diagnostics, never silently change the normative profile
or replace a failed run with a selected favorable sample.
