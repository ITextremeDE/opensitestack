# opensitestack

The `opensitestack` package provides the typed, site-neutral core and Next.js
request adapter used by OpenSiteStack applications.

The v1 API is stable under Semantic Versioning and is published for independent
Next.js application repositories.

## Host-only HSTS

`createHostOnlyHstsHeader()` returns the shared one-year browser policy
`Strict-Transport-Security: max-age=31536000`. It intentionally excludes
`includeSubDomains` and `preload` so a website cannot impose policy on sibling
subdomains outside its operating boundary. Apply it to every concrete HTTPS
website host and validate redirect-only aliases at the responsible edge.

## Site registry

`defineSiteRegistry` validates production domains, optional development hosts,
HTTPS canonical origins, and typed site metadata once at application startup.
Every normalized host must belong to exactly one site. Invalid definitions use
`SiteRegistryError` with stable error codes; malformed and unknown request hosts
resolve to `null`.

## Content sources

`contentDocumentSchema` defines IDs, route slugs, title, summary, lifecycle
status, indexability, publication timestamps, tags, and body. Content is
indexable by default and may opt out explicitly. The body may be empty for a
metadata-only route whose presentation is supplied entirely by components or
structured fields. Source-specific schemas may require a body when their
content model needs one. `defineContentSchema` adds project-specific fields
without allowing replacement of those base fields.

A `ContentSourceAdapter` returns raw values plus stable source references.
`validateContentSource` validates every value, preserves provenance, and rejects
duplicate IDs or slugs. The Node-only `opensitestack/markdown` entry point
provides a recursive local Markdown/MDX adapter that ignores symbolic links.
It also exports `parseMarkdownDocument` for applications that need the same
YAML-frontmatter behavior without introducing a second parser.

## Group inheritance

A site may map a named `contentAreas` entry to one `groupId`. Registry creation
verifies that the group exists and that the site is an explicit member. The
resolver always returns a complete site value first, otherwise the one group
value, otherwise `null`; it never merges fields or follows another fallback.

```ts
const registry = defineSiteRegistry({
  sites: [
    {
      id: "alpha",
      name: "Alpha",
      domain: "alpha.example",
      canonicalOrigin: "https://alpha.example",
      metadata: {
        title: "Alpha",
        description: "Alpha website",
        locale: "en",
      },
      robots: { disallow: ["/api/"] },
      contentAreas: { legal: { groupId: "company-group" } },
      theme: "alpha",
    },
  ],
  groups: [
    { id: "company-group", name: "Company", siteIds: ["alpha"] },
  ],
});
```

## Publication and SEO

`createPublicationEntries` is the canonical publication gate. It accepts route
candidates for one resolved site and keeps only documents that are `published`,
indexable, and whose optional `publishedAt` timestamp is due. Omitting
`publishedAt` publishes timeless content immediately. It creates same-origin
canonical URLs and rejects duplicate routes. Sitemap, search, feed, and
page-level structured-data adapters consume only these entries, so they cannot
silently disagree about publishability.

```ts
const entries = createPublicationEntries({
  site,
  candidates: documents.map((content) => ({
    content,
    pathname: `/articles/${content.slug}`,
  })),
});

const searchDocuments = projectPublicationEntries(entries, (entry) => ({
  id: entry.content.id,
  title: entry.content.title,
  url: entry.canonicalUrl,
}));
```

The package root exposes the pure `createNextMetadata`, `createNextRobots`, and
`createNextSitemap` helpers. The `opensitestack/next` entry point additionally
provides request-bound current-site resolution. All helpers use the already
resolved site; content metadata and sitemap rows require a matching
`PublicationEntry`.
`createNextRobots` keeps the common allow-all policy and adds optional,
validated site-level `robots.disallow` paths such as `/api/`.
`createWebsiteStructuredData` and `createWebPageStructuredData` provide
Schema.org objects, while `serializeStructuredData` escapes HTML delimiters
before rendering JSON-LD in a native `<script type="application/ld+json">`.

Search and feed providers remain application choices. They should use
`projectPublicationEntries` to transform the same filtered entries into their
provider-specific records instead of implementing another publication filter.

## Matrix discovery

The package root exposes builders for Matrix server and client discovery plus
`createMatrixWellKnownResponse`. Applications keep their concrete homeserver,
identity, authentication, and RTC values locally and use the shared helper in
their `/.well-known/matrix/server` and `/.well-known/matrix/client` routes.
Configured URLs must use HTTPS; responses receive interoperable CORS and cache
headers. Sites without Matrix do not create these routes.

## Consent, analytics, and forms

Sites opt into integrations with provider-neutral adapter IDs. A configured
analytics adapter must name a purpose declared by the site's consent policy.
Consent and analytics must use the same runtime.

The default `application` runtime validates consent state against the current
policy version; malformed, stale, and undeclared grants fail closed.
`resolveAnalyticsScripts` returns no scripts and does not call an adapter until
the matching purpose is granted. It accepts only external HTTPS scripts with
`afterInteractive` or `lazyOnload` strategies.

```ts
integrations: {
  consent: {
    adapterId: "site-consent",
    policyVersion: "2026-08",
    purposes: ["analytics"],
  },
  analytics: {
    adapterId: "site-analytics",
    consentPurpose: "analytics",
  },
  forms: {
    contact: { adapterId: "contact-delivery" },
  },
}
```

```ts
const consent = await resolveConsent({
  site,
  adapter: consentAdapter,
  input: consentCookie,
});

const scripts = await resolveAnalyticsScripts({
  site,
  consent,
  adapter: analyticsAdapter,
});
```

For an external consent manager that controls script activation, set both
references to `runtime: "consent-manager"`. Its adapter supplies validated HTTPS
bootstrap descriptors through `resolveConsentManagerScripts`. Analytics
adapters then supply inert external or inline descriptors tagged with the same
manager ID and a manager-owned group. OpenSiteStack validates these descriptors
but deliberately does not prescribe vendor-specific HTML attributes. Bootstrap
descriptors default to `afterInteractive` so an external manager cannot mutate
the document during React hydration; consumers may select `beforeInteractive`
explicitly only when the provider is proven hydration-safe.

```ts
integrations: {
  consent: {
    adapterId: "consent-manager",
    policyVersion: "2026-08",
    purposes: ["analytics"],
    runtime: "consent-manager",
  },
  analytics: {
    adapterId: "site-analytics",
    consentPurpose: "analytics",
    runtime: "consent-manager",
  },
}
```

The consuming application maps those descriptors to the consent manager's
documented inert-script markup. Inline content is trusted adapter code, never
untrusted CMS or document content. The consent manager remains responsible for
activation and durable consent state in this runtime.

The consuming application may map application-runtime descriptors to
`next/script`; consent-manager descriptors require the manager-specific inert
markup described above. The adapter implementation should be imported only
when the site has the integration enabled. A site without analytics
configuration always returns an empty list without invoking provider code.

Forms are mapped by a site-owned form ID to one adapter ID. A
`ServerFormAdapter` owns a Zod schema and receives only the parsed value. Call
`submitSiteForm` from a Server Action or Route Handler and select the site from
the trusted request host, not from a submitted field.

```ts
const result = await submitSiteForm({
  site,
  formId: "contact",
  adapter: contactAdapter,
  input: {
    email: formData.get("email"),
    message: formData.get("message"),
  },
});
```

Schema validation does not replace authentication, authorization, CSRF/origin
checks, abuse protection, rate limits, or provider credential handling. Those
controls remain server-side responsibilities of the consuming application.

## Themes and components

`defineThemeRegistry` validates site-owned design-token maps and can check every
site's `theme` reference during application startup. Token names are arbitrary
kebab-case identifiers; OpenSiteStack does not define colors, typography,
spacing scales, or a shared visual language. `createThemeStyle` maps them to CSS
Custom Properties without generating stylesheets or components.

```tsx
const themes = defineThemeRegistry(
  {
    themes: [
      {
        id: "alpha",
        tokens: {
          "color-background": "#f4efe4",
          "font-display": "ui-serif, Georgia, serif",
          "content-width": "48rem",
        },
      },
    ],
  },
  siteRegistry.sites,
);

const theme = themes.getThemeForSite(site);
return <html data-theme={theme.id} style={createThemeStyle(theme)} />;
```

`defineComponentSlots` keeps shared route and data logic independent from
brand-owned presentation. It freezes a typed default component map and accepts
overrides only for known slots. Components are returned by identity without a
wrapper, hook, or Client Component boundary, so Server Components remain the
default and individual sites can replace complete layouts.

```tsx
const homeSlots = defineComponentSlots({ Home: DefaultHome });
const betaSlots = homeSlots.resolve({ Home: BetaHome });
```

`defineMdxComponents` applies the same explicit allowlist to the component map
passed to an MDX renderer. A site may override an allowed component but cannot
add an undeclared one through the resolver. The allowlist does not sanitize MDX
source or disable JavaScript expressions and imports; untrusted MDX still needs
a restricted compiler pipeline.
