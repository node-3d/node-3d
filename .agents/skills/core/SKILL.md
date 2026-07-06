---
name: core
description: Work on Node3D core browser, DOM, canvas, WebGL, and Three.js compatibility. Use for @node-3d/core, browser-like environment setup, Document/Window/Canvas behavior, global object wiring, raw WebGL support, Three.js helper compatibility, resource/context management, and the philosophy of Node.js desktop 3D with real OpenGL.
---

# Core

Use this skill for the central Node3D runtime environment: making Node.js feel enough like a browser/WebGL environment for 3D libraries while keeping direct access to native graphics resources.

## Workflow

1. Inspect `@node-3d/core` together with `@node-3d/glfw`, `@node-3d/webgl`, and `@node-3d/image` when environment behavior crosses package boundaries.
2. Preserve the core philosophy: browser/WebGL compatibility as a base, real native OpenGL as the backend, and explicit extension points for non-browser capabilities.
3. Keep Three.js compatibility practical and source-backed. Check examples and current helper implementations before changing behavior.
4. Treat globals such as `document`, `window`, canvas-like objects, image loading, animation loops, and context recreation as one coherent environment.
5. When adding compatibility for another web library, identify the exact browser APIs it probes instead of overbuilding generic DOM features.

## References

- Read [browser-environment.md](references/browser-environment.md) for the Document/Window/global compatibility model.
- Read [webgl-three.md](references/webgl-three.md) for WebGL, Three.js, context, and raw GL compatibility guidance.
