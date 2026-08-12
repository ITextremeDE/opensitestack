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
