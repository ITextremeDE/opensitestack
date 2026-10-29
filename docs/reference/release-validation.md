# Release validation

Run the reproducible package gate from a clean checkout with each supported Node.js major (24 and 26) and the
repository-declared pnpm version:

```bash
pnpm install --frozen-lockfile
pnpm release:check
```

Install pnpm 11.21.0 explicitly if necessary; Node 26 does not bundle Corepack.

The gate runs lint, unit tests, documentation-link validation, package and
reference-application builds, type checks, the dependency audit, and a dry-run
of the public tarball. Review the printed tarball contents before publishing.

Validate the packed tarball in the affected reference consumers before every
publication. Install the tarball without committing its temporary package and
lockfile changes. Each selected consumer must run its complete `pnpm check` and
`pnpm audit --audit-level=low`.

Use this impact matrix as the minimum gate:

| Changed package area | Required reference consumers |
| --- | --- |
| Consent manager or analytics runtime | AVAL, ITextreme |
| Registry, content, publication, SEO, themes, components, or Next.js adapters | AVAL, ITextreme, Jürgen Schadek/JARON |
| Markdown adapter | AVAL plus every consumer importing `opensitestack/markdown` |
| Package metadata, exports, peers, or build output | AVAL, ITextreme, Jürgen Schadek/JARON |

If a diff crosses multiple rows, use the union of their consumers. For a major
release, always validate all three. Record intentional Next.js minor
differences against the [compatibility matrix](compatibility.md); do not add
test aliases or private package entry points to hide them.

For each consumer, record the tested tarball filename, package version, commit,
Node.js and pnpm versions, commands, and result in the release evidence. A
consumer failure blocks publication until fixed or explicitly removed from the
supported matrix.

The current candidate evidence is recorded in
[OpenSiteStack 1.0.4 release evidence](release-evidence-1.0.4.md).
Earlier release evidence remains a historical record of that release.

Review production dependency licenses with `pnpm licenses list --prod` and
investigate any package without a recognized license before release.

## Publish

1. Confirm versions, changelog date, clean release diff, and consumer evidence.
2. Commit and push the validated source.
3. Publish the exact inspected archive from `packages/opensitestack` with public
   access. Download the registry archive and compare its integrity with the
   tested candidate; a metadata response alone does not prove installability.
4. Create the matching signed or annotated Git tag and GitHub release.
5. Install the exact registry version in each selected consumer and rerun its
   checks before deployment.

## Roll back

npm versions and Git tags are immutable. If publication is defective, restore
consumers to their previous lockfiles and publish a corrected patch version; do
not overwrite or silently retag the release.

## Repository-only quality changes

For changes confined to repository tooling, documentation and `examples/basic`,
run `pnpm check`, `pnpm test:browser` and `pnpm quality:budgets` on the Node 24/26
CI matrix. Review the complete diff and retain synthetic raw evidence. If the
published package files, exports and public contracts are unchanged, publish the
repository changes without inventing a new npm version or rolling consumers.
A package change still follows the full tarball/consumer gate above.
