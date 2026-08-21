# Browser Runtime Reference

Load when changing `@node-3d/core`, Document/Window/canvas behavior, global
browser-like objects, animation scheduling, context recreation, WebGL, or
Three.js compatibility.

`@node-3d/core` coordinates the practical browser-like environment.
`@node-3d/glfw` owns window/document behavior, `@node-3d/webgl` provides
WebGL/OpenGL bindings, and `@node-3d/image` provides browser-like image loading.

## Model

- Implement enough browser compatibility for real graphics libraries and
  applications; do not emulate a complete browser without a demonstrated need.
- `init()` is cached; repeated calls use the first initialized environment.
- Document/Window behavior, globals, image loading, animation loops, context
  lifetime, and renderer/resource recreation form one coherent environment.
- Keep keyboard/event fields browser-compatible where practical.
- Context changes may require resource or renderer recreation.
- `addThreeHelpers(three)` patches a specific Three.js module instance; `Screen`
  coordinates the common scene/camera/renderer/document integration.
- Raw WebGL remains supported. `isGles3` requests GLES-like context/shader
  behavior; `isWebGL2` is a compatibility signal, not a capability upgrade.

## Compatibility Work

1. Identify the exact library/example probe.
2. Trace the specific property/method/semantic required.
3. Implement the smallest coherent surface.
4. Add a test or example that proves the behavior.
5. Document intentional browser/WebGL/Three.js divergence when public behavior
   differs.
