# Compatibility matrix

OpenSiteStack 1.x supports the following deliberately narrow platform matrix:

| Concern | Supported contract |
| --- | --- |
| Node.js | `^24.0.0 || ^26.0.0` |
| Package manager | pnpm `11.21.x` |
| Next.js | `>=16.0.0 <17` |
| React | `>=19.0.0 <20` |
| Router | Next.js App Router |
| Module system | ESM |

The core tests its package and reference application against Node.js 24 and 26,
Next.js 16.4, and React 19. Consuming repositories may use another supported
Next.js 16 minor after their own full `pnpm check` succeeds. The source workspace defaults to `.nvmrc` (Node 26.9.0); CI deliberately tests
both supported majors with the repository's `packageManager`. Node.js 25 is not
part of this matrix. The v1 public API remains stable. The 1.0.4 package
raises the Zod dependency floor to `^4.6.7`; consumers must validate their
resolved dependencies independently of this workspace lockfile.

OpenSiteStack owns no visual component library. Site repositories own their UI,
content, credentials, deployment, and provider SDKs, and must audit those
dependencies independently.
