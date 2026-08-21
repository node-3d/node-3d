---
name: core
description: Work on @node-3d/core browser-like runtime, Document/Window/canvas behavior, WebGL/Three.js compatibility, globals, context and resource behavior.
---

# Core

## Owns

`@node-3d/core` runtime behavior and compatibility semantics.

## Workflow

1. Inspect `core` with `glfw`, `webgl`, and `image` only when the behavior crosses
   those package boundaries.
2. Identify the exact browser/WebGL/Three.js behavior required by source,
   examples, tests, or upstream contracts.
3. Preserve the project model: practical browser compatibility over real native
   graphics resources, not a claim of complete browser emulation, with explicit
   escape hatches.
4. Treat globals, Document/Window/canvas, image loading, loops, contexts, and
   resource recreation as one environment.
5. Add focused tests/examples for public behavior and document intentional
   compatibility divergences.
6. Preserve `init()` caching, context-sharing assumptions, and documented
   renderer/resource recreation behavior unless the contract intentionally
   changes.

## Load References

Load `.agents/references/browser-runtime.md` for environment/context compatibility
work.

Use `$native-addons` as a secondary skill only if C++/native binding artifacts
are modified. Use `$tests`/`$examples`/`$docs` only when those owned artifacts are
also changed.
