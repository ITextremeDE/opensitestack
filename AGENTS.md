# OpenSiteStack project rules

## Purpose

OpenSiteStack is the shared, public Next.js platform core for independently
operated website repositories. Common behavior belongs here; brand design,
content, credentials, infrastructure details, and site-specific components do
not.

## Architecture

- Keep the core site-neutral and configuration-driven.
- Support host-based multisite resolution in one Next.js application.
- Shared content uses explicit groups with at most one group-level fallback.
- A site override always wins. Never add multi-level or cyclic inheritance.
- Keep Server Components as the default. Add Client Components only for browser
  APIs, interaction, or client state.
- Treat URLs, metadata, canonicals, robots, sitemaps, structured data, consent,
  and accessibility as platform concerns with site-level configuration.
- Expose extension points instead of importing brand-specific components into
  the core.

## Quality

Run `pnpm check` before claiming a change is complete. Keep tests close to the
platform contract and update documentation with public API or workflow changes.
Do not commit secrets, private content, production data, or internal operating
details.

## Releases

OpenSiteStack uses Semantic Versioning, Keep a Changelog, and MPL-2.0. Record
long-lived architectural decisions in `docs/adr/`. Commit and publish only after
reviewing the complete diff and repository state.
