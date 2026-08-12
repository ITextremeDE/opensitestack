# Basic reference application

This is the canonical minimal OpenSiteStack application. It is deliberately
small enough to inspect end to end while exercising the complete platform
boundary needed by consuming sites.

## Demonstrated behavior

- host-based resolution of Alpha and Beta in one Next.js application;
- fail-closed handling of unknown hosts;
- validated site and group configuration;
- one-level group content inheritance and a complete site override;
- Markdown/MDX source validation and a shared publication gate;
- site-specific metadata, robots, sitemap, and JSON-LD;
- independent design-token themes exposed as CSS Custom Properties;
- typed replacement of a complete presentation component.

Alpha resolves `localhost` and inherits the group home document. Beta resolves
`beta.localhost` and uses its complete site document instead. Their presentation
is intentionally unrelated even though their platform logic is shared.

## File map

| Path | Responsibility |
| --- | --- |
| `src/config/sites.ts` | Site, host, group, inheritance, and theme definitions. |
| `src/lib/current-site.ts` | Cached Next.js request-host resolution. |
| `src/lib/example-content.ts` | Source validation, inheritance, and publication entries. |
| `src/app/layout.tsx` | Site metadata, JSON-LD, locale, and theme variables. |
| `src/app/page.tsx` | Shared route and data orchestration. |
| `src/components/home-views.tsx` | Site-owned component-slot implementations. |
| `src/app/robots.ts` | Host-specific robots projection. |
| `src/app/sitemap.ts` | Host-specific sitemap projection. |
| `content/groups/example-group/home.md` | Shared group content used by Alpha. |
| `content/sites/beta/home.mdx` | Complete Beta site override. |
| `scripts/validate-content.mjs` | Build-time validation of every local content record. |

## Run it

Follow the clean-checkout instructions in
[Run the reference application](../../docs/tutorials/run-reference-application.md).

From an installed workspace the short form is:

```bash
corepack pnpm check
corepack pnpm dev
```

The application is a contract example, not a design starter. Consuming
repositories should keep their own CSS, components, content, provider adapters,
credentials, and deployment configuration.
