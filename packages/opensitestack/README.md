# opensitestack

The `opensitestack` package provides the typed, site-neutral core and Next.js
request adapter used by OpenSiteStack applications.

The API is pre-1.0 and currently intended for development inside the
OpenSiteStack workspace.

## Site registry

`defineSiteRegistry` validates production domains, optional development hosts,
HTTPS canonical origins, and typed site metadata once at application startup.
Every normalized host must belong to exactly one site. Invalid definitions use
`SiteRegistryError` with stable error codes; malformed and unknown request hosts
resolve to `null`.

## Content sources

`contentDocumentSchema` defines IDs, route slugs, title, summary, lifecycle
status, indexability, publication timestamps, tags, and body. Content is
indexable by default and may opt out explicitly. `defineContentSchema` adds
project-specific fields without allowing replacement of those base fields.

A `ContentSourceAdapter` returns raw values plus stable source references.
`validateContentSource` validates every value, preserves provenance, and rejects
duplicate IDs or slugs. The Node-only `opensitestack/markdown` entry point
provides a recursive local Markdown/MDX adapter that ignores symbolic links.

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
indexable, and whose `publishedAt` timestamp is due. It creates same-origin
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

The `opensitestack/next` entry point exposes `createNextMetadata`,
`createNextRobots`, and `createNextSitemap`. All use the already resolved site;
content metadata and sitemap rows require a matching `PublicationEntry`.
`createWebsiteStructuredData` and `createWebPageStructuredData` provide
Schema.org objects, while `serializeStructuredData` escapes HTML delimiters
before rendering JSON-LD in a native `<script type="application/ld+json">`.

Search and feed providers remain application choices. They should use
`projectPublicationEntries` to transform the same filtered entries into their
provider-specific records instead of implementing another publication filter.

## Consent, analytics, and forms

Sites opt into integrations with provider-neutral adapter IDs. A configured
analytics adapter must name a purpose declared by the site's consent policy.
Consent states are validated against the current policy version; malformed,
stale, and undeclared grants fail closed. `resolveAnalyticsScripts` returns no
scripts and does not call an adapter until the matching purpose is granted. It
accepts only external HTTPS scripts with `afterInteractive` or `lazyOnload`
strategies.

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

The consuming application may map the returned descriptors to `next/script`.
The adapter implementation should be imported only when the site has the
integration enabled. A site without analytics configuration always returns an
empty list without invoking provider code.

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
