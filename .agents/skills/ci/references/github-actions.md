# GitHub Actions Patterns

Node3D packages are standalone repositories and workspace packages. Workflow changes should make sense in the package repository by itself.

## Common Jobs

Typical package workflows:

- lint: install without scripts when needed, then run `npm run lint:all`
- test: run portable tests; avoid requiring unavailable native resources
- cpplint: copy/use shared addon-tools config and run C++ lint
- build: build TS bundle or native binary where infrastructure supports it
- publish: publish package with the package's established release pattern

## Install Mode

Use `npm ci` for normal package CI when postinstall is safe.

Use `npm ci --ignore-scripts` when:

- the package postinstall downloads prebuilt binaries,
- native binary availability is irrelevant to the check,
- a GPU/runtime/toolchain is not available,
- the workflow is metadata, lint, or pure TypeScript only.

## Consistency

Before adding a workflow, compare similar packages. Keep:

- workflow names,
- triggers,
- Node version setup,
- npm command names,
- cache strategy,
- publish permissions,
- package manager usage,
- artifact naming,
- platform matrices

aligned unless the package has a real difference.

## Reusable Actions

Future Node3D-specific reusable actions should encode common package patterns without assuming root-workspace-only paths. They should work from a standalone package repository checkout.
