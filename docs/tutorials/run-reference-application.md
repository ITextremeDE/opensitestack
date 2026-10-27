# Run the reference application

This tutorial starts the canonical OpenSiteStack reference application from a
clean source checkout. It demonstrates two sites in one Next.js application,
one shared content group, a complete site override, separate themes, and
replaceable presentation components.

The reference application lives in the source workspace. Consuming websites
should install the released `opensitestack` package instead of copying the core
package into their repository.

## Prerequisites

- Git
- Node.js 24 or 26 (`.nvmrc` selects the development default)
- pnpm 11.21.0; install via `npm install --global pnpm@11.21.0` if needed
  (Node 26 does not bundle Corepack)

Check the runtime before installing dependencies:

```bash
node --version
pnpm --version
```

Node.js must be one of the supported majors (24 or 26) and pnpm must be 11.21.x.

## Install from source

Clone the public repository into a new directory and install the locked
dependencies:

```bash
git clone https://github.com/ITextremeDE/opensitestack.git
cd opensitestack
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` validates the package, all content records, TypeScript, and the
production build before the development server is started.

## Start the application

```bash
pnpm dev
```

Open these URLs in a browser:

- `http://localhost:3000` resolves to Alpha.
- `http://beta.localhost:3000` resolves to Beta.
- An unknown host returns the application's not-found response instead of a
  fallback brand.

Alpha reads `content/groups/example-group/home.md`. Beta has the same group
assignment but its `content/sites/beta/home.mdx` file wins as a complete site
override. Alpha uses an editorial theme and component; Beta uses a dark control
panel. Routing, content resolution, publication, and SEO remain shared.

## Trace the request

The reference application is intentionally small. Follow one request through
these files:

1. `examples/basic/src/config/sites.ts` validates sites, groups, and themes.
2. `examples/basic/src/lib/current-site.ts` resolves the request host.
3. `examples/basic/src/lib/example-content.ts` validates local content and
   applies site-before-group resolution.
4. `examples/basic/src/app/layout.tsx` applies metadata, structured data, and
   theme tokens.
5. `examples/basic/src/components/home-views.tsx` selects a site-owned view
   through a typed component slot.
6. `examples/basic/src/app/robots.ts` and `sitemap.ts` project the same resolved
   site and publication entries into SEO routes.

The complete file map and expected behavior are documented in the
[reference example README](../../examples/basic/README.md).

## Make a reversible change

Change the Alpha accent token in `examples/basic/src/config/sites.ts`, then run:

```bash
pnpm check
```

Only Alpha's presentation should change. Revert the token after the exercise;
no platform code or Beta component needs to be copied.

## Next steps

- Use the [configuration reference](../reference/configuration.md) to add sites,
  content areas, themes, or optional integrations.
- Use the [migration guide](../how-to/migrate-existing-nextjs.md) when adopting
  the package in an existing website repository.
- Use the [upgrade guide](../how-to/upgrade-opensitestack.md) for later releases.

## Rendered verification

Follow [quality gates](../how-to/quality-gates.md) after `pnpm check` to run the
production browser and mobile budget tests. The [consent lifecycle example](../how-to/consent-renderer-lifecycle.md)
is available at `/consent-example` on either local host.
