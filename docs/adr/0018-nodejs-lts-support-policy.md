# 0018 - Node.js LTS support policy

## Status

Accepted.

## Context

Node3D packages previously required Node.js 24 even though their TypeScript
examples and runtime code also work on Node.js 22.18.0. That unnecessarily
excludes established projects on the still-supported older LTS line.

The project needs a single policy for package engines, CI coverage, and
Node-major-sensitive native binary release lines. It also needs a consistent
development runtime and ambient Node.js type surface across the root and every
package. Supporting an upstream end-of-life runtime would create a security and
maintenance commitment that Node3D cannot sustain.

## Decision

All Node3D packages require Node.js `>=22.18.0` and npm `>=10.9.0`.
Node.js 22.18.0 is the baseline because it can execute TypeScript files without
an experimental command-line flag.

Node3D supports LTS lines only:

- support the oldest upstream-supported LTS line as the baseline;
- continue supporting older LTS lines until their upstream end-of-life date;
- add the next even-numbered LTS line before or when it reaches LTS;
- do not support odd-numbered, non-LTS releases, even if a semver engine range
  permits installation;
- do not support upstream end-of-life Node.js releases.

The root development environment and all package development dependencies track
the upstream **Active LTS** Node.js major. Every `@types/node` development
dependency uses the latest release for that same major, pinned exactly under
[ADR 0021](0021-internal-and-external-dependency-ranges.md). When upstream moves
Active LTS to a new even-numbered major, Node3D updates the development runtime,
`@types/node`, and applicable CI defaults as one coordinated change. This does
not by itself raise the published package engine baseline or end support for an
older upstream-supported LTS line.

The current development and ambient-type major is Node.js 24.

Repository-authored files executed by Node.js use TypeScript. This includes
package sources, tests, examples, consumer fixtures, build utilities, and CI
helper scripts. Do not add authored `.js`, `.mjs`, or `.cjs` files except for
the two narrow published-package entrypoints below:

- A package-root `install.js` used by the npm `postinstall` lifecycle. npm must
  be able to execute that file directly from the installed package before any
  package-specific TypeScript build or bundle exists.
- A package-root `index.js` in a `deps-*` package when it is the package's
  minimal published runtime entrypoint. Node.js cannot use an untranspiled
  TypeScript file directly as an installed npm package entrypoint, while these
  dependency packages only need a thin `getPaths()`-style export. Introducing
  a TypeScript build and bundler for that deliberately small role has no
  practical benefit.

The dependency-package `index.js` exception is limited to a trivial path or
metadata adapter. If an entrypoint becomes substantially more complex, reassess
it as TypeScript source with generated publish output instead of expanding the
authored JavaScript exception. Tests, fixtures, build utilities, and maintenance
scripts in dependency packages remain TypeScript: they execute directly from
the repository and are not published package entrypoints, so the npm entrypoint
constraint does not apply. Node3D does not maintain parallel authored
JavaScript helper files for TypeScript sources.

Core and `uv-loop` provide the cross-version runtime CI anchors for the
currently supported and next-LTS Node 22, Node 24, and Node 26 lines. Other
packages inherit that runtime baseline unless a package has a
Node-major-specific dependency.

For Node-major-sensitive binaries, this policy refines
[ADR 0011](0011-node-major-binary-release-lines.md): release archives are built
for supported and next-LTS even major lines, not for end-of-life Node 20.

## Consequences

Every published manifest and repository-only example manifest keeps the same
Node/npm engine baseline. Package patch releases carry this metadata change.

The normal recommended runtime remains the current LTS release. Consumers on
Node 22 can adopt Node3D without a Node 24 migration, while consumers on Node
20 must upgrade their unsupported runtime first.

Repository builds and editor type checking consistently use the Active LTS API
surface instead of accidentally adopting types from the newer Current release.

Tests, examples, fixtures, and maintenance scripts execute their `.ts` files
directly on the supported Node.js runtime, avoiding parallel JavaScript module
conventions and unnecessary per-package script bundling. Minimal published
`deps-*` entrypoints remain direct `index.js` files until their complexity
justifies a TypeScript build step.
