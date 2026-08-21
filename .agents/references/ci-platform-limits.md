# CI Platform Limits

Load only when CI behavior depends on native execution, GPUs, graphics contexts,
or platform-specific binaries.

## Confidence Levels

TypeScript build/lint, C++ compile/lint, native binary load, native runtime,
rendering/readback, and hardware compute are distinct validations. Report them
separately.

## Hardware

GitHub-hosted runners must not be assumed to provide NVIDIA GPUs, CUDA runtime,
OpenCL devices/ICDs, display servers, or user-equivalent graphics drivers.
Separate portable checks from hardware-dependent checks; skip or isolate
unsupported runtime tests honestly.

## Workflow and Install Modes

Compare similar package workflows before adding a new pattern. Keep workflow
names, triggers, Node setup, npm commands, cache strategy, matrices, and
artifact naming aligned unless a package-specific constraint differs.

Use `npm ci` when postinstall behavior is required and safe. Use
`npm ci --ignore-scripts` for metadata, lint, pure TypeScript, or checks where
native download/build behavior is irrelevant or brittle. Do not add selective
dependency rebuilds to a native binary workflow without a documented blocker.

## Graphics CI

macOS:
- established headless OpenGL validation uses Mesa, GLFW `PLATFORM_NULL`,
  EGL/GLES surfaceless rendering, FBO rendering, and pixel readback;
- keep deployment target and runner image as separate concerns;
- keep the accepted macOS deployment baseline (currently Node 24-aligned
  `MACOSX_DEPLOYMENT_TARGET=13.5`) unless a contract decision changes it;
- when x64 Homebrew under `/usr/local` is required, clear conflicting Python
  symlinks and resolve unrelated Homebrew trust warnings before setup;
- prefer Node environment cleanup hooks over late `std::atexit()` GL teardown.

Linux:
- existing Xvfb/default GLFW paths may remain when already validated;
- centralize test-created windows through package bootstrap/helpers;
- preserve the established GLES/WebGL2 profile where context sharing requires it.

When initialization order matters, use a child-process probe: importing an
auto-initializing GLFW entry can make later platform selection invalid. A native
diagnostic (including `GLFW Error ...`) is a failure in an otherwise available
environment even if the probe process exits successfully.

Windows ARM:
- OpenGL may require Microsoft's OpenGL/OpenCL compatibility support rather than
  assuming native driver availability.

## Native Binary Baselines

Do not silently raise OS/glibc/toolchain baselines by choosing newer build
environments. Keep binary compatibility aligned with the project's accepted
Node.js/platform baseline and relevant ADRs.

Legacy C++ lint suppressions, when unavoidable, must be narrow and explicit.
