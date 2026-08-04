# 0004 - Native Addon Lifecycle Policy

## Status

Accepted.

## Context

Native addon packages publish generated TypeScript output in `dist/`, but
`dist/` is generated and should not be committed to source repositories.

The previous `prepare` lifecycle approach can run during local or workspace
install scenarios. In a workspace, that can cause one package to rebuild while
another package is consuming its generated declarations.

Native packages also use root-level install scripts for postinstall behavior,
such as downloading prebuilt binaries.

## Decision

Use `prepack`, not `prepare`, for packages that need to build `dist/` before
packing or publishing.

Keep install lifecycle code in a root-level `install.js`. Do not pull
postinstall behavior into the library TypeScript graph.

Use shared `@node-3d/addon-tools` helpers for normal package install/download
work where practical. Release-asset downloads should retry transient failures
three total times, with waits after the first failures.

Build generated artifacts before `npm pack` or `npm publish`, include generated
publish artifacts through the package `files` allowlist, and keep generated
outputs ignored in Git.

## Consequences

`prepack` builds happen at the point where publish artifacts are required,
without triggering unexpected workspace rebuilds during install.

Keeping install scripts outside the library source graph keeps public TypeScript
exports focused on runtime APIs.

Download retries reduce transient CI and postinstall failures for binary
packages.
