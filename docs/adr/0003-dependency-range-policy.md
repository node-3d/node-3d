# 0003 - Dependency Range Policy

## Status

Accepted.

## Context

Node3D packages are released independently, but they form a tightly related
ecosystem. Some dependencies affect consumers at runtime, while development
tooling is controlled by package manifests and lockfiles.

The project needs patch updates to flow without forcing every dependent package
to republish, while keeping minor compatibility changes explicit.

## Decision

Use `~` ranges for runtime dependencies between Node3D packages.

Runtime `~` ranges allow patch updates to flow while requiring an explicit
manifest update for minor changes.

Pin development dependencies exactly. Development dependencies do not affect
consumer installation and should be controlled by repository lockfiles.

Use peer dependency ranges to describe compatibility. For example:

- `three: ">=0.174.0 <1"`
- optional peers for explicit opt-in testing helpers such as `pixelmatch`

Keep `tslib` as a direct dependency where emitted code needs it, pinned to
`2.8.1`.

## Consequences

Patch-level fixes can propagate through the ecosystem with less republishing
work.

Minor compatibility changes remain visible in package manifests and release
planning.

Exact dev dependency pins keep tooling behavior reproducible across standalone
package repositories and the root workspace.
