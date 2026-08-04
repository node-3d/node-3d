# 0001 - Package Naming Policy

## Status

Accepted.

## Context

Node3D is published as a coordinated ecosystem of packages under the
`@node-3d/*` scope. The root repository uses npm workspaces and Git submodules,
while each package under `packages/` is also a standalone repository.

Older unscoped package names existed before the scoped ecosystem shape was
standardized. Keeping both names active would make support, install guidance,
and dependency resolution less predictable.

## Decision

Use scoped package names under `@node-3d/*` for active packages.

Package repository names should match the package name without the scope. For
example, `@node-3d/core` lives in `node-3d/core`, and `@node-3d/deps-opengl`
lives in `node-3d/deps-opengl`.

Package metadata should point users back to the ecosystem:

- `license: MIT` for Node3D package code.
- `bugs` points to the root `node-3d` issue tracker.
- `homepage` points to the root `node-3d` README.
- `repository` points to the package-specific repository.
- `publishConfig.access` is `public` for scoped public packages.

Deprecated old package names should point users to the new scoped names with
`npm deprecate <old-name> "<message>"` after the replacement package is
available.

## Consequences

Scoped names make package ownership and ecosystem membership explicit.

Standalone package repositories remain easy to discover because repository names
match the unscoped package suffix.

Maintainers must keep package manifests aligned across the root workspace and
standalone package repositories.
