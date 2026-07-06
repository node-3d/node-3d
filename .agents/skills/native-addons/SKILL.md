---
name: native-addons
description: Work on Node3D native addon packages and N-API binding surfaces. Use for C++ addon production, addon-tools macros, binding.gyp/common.gypi, install.js, binary loading, ts/native.ts typing, pointer and handle modeling, native package scripts, or native addon verification in packages such as glfw, image, webgl, segfault, bullet, cuda, opencl, qml, iohook, and webaudio.
---

# Native Addons

Use this skill to produce and maintain typed, safe, standalone-capable Node3D addons.

## Workflow

1. Identify the package family and current shape. Native addons usually have `src/`, `ts/`, `examples/`, `install.js`, `binding.gyp`, `common.gypi`, Rslib, Oxlint, and tsgo.
2. For binding work, inspect C++ exports before editing TypeScript. Trace `DBG_EXPORT JS_METHOD(...)`, addon-tools `_ARG` macros, `RET_*` macros, object construction, and package-local helper macros.
3. Keep `ts/native.ts` as the narrow adapter from the `.node` binary to a precise `TNative` surface.
4. Prefer safe native contracts: validate external inputs, check buffer lengths, represent true opaque native pointers as branded objects when JS should not do arithmetic, and make async/event paths tolerant of destroyed objects.
5. Verify with the package's focused native checks before broad workspace checks.

## References

- Read [addon-shape.md](references/addon-shape.md) for package layout, build scripts, Rslib, and install script conventions.
- Read [native-typing.md](references/native-typing.md) when editing `ts/native.ts` or translating C++ bindings to TypeScript.
- Read [cpp-binding-rules.md](references/cpp-binding-rules.md) when editing C++ binding code or addon-tools wrappers.
