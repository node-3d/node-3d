# WebGL and Three.js Compatibility

Node3D exposes a WebGL-like API backed by real native OpenGL, not ANGLE.

## Three.js

`addThreeHelpers(three)` patches a Three.js module instance for Node3D-specific behavior, including file loading and texture/resource helpers.

`Screen` is the high-level Three.js helper. It manages camera, scene, renderer, document/canvas/context, input forwarding, and renderer recreation when window mode changes.

## Raw WebGL

Node3D should remain useful without Three.js. Preserve raw WebGL syntax support and direct access patterns for users writing lower-level GL code.

## Context and Resource Management

Because this is real OpenGL:

- resource IDs can matter,
- context sharing matters,
- fullscreen/window mode changes can affect renderer/context state,
- offscreen rendering is possible on supported platforms,
- direct interop with CUDA/OpenCL is a core differentiator.

## Compatibility Flags

`isGles3` requests a GL ES 3 style context and shader behavior closest to WebGL.

`isWebGL2` affects how browser-style libraries recognize WebGL version. It does not magically change all engine capabilities.
