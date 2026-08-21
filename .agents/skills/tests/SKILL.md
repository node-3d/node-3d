---
name: tests
description: Add or maintain node:test, native-load/runtime, visual/offscreen, hardware-dependent, browser/WebGL/Three.js, and integration validation.
---

# Tests

## Owns

Executable validation and the meaning of test coverage.

## Workflow

1. Name the layer: pure TS, native adapter, native load, native runtime,
   rendering, plugin integration, or compute/hardware.
2. Use the package's established test/bootstrap shape and focused `node --test`
   scripts.
3. Skip unsupported native/hardware tests gracefully rather than converting them
   into misleading passes.
4. Centralize GLFW/core test windows through established helpers so CI-specific
   context/platform settings remain consistent.
5. For visual tests, require deterministic-enough output before adding baselines.
6. Report exactly what the test proves.
7. Skip only for a named environmental absence; native errors in an available
   environment are failures. Use child-process probes when initialization order
   makes an in-process test invalid.

## Load References

Load `.agents/references/ci-platform-limits.md` when platform runners, graphics
contexts, GPUs, or native runtime availability affect the test.

Add `$ci` only when workflow behavior itself changes.
