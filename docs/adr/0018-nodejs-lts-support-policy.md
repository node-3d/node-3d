# 0018 - Node.js LTS support policy

## Status

Accepted.

## Context

Node3D packages previously required Node.js 24 even though their TypeScript
examples and runtime code also work on Node.js 22.18.0. That unnecessarily
excludes established projects on the still-supported older LTS line.

The project needs a single policy for package engines, CI coverage, and
Node-major-sensitive native binary release lines. Supporting an upstream
end-of-life runtime would create a security and maintenance commitment that
Node3D cannot sustain.

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
