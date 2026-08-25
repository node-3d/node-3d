# Repository Model

Load when a task crosses package boundaries, touches submodules/workspace state,
or needs family classification.

## Structure

The root is a superproject and npm workspace. Packages under `packages/` are
standalone repositories as well as root workspaces.

Preserve unrelated dirty work in both scopes.

When package content is committed, the package commit must exist before the root
superproject can record its new submodule pointer.

## Package Families

Core/foundation:
`core`, `addon-tools`, `glfw`, `image`, `segfault`, `webgl`.

Plugins:
`plugin-bullet`, `plugin-qml`, `plugin-webaudio`.

Native addons:
`glfw`, `image`, `segfault`, `webgl`, `bullet`, `cuda`, `iohook`, `opencl`,
`qml`, `steam-api`, `uv-loop`, `webaudio`.

Dependency packages:
`deps-bullet`, `deps-freeimage`, `deps-labsound`, `deps-opengl`, `deps-qmlui`,
`deps-qt-core`, `deps-qt-gui`, `deps-qt-qml`, `deps-uiohook`.

QML helpers:
`qml-fontawesome`, `qml-colorhelpers`, `qml-themedui`.

QML helper import paths, asset layout, examples, and QML type names are public
contract material.

## Generated/Repository-only Material

Generated output is not source:
`dist/`, `.rslib/`, `*.tgz`, native build folders, generated `.clang-format`.

Examples are repository-only and must not appear in npm package contents unless a
future ADR supersedes `docs/adr/0016-repository-only-examples.md`.

## Workspace Safety

Use focused package commands before broad root commands.

For metadata-only installs where native postinstall work is unnecessary, prefer
`--ignore-scripts`. Do not reuse that installation for native consumer
validation: package `postinstall` hooks install the binaries needed to build,
load, and run native addons. Use normal `npm ci` for that validation, and let
npm run each dependency installer from its own package directory rather than
calling an installed dependency's `install.js` from the consumer directory.

Standalone package lockfiles and the root workspace lockfile are separate
artifacts; update only the scopes actually affected by the task.

## Focused Commands

Prefer package checks before broad workspace checks:

```powershell
npm.cmd --workspace @node-3d/package-name run build:ci
npm.cmd --workspace @node-3d/package-name run test:ci
npm.cmd --workspace @node-3d/package-name run lint:all
npm.cmd --workspace @node-3d/package-name run format:ts:ci
npm.cmd --workspace @node-3d/package-name run format:src:ci
npm.cmd --workspace @node-3d/package-name run lint:gypi
npm.cmd pack --workspace @node-3d/package-name --dry-run
```

Broad checks include root `build:ci`, `packages:test`, `lint:all`, and
`format:ci`.
