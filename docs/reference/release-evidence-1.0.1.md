# OpenSiteStack 1.0.1 release evidence

- Status: local candidate validated; not published
- Date: 2026-08-25
- Source base commit: `3c1a1cef3092583be2d1532a5c8fd48a48337aa1`
- Package: `opensitestack-1.0.1.tgz`
- SHA-256: `0e0cad1d50c12061484b82a82cd65865f25dc3c55b0f9dfe034104f93ec967fb`
- Runtime: Node.js 24.18.1, pnpm 11.21.0

The tarball contains the 1.0.1 release diff on top of the source base commit.
Its checksum is the candidate identity until the release changes are committed.

## Package gate

`corepack pnpm release:check` passed: lint, 71 unit tests, documentation
validation, package and example builds, type checks, low-level dependency audit,
and tarball dry-run. No known vulnerability was reported.

## Consumer gate

Each consumer installed the exact candidate tarball in an isolated local clone,
then ran its complete quality chain and `pnpm audit --audit-level=low`.

| Consumer | Commit | Result |
| --- | --- | --- |
| AVAL | `5778d022644e9ba9d97d98d43d5c33bb5cb2dc7c` plus the local hardening diff | 16 Python tests, 159 unit tests, lint, type checks, production build, 5 Chromium smokes, and audit passed |
| ITextreme | `3c9c2c993b845d7942701c50601b81932f8936e9` | content checks, 10 unit tests, lint, type checks, 168-page production build, 11 Chromium tests, and audit passed |
| Jürgen Schadek/JARON | `3b3f6f0ff516d95159a73a715de88a3032e9faef` | 4 unit tests, lint, type checks, 27-page production build, 7 Chromium tests, and audit passed |

No consumer package or lockfile change from this temporary validation is part
of the release diff. Registry installation, deployment, production verification,
tagging, and publication remain pending external release steps.
