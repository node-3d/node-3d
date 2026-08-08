# Example Design

Node3D examples should act like small consumer programs,
not internal tests that bypass package contracts.

## Import Style

Use package self-imports:

```ts
import { init, Screen } from '@node-3d/core';
import { Window } from '@node-3d/glfw';
```

Avoid:

```ts
import { init } from '../dist/index.js';
import { init } from '../ts/index.ts';
```

Self-imports exercise `package.json` exports
and work in standalone clones through Node package self-reference behavior.

## Meaningful Coverage

Prefer examples that demonstrate real workflows:

- basic initialization and render loop,
- raw WebGL usage without a framework,
- Three.js compatibility,
- window/document/canvas behavior,
- image loading and texture use,
- plugin composition,
- QML overlays,
- WebAudio integration,
- physics integration,
- OpenCL/CUDA/OpenGL interop where environment allows,
- edge cases such as fullscreen/multiwindow/context recreation.

## Directory Layout

Use example directories to separate ownership:

- `examples/core/` contains Node3D-authored examples, diagnostics, package
  workflows, stress tests, and shared helpers.
- `examples/three/` contains examples copied or closely adapted from official
  Three.js examples.
- `examples/pixi/` contains examples copied or closely adapted from official
  Pixi examples.
- Future vendor integrations should get their own vendor directory, such as
  `examples/babylonjs/`, when examples are copied or adapted from that vendor.

Do not put Node3D-specific diagnostics or package-design probes in vendor
directories. Keep vendor examples close to upstream shape and add only the
Node3D environment glue needed to run them locally.

## Assets

Use `examples/assets/` for fixtures that are used in examples and tests.

## README Snippets

README examples should be runnable or closely derived from runnable examples.
Keep imports and API names synchronized with source.
