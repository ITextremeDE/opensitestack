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
| AVAL | `73b1d74da561bcf2dfbef122c053a4eb3a59fc0b` | 16 Python tests, 159 unit tests, lint, type checks, production build, 5 Chromium smokes, and audit passed |
| ITextreme | `07a57041c836cc4ab95dfffb06c49b86e42c2e02` | content checks, 10 unit tests, lint, type checks, 168-page production build, 11 Chromium tests, and audit passed |
| Jürgen Schadek/JARON | `b94b949abfd0bc591076c2b1750806f620043c6c` | 4 unit tests, lint, type checks, 27-page production build, 7 Chromium tests, and audit passed |

All three commits install the exact registry version, passed GitHub `Quality`,
and are deployed. The complete production monitor and live browser verification
across the 13 concrete production hosts passed after deployment.
