# Node3D Agent Guidance

This root repository coordinates the `@node-3d/*` package ecosystem through npm
workspaces and Git submodules under `packages/`.

## Always

- Treat every workspace package under `packages/` as both a root workspace
  package and a standalone repository.
- Preserve unrelated dirty work in the root repo and package submodules.
- Do not commit, push, publish, tag, or create release artifacts unless
  the user explicitly asks.
- On Windows-native Codex sessions, use `npm.cmd` instead of bare `npm`.
- Keep package-level Node.js and npm engine metadata aligned with the root
  `engines` field.
- Keep examples repository-only. Do not include package `examples/` trees in
  npm `files`, `dist/`, package tarballs, or runtime dependencies.
- Treat `dist/`, `.rslib/`, package tarballs, native build folders, and
  generated `.clang-format` files as generated output. Do not edit or commit
  them as source.

## Package Families

- Core and foundation packages: `core`, `addon-tools`, `glfw`, `image`,
  `segfault`, `webgl`.
- Plugin packages: `plugin-bullet`, `plugin-qml`, `plugin-webaudio`.
- Native addons: `glfw`, `image`, `segfault`, `webgl`, `bullet`, `cuda`,
  `iohook`, `opencl`, `qml`, `steam-api`, `uv-loop`, `webaudio`.
- Dependency packages: `deps-bullet`, `deps-freeimage`, `deps-labsound`,
  `deps-opengl`, `deps-qmlui`, `deps-qt-core`, `deps-qt-gui`,
  `deps-qt-qml`, `deps-uiohook`.
- QML helpers: `qml-fontawesome`, `qml-colorhelpers`, `qml-themedui`.
  Keep QML import paths, asset layout, examples, and QML type names aligned; those
  are the public contract for QML helper packages.

## Contract-Changing Work

- For high contract-change risk work, refer to `docs/contract-workflow.md`.
  Avoid desynchronizing public contracts: public exports, native binding behavior,
  install/binary/package layout, supported examples, platform/runtime claims,
  CI validation meaning, release policy, or cross-package conventions.
- Examples are source-repository contract, not npm package content. Publish
  review should fail if examples appear in a package tarball unless a future
  ADR supersedes `docs/adr/0016-repository-only-examples.md`.
- Do not load it for routine docs edits, examples, tests, CI cleanup, or
  internal refactors when the public contract is unchanged.
- Report validation at the exact level performed; do not imply that type checks
  validate native runtime, rendering, audio, compute, or input behavior.

## Skill Routing

- `$core` - `@node-3d/core`, browser-like environment behavior,
  Document/Window/canvas behavior, WebGL/Three.js compatibility, runtime globals,
  context management, and resource behavior.
- `$native-addons` - C++ addons, addon-tools macros, `binding.gyp`,
  `common.gypi`, `install.js`, binary loading, `ts/native.ts`, pointer/handle
  modeling, and native contract verification.
- `$deps` - `deps-*` packages, third-party binaries/headers, path helper
  contracts, license/provenance notes, and install behavior.
- `$plugins` - high-level packages that compose lower-level packages or
  expose browser-like, multimedia, QML, audio, physics, or integration APIs.
- `$compute` - CUDA, OpenCL, GLSL render-to-texture compute,
  GL/CUDA/GL/OpenCL interop, GPU data layout, kernels, and compute examples.
- `$docs` - package READMEs, API sections, usage snippets, package role
  descriptions, and docs synchronized with exports and examples.
- `$examples` - runnable examples, package self-imports, consumer-style
  workflows, feature demos, assets, screenshots, and README snippets derived
  from examples.
- `$tests` - node:test coverage, native-load tests, runtime tests,
  visual/offscreen tests, skipped hardware-dependent tests, and validation
  strategy.
- `$ci` - GitHub Actions, reusable actions, lint/test/build jobs,
  matrices, native addon CI, GPU/platform limits, and CI package consistency.
- `$publishing` - pack contents, package metadata, release readiness,
  submodule/root safety, native binary tags, npm publish boundaries, and
  publish-prep work.

## Commands

Prefer package workspace commands for focused work and root commands for broad
checks:

```powershell
npm.cmd --workspace @node-3d/package-name run build:ci
npm.cmd --workspace @node-3d/package-name run test:ci
npm.cmd --workspace @node-3d/package-name run lint:all
npm.cmd --workspace @node-3d/package-name run format:ts:ci
npm.cmd --workspace @node-3d/package-name run format:src:ci
npm.cmd --workspace @node-3d/package-name run lint:gypi
npm.cmd pack --workspace @node-3d/package-name --dry-run
npm.cmd run build:ci
npm.cmd run packages:test
npm.cmd run lint:all
npm.cmd run format:ci
```

Use `--ignore-scripts` for metadata-only dependency work when native postinstall
scripts should not run.

## Durable Decisions

- Use ADRs in `docs/adr/` for durable decisions.
  Refer to `docs/adr/README.md` and keep it in sync with the folder content.
- Edit or add ADRs when changing global policies.
  Package READMEs, or transient notes are not sufficient for durable project policies.
