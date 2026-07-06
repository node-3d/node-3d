# Plugin Package Model

Node3D plugin packages are high-level packages that compose core primitives with addon capabilities.

Examples include:

- `@node-3d/plugin-bullet`: physics integration.
- `@node-3d/plugin-qml`: QML graphics and overlay integration.
- `@node-3d/plugin-webaudio`: audio integration.

## Role

A plugin should:

- accept or create the relevant core context,
- compose lower-level packages into a coherent workflow,
- expose ergonomic classes/functions for common use,
- keep lower-level escape hatches available when needed,
- provide examples close to real applications.

## API Design

Prefer explicit initialization that shows dependencies:

```ts
const { doc, gl } = init({ isGles3: true, isWebGL2: true });
const plugin = initPlugin({ doc, gl, three });
```

Avoid hidden global assumptions unless they match core's documented environment setup.

## Verification

Plugin tests and examples should cover integration behavior:

- resource lifecycle,
- render loop interaction,
- event forwarding,
- context or mode changes,
- compatibility with Three.js/core where relevant.
