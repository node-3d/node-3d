# 0005 - macOS Headless OpenGL CI Strategy

## Status

Accepted.

## Context

Core and GLFW need real offscreen rendering in GitHub macOS CI. Native Cocoa
GLFW window creation can fail on macOS runners with:

```text
NSGL: Failed to find a suitable pixel format
```

The project needs CI coverage that proves a renderable OpenGL context exists
without requiring a visible display.

## Decision

Use Mesa surfaceless rendering for macOS headless OpenGL CI.

The established macOS CI path is:

- install Mesa with Homebrew;
- for macOS x64 jobs on ARM runners, use x86_64 Homebrew under `/usr/local`;
- expose Mesa EGL/GLES dylibs to the runtime;
- set the GLFW platform to `PLATFORM_NULL`;
- use EGL + OpenGL ES in surfaceless mode;
- render to an FBO and read pixels to prove the context is real.

GLFW tests should validate GLFW runtime behavior directly, including
initialization, context/window creation, rendering, and pixel readback. Core
tests should rely on that established runner setup instead of rediscovering
GLFW platform support.

For GLFW teardown, prefer Node environment cleanup hooks over process
`std::atexit()` cleanup. On macOS Mesa/EGL, `std::atexit()` cleanup can run too
late and emit:

```text
EGL: Failed to clear current context
```

Tests that run native rendering in child processes should fail if the child
emits native runtime errors such as `GLFW Error ...`, even when the child exits
successfully.

## Consequences

macOS CI can validate real offscreen rendering without relying on Cocoa window
creation.

The pixel readback requirement makes the test prove rendering capability rather
than merely proving that an initialization call returned.

The CI setup is more explicit and platform-specific, but failures are easier to
diagnose.
