# GitHub Actions Patterns

Node3D packages are standalone repositories and workspace packages. Workflow changes should make sense in the package repository by itself.

## Common Jobs

Typical package workflows:

- lint: install without scripts when needed, then run `npm run lint:all`
- test: run portable tests; avoid requiring unavailable native resources
- cpplint: copy/use shared addon-tools config and run C++ lint
- build: build TS bundle or native binary where infrastructure supports it

Native window tests need explicit package-level bootstrap rules. Workflows may
use Xvfb, Mesa setup steps, or platform-specific defaults, but test code should
create GLFW/core windows through shared test helpers so extra documents do not
bypass CI-tuned visibility, context, and initialization-order requirements.

Dedicated publish workflows are intentionally not maintained. Package publishing
is local and agent-assisted through the publishing skill checklist.

## Install Mode

Use `npm ci` for normal package CI when postinstall is safe.

Use `npm ci --ignore-scripts` when:

- the package postinstall downloads prebuilt binaries,
- native binary availability is irrelevant to the check,
- a GPU/runtime/toolchain is not available,
- the workflow is metadata, lint, or pure TypeScript only.

## macOS Homebrew

When installing x64 Homebrew dependencies under `/usr/local` on macOS CI, clean
conflicting `/usr/local/bin/python*`, `pip*`, `idle*`, and `pydoc*` symlinks as
needed. Untap `aws/tap` if unrelated Homebrew trust warnings interfere with
package setup.

## Consistency

Before adding a workflow, compare similar packages. Keep:

- workflow names,
- triggers,
- Node version setup,
- npm command names,
- cache strategy,
- package manager usage,
- artifact naming,
- platform matrices,
- pinned Oxlint/Oxfmt versions

aligned unless the package has a real difference.

## Reusable Actions

Future Node3D-specific reusable actions should encode common package patterns without assuming root-workspace-only paths. They should work from a standalone package repository checkout.
