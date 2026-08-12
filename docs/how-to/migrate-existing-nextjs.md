# Migrate an existing Next.js website

This guide introduces OpenSiteStack into an existing Next.js App Router
repository while preserving its visible design and content. Migrate one concern
at a time; a rewrite disguised as a migration is still a rewrite.

## 1. Establish a baseline

Before changing dependencies, record:

- supported Node.js and Next.js versions;
- production and development hosts;
- canonical URLs, metadata, robots, sitemap, and structured data;
- content sources and publication rules;
- existing analytics, consent, and forms;
- screenshots and production-build results for important routes.

Commit or otherwise preserve a known-good state so each migration step can be
reverted independently.

## 2. Add the package

After the first public package release, install a deliberate compatible version
instead of copying source files:

```bash
corepack pnpm add opensitestack@^0.1.0
```

Before that release, develop against the OpenSiteStack workspace and its
reference application. Do not vendor `packages/opensitestack/src` into the site.

Confirm that the consuming repository meets the package peer ranges shown in
`packages/opensitestack/package.json`.

## 3. Introduce one site registry

Describe the existing site first. Keep its current production domain,
canonical origin, metadata, and theme ID. Add development hosts explicitly.
Replace ad-hoc host parsing with `createCurrentSiteResolver` only after registry
validation succeeds.

At this stage the rendered components and content loading should remain
unchanged. Verify known and unknown hosts before continuing.

## 4. Move SEO to the resolved site

Generate metadata, robots, sitemap, and structured data from the same resolved
site. Introduce `createPublicationEntries` as the only publication gate before
projecting content into sitemap, search, or feeds.

Compare canonical URLs and indexability against the baseline. Never use a
default brand for an unknown host.

## 5. Adapt content without moving it first

Implement a `ContentSourceAdapter` for the existing store, then validate its raw
records with `validateContentSource`. Keep the source system and paths unchanged
until the adapter contract is stable.

Map the existing lifecycle to `draft`, `review`, `published`, and `archived`.
Published records need an offset-aware `publishedAt`. Resolve complete site
content first and one explicit group fallback second; do not reproduce implicit
multi-level inheritance.

## 6. Add group inheritance deliberately

Create groups only for content that is actually shared. Add every member site
explicitly, then map each inheriting content area to one group. Move or copy one
content area at a time and verify:

- a site override wins completely;
- removing that override reveals the group value;
- a non-member cannot reference the group;
- missing site and group values return `null`.

## 7. Connect the existing design

Translate the repository's existing design values into site-owned theme tokens
and apply them with `createThemeStyle`. Keep the existing CSS and components;
OpenSiteStack does not require shared visual primitives.

Use `defineComponentSlots` only where route/data logic should stay common while
a site replaces complete presentation components. Resolve component maps at
module scope and keep Server Components as the default.

Compare the migrated site with the baseline screenshots before adding a second
theme or component override.

## 8. Move optional integrations last

Represent existing consent, analytics, and forms with provider-neutral adapter
references. Keep credentials and provider SDKs in the consuming repository.
Verify that analytics fails closed without a current matching consent grant and
that form input is validated on the server before provider submission.

## 9. Add the next site

Only after the first site's behavior matches the baseline should a second site
be added. A second repository may share the OpenSiteStack package and
configuration conventions, but it retains its own content, design, components,
deployment, and secrets.

## Completion checklist

- production build, lint, type checks, and content validation pass;
- known hosts resolve to exactly one site and unknown hosts fail closed;
- canonical metadata, robots, sitemap, and structured data are site-correct;
- unpublished content is absent from all publication projections;
- group fallback and site override behavior are tested;
- existing visual behavior is unchanged unless a separate design change was
  approved;
- analytics and forms remain consent- and server-controlled;
- the previous release or commit is still a viable rollback target.
