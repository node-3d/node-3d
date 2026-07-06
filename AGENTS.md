# Node3D Agent Guidance

This repository coordinates the `@node-3d/*` package ecosystem
through npm workspaces and Git submodules under `packages/`.

- Agent skills live in this root repository, under `.agents/skills/`.
- Use the root `engines` field as the source of truth for Node.js and npm
  versions. Keep package-level engine metadata aligned with it.

## Repository Model

- Every workspace package under `packages/` is also a standalone repository.
  Changes that affect metadata, configs, or artifacts need to be valid in both
  contexts.
- The package families are:
    - core: the main consumer package. It is sufficient to run WebGL/Three.js code.
    - plugin packages: higher-level integrations that compose core/addon packages.
      E.g. provide Three.js primitives to easily display QML overlays.
    - native addons: implement Node.js bindings `glfw`, `image`,
      `segfault`, `webgl`, `bullet`, `cuda`, `opencl`, `qml`, `webaudio`.
    - addon-tools - currently the single source of all code/CI utils and rules.
    - dependencies `deps-*`: carry binaries, headers, and thin
      JS/type entrypoints.
    - QML helpers: QML utility packages such as
      `qml-fontawesome`, `qml-colorhelpers`, and `qml-themedui`.
- Each package family serves different needs. Packages within a family should
  follow the same conventions where practical, but implementation details can
  differ when the underlying technology requires it.

## Baseline Tooling

- JS stack: TypeScript, ESM, Rslib, TSGO, Oxlint, Oxfmt.
- On Windows-native Codex agent sessions, use `npm.cmd` instead of bare `npm`
  when running npm commands. The agent shell is PowerShell even when the visible
  integrated terminal uses Git Bash, and bare `npm` can resolve to `npm.ps1`
  and hit PowerShell execution-policy errors.
- Native addons: C++ 17, Node-API, node-addon-api.
- Prefer root workspace commands for broad checks, and package workspace
  commands for focused work:

```powershell
npm run packages:graph
npm run format:ci
npm run format:ci --workspaces --if-present
npm run lint:all
npm run packages:test
npm run build:ci
npm --workspace @node-3d/package-name run lint:all
npm --workspace @node-3d/package-name run test:ci
npm --workspace @node-3d/package-name run build:ci
```

## Package Shape

- `dist/` and `.rslib/` are generated output. Ignore them in Git and do not
  edit or commit them. They should be created by package builds and included in
  npm packages through each package's `files` allowlist.
- For TypeScript packages, publish one public JS entry and declaration entry
  through `dist/index.js` and `dist/index.d.ts`.
- Keep public APIs re-exported from `ts/index.ts`. Avoid package exports for
  internal modules unless there is a real standalone import use case.
- Prefer named imports and exports. Do not keep default exports only to preserve
  old CommonJS style.
- Examples should behave like consumer code. Import Node3D packages by package
  name, such as `@node-3d/core`, instead of reaching into `../dist` or `../ts`.
- TypeScript examples should run directly on the supported Node.js version.
  Include examples in normal type checking when appropriate, but exclude them
  from package build configs.
- Keep package install lifecycle scripts as root-level JS, usually `install.js`,
  instead of pulling lifecycle code into the library TypeScript graph.
- Keep `prepare` mapped to `npm run build:ci` for packages that publish
  generated `dist/`, but do not rely on committed `dist/` in GitHub source.
- Root workspace package-lock updates and standalone
  package-lock updates are different concerns.

## Native Addons

- Native addons have `src/` for `binding.gyp`, `common.gypi`, and
  C++ sources; `ts/` for library source and source-level tests; and `examples/`
  for TypeScript examples.
- Native addons have `ts/native.ts` adapters that load the `.node`
  binary with `createRequire(import.meta.url)` and exports a precisely typed
  native object.
- Trace C++ binding functions before typing `TNative`. Infer arguments from
  addon-tools `_ARG` macros and return shapes from `RET_*` macros or explicit
  `Napi::*::New` construction.
- Avoid `any`, `Function`, broad `Record<string, unknown>`, and
  `(...args: unknown[]) => unknown` for known native exports. If a native
  contract is unclear, document the exact unresolved C++ expression instead of
  hiding it behind a package-wide escape hatch.
- Prefer branded object handles for real native object pointers when JS should
  treat them as opaque. Use numbers for platform handles, Vulkan/OpenGL handles,
  and intentionally numeric native values.
- Keep local `src/common.gypi` synchronized with
  `@node-3d/addon-tools/utils/common.gypi`; use the package `lint:gypi` script.
- Use addon-tools macros consistently for argument validation and returns.
  Validate inputs before dereferencing, check buffer lengths before copying, and
  make async/event paths tolerant of logically destroyed objects.
- Do not assume CI has GPU hardware or special native toolchains. For CUDA/GPU
  packages, keep portable TS/lint checks separate from hardware-dependent tests
  unless a known runner path exists.

## Formatting, Linting, and Tests

Run narrow checks after a change in package code. Broaden when the
change touches shared tooling, package contracts, or multiple packages.

The expected verification set is:

```bash
npm run build:compile --workspace @node-3d/package-name
npm run build:ci --workspace @node-3d/package-name
npm run lint:gypi --workspace @node-3d/package-name
npm run lint:ts --workspace @node-3d/package-name
npm run lint:oxlint --workspace @node-3d/package-name
npm run test:ci --workspace @node-3d/package-name
npm pack --workspace @node-3d/package-name --dry-run
```

- For generated-package validation, confirm the built public entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```

- Use `--ignore-scripts` for metadata-only dependency work
  when native postinstall scripts should not run.
- Prefer fixing Oxlint and TypeScript violations over adding package-local
  suppressions. If a suppression is unavoidable, keep it narrow and explain the
  unclear native or runtime contract.

## Documentation and API Expectations

- Preserve the central Node3D value proposition: Node.js desktop 3D with real
  OpenGL, WebGL/Three.js compatibility, CUDA/OpenCL interoperability, and
  reusable package composition.
- Keep README examples current with the package contract.
- Ensure the generated declarations retain useful public JSDoc.
- Dependency package READMEs document third-party licensing and
  carried binaries/headers where relevant.

## Git and Release Hygiene

- Commit submodules separately when package contents change.
  Then commit root to update submodule pointers and any root files that changed.
- Do not push, publish, or create release artifacts unless the user explicitly
  asks for it.
- Before packaging or release-related conclusions, build first. Use
  `npm pack --dry-run` only when its output is inspected by a person or checked
  by tooling; it is not a substitute for building generated artifacts.
- Publish workflows that use `npm publish --ignore-scripts` must explicitly
  install dependencies and run `npm run build:ci` for TypeScript packages.
