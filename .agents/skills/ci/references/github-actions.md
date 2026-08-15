# GitHub Actions Patterns

Node3D packages are standalone repositories and workspace packages. Workflow changes should make sense in the package repository by itself.

## Common Jobs

Typical package workflows:

- lint: install without scripts when needed, then run `npm run format:ts:ci`;
  native addons should also run `npm run format:src:ci`; then run
  `npm run lint:all`
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

Use plain `npm ci` for native addon binary build workflows by default. During a
new addon binary release, the package's own postinstall may try to download the
same release tag before the workflow has uploaded assets. Node3D's shared
`@node-3d/addon-tools` installer treats a missing archive as a logged
non-fatal install miss, and the following `npm run build:rebuild` step creates
the current binary. This common path also lets dependency packages run their
postinstall scripts normally, so their already-published binary inputs are
available to the addon build.

Use `npm ci --ignore-scripts` when:

- native binary availability is irrelevant to the check,
- a GPU/runtime/toolchain is not available,
- the workflow is metadata, lint, or pure TypeScript only.

Do not add a selective `npm rebuild @node-3d/...` dependency install step to a
native addon binary workflow unless the package has a documented blocker that
plain `npm ci` cannot handle.

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
