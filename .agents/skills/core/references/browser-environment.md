# Browser Environment Model

Node3D core creates a practical browser-like environment inside Node.js for desktop 3D applications.

## Core Responsibilities

`@node-3d/core` coordinates:

- initialization through `init(...)`,
- creation of the first `Document`,
- assignment of browser-like globals such as `globalThis.document` and `globalThis.window`,
- animation loop helpers,
- Three.js helper patching,
- re-exports of common primitives and lower-level packages.

`@node-3d/glfw` provides window/document behavior. `@node-3d/webgl` provides WebGL/OpenGL bindings. `@node-3d/image` provides browser-like image loading support.

## Philosophy

Implement enough browser compatibility for graphics libraries and real applications, but do not pretend to be a complete browser. Add APIs because real examples or libraries need them.

## Important Behaviors

- `init()` is cached; repeated calls return the first result rather than creating another document.
- `Document` inherits window behavior and adds web-document compatibility tricks.
- `Window` manages native windows and events.
- `requestAnimationFrame`/loop behavior must align with rendering expectations.
- Context changes can require resource or renderer recreation.

## Adding Compatibility

When adding browser-like behavior:

1. Identify the library or example that needs it.
2. Trace the exact property/method/semantic it expects.
3. Implement the smallest coherent surface.
4. Add tests or examples that cover the behavior.
