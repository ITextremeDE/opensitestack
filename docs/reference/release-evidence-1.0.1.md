# OpenSiteStack 1.0.1 release evidence

- Status: published and deployed to all reference consumers
- Date: 2026-08-25
- Release commit: `f7e43018808a882835e4f1541a67545b1fee61a9`
- Package: `opensitestack-1.0.1.tgz`
- SHA-256: `0e0cad1d50c12061484b82a82cd65865f25dc3c55b0f9dfe034104f93ec967fb`
- npm integrity: `sha512-1zOqnoil4g4HIv0YQQSn3X9CF3PjtC8m5dDiSpc4db7Ww1VhokqHZuUd/n83ecUqVIu5iEpU9JHIApASHjcPuw==`
- Runtime: Node.js 24.18.1, pnpm 11.21.0

The npm registry exposes 1.0.1 as `latest`. Annotated tag `v1.0.1` and the
non-draft GitHub release both identify the published source release.

## Package gate

`corepack pnpm release:check` passed: lint, 71 unit tests, documentation
validation, package and example builds, type checks, low-level dependency audit,
and tarball dry-run. No known vulnerability was reported.

## Consumer gate

Each consumer installed the exact candidate tarball in an isolated local clone,
then ran its complete quality chain and `pnpm audit --audit-level=low`.

| Consumer | Commit | Result |
| --- | --- | --- |
| AVAL | `dcb49324d3ef51627b14ba7a544defc435447dc2` | 16 Python tests, 159 unit tests, lint, type checks, production build, 5 Chromium/Axe smokes without exclusions, and audit passed |
| ITextreme | `07a57041c836cc4ab95dfffb06c49b86e42c2e02` | content checks, 10 unit tests, lint, type checks, 168-page production build, 11 Chromium tests, and audit passed |
| Jürgen Schadek/JARON | `3fe7ff2a12389d0345db1cf6184712fca13d910f` | 4 unit tests, lint, type checks, 27-page production build, 7 Chromium tests, and audit passed |

All three commits install the exact registry version, passed GitHub `Quality`,
and are deployed. AVAL and Jürgen/JARON enforce their previously observed CSP;
AVAL additionally uses the isolated shared Valkey rate-limit store from
infrastructure commit `ef319639324a892e7e4393175d6aff300bacac1f`.

The complete production monitor passed after deployment, including DNS, TLS,
redirects, enforced CSP, the protected download, the deployment control plane,
the configured rate-limit secret, Valkey health, and the absence of a published
Valkey port. The live browser verification loaded each of the 13 concrete
production hosts three times, confirmed rendered main content and styles, and
reported no console warnings or errors. Consent rejection and the AVAL primary
navigation were also exercised successfully.
