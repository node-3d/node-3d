# Node3D Global Publish Batches

Use this checklist for a coordinated republish wave that starts with
`@node-3d/addon-tools` and propagates through every publishable workspace.

The ordering is derived from the internal `@node-3d/*` references in each
workspace `package.json`. It deliberately includes `dependencies`,
`devDependencies`, `optionalDependencies`, and `peerDependencies`. Dev
dependencies are ordering constraints because a package must be independently
installable, buildable, and testable against the newly published package set.

This document implements [ADR 0002](docs/adr/0002-package-publish-order.md).
Dependency range policy is defined by
[ADR 0021](docs/adr/0021-internal-and-external-dependency-ranges.md).

## How to use the batches

- Complete Batch 0 first, then work through the numbered batches in order.
- Packages within one batch have no dependencies on each other and may be
  prepared, validated, and published in parallel.
- Do not start registry-backed validation or publication of a batch until every
  package in all earlier batches is available at its intended version on npm.
- After each publish, verify the exact version with an online registry read:

  ```powershell
  npm view @node-3d/package@version version --registry=https://registry.npmjs.org/ --prefer-online --fetch-retries=0
  ```

- A root-workspace build is useful but is not a registry availability check.
  Each release candidate still needs its package-specific validation, dry-run
  pack inspection, and isolated packed-consumer gate.
- The human operator runs the authenticated `npm publish` command. Agents do
  not run npm operations that require authentication.
- Record package commits before updating the root superproject's submodule
  pointers. Update the root lockfile only when it is in scope for the wave.

The checkboxes are intentionally reusable. Copy this file or reset the boxes at
the start of a wave. In each package row, use the four boxes in this order:
**prepared**, **validated**, **published**, **registry verified**.

## Batch 0 - root of the wave

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/addon-tools` | None | [ ] [ ] [ ] [ ] |

## Batch 1 - direct foundations

All packages in this batch depend only on `@node-3d/addon-tools`.

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/deps-bullet` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-freeimage` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-gns` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-labsound` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-opengl` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-qt-core` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-uiohook` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/segfault` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |
| `@node-3d/uv-loop` | runtime: `addon-tools` | [ ] [ ] [ ] [ ] |

## Batch 2 - first native consumers

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/bullet` | runtime: `addon-tools`, `deps-bullet`, `segfault` | [ ] [ ] [ ] [ ] |
| `@node-3d/cuda` | runtime: `addon-tools`, `deps-opengl`, `segfault` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-qt-gui` | runtime: `addon-tools`, `deps-qt-core` | [ ] [ ] [ ] [ ] |
| `@node-3d/glfw` | runtime: `addon-tools`, `deps-opengl`, `segfault`, `uv-loop` | [ ] [ ] [ ] [ ] |
| `@node-3d/image` | runtime: `addon-tools`, `deps-freeimage`, `segfault` | [ ] [ ] [ ] [ ] |
| `@node-3d/iohook` | runtime: `addon-tools`, `deps-uiohook`, `segfault` | [ ] [ ] [ ] [ ] |
| `@node-3d/opencl` | runtime: `addon-tools`, `segfault` | [ ] [ ] [ ] [ ] |
| `@node-3d/webaudio` | runtime: `addon-tools`, `deps-labsound`, `segfault` | [ ] [ ] [ ] [ ] |

## Batch 3 - WebGL and Qt QML foundations

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/deps-qt-qml` | runtime: `addon-tools`, `deps-qt-gui` | [ ] [ ] [ ] [ ] |
| `@node-3d/webgl` | runtime: `addon-tools`, `deps-opengl`, `segfault`; dev: `glfw`, `image` | [ ] [ ] [ ] [ ] |

## Batch 4 - core runtime and QML UI dependencies

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/core` | runtime: `addon-tools`, `glfw`, `image`, `webgl`; dev: `cuda`, `opencl` | [ ] [ ] [ ] [ ] |
| `@node-3d/deps-qmlui` | runtime: `addon-tools`, `deps-qt-qml` | [ ] [ ] [ ] [ ] |

## Batch 5 - core consumers

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/gabenet` | runtime: `addon-tools`, `deps-gns`, `segfault`; dev: `core` | [ ] [ ] [ ] [ ] |
| `@node-3d/plugin-bullet` | runtime: `bullet`; dev: `addon-tools`, `core`, `glfw` | [ ] [ ] [ ] [ ] |
| `@node-3d/plugin-webaudio` | runtime: `webaudio`; dev: `addon-tools`, `core` | [ ] [ ] [ ] [ ] |
| `@node-3d/qml` | runtime: `addon-tools`, `deps-qmlui`, `segfault`; dev: `core` | [ ] [ ] [ ] [ ] |
| `@node-3d/steam-api` | runtime: `addon-tools`, `segfault`; dev: `core` | [ ] [ ] [ ] [ ] |

## Batch 6 - QML plugin

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/plugin-qml` | runtime: `qml`; dev: `addon-tools`, `core` | [ ] [ ] [ ] [ ] |

## Batch 7 - independent QML helpers

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/qml-colorhelpers` | dev: `addon-tools`, `core`, `plugin-qml` | [ ] [ ] [ ] [ ] |
| `@node-3d/qml-fontawesome` | dev: `addon-tools`, `core`, `plugin-qml` | [ ] [ ] [ ] [ ] |

## Batch 8 - themed QML UI

| Package | Direct internal prerequisites | Progress (P/V/P/R) |
| --- | --- | --- |
| `@node-3d/qml-themedui` | dev: `addon-tools`, `core`, `plugin-qml`, `qml-fontawesome` | [ ] [ ] [ ] [ ] |

## Graph maintenance

The root `package.json` workspace list and the workspace manifests are the source
of truth. Before each wave, inspect the current graph:

```powershell
npm run packages:graph
```

The batch of a package is one greater than the highest batch of any internal
prerequisite. A package with no internal prerequisite is in Batch 0. Equivalently,
an edge `A -> B` exists whenever package B names package A in any dependency
section; A must be published before B.

When a workspace or internal dependency edge is added, removed, or moved between
dependency sections:

1. Run `npm run packages:graph` and check for local range warnings.
2. Update the direct prerequisites in this document.
3. Recompute batches using all four dependency sections, including dev
   dependencies.
4. Confirm that the graph is acyclic and that every package intended for a
   global wave is reachable from `@node-3d/addon-tools`.

At the time this document was generated, the graph contained 31 publishable
workspaces, had no dependency cycles, and all 31 were reachable from
`@node-3d/addon-tools`.
