# 0021 - Internal and external dependency ranges

## Status

Accepted

## Context

Node3D packages are independently published but are maintained as one
ecosystem. The prior dependency-range policy used exact development dependency
pins, which made internal development dependencies inconsistent with internal
runtime dependencies and required needless manifest churn during coordinated
releases.

At the same time, external dependencies should be reproducible for both
published packages and standalone package development.

## Decision

For installed dependency sections (`dependencies`, `devDependencies`, and
`optionalDependencies`):

- Node3D packages (`@node-3d/*`) use `~` ranges in every section.
- External packages use exact versions in every section.

Peer dependency ranges remain compatibility declarations rather than installed
version selections. They may use a range when that accurately describes the
supported consumer surface.

Repository-only examples may use `file:` references to their local package
under test; those manifests are not publishable package metadata.

This supersedes ADR 0003.

## Consequences

Internal patch updates can flow through both runtime and development installs,
while internal minor updates remain explicit release decisions. External
dependency resolution is reproducible without relying on a range. Package and
root lockfiles continue to record the resolved dependency graph.
