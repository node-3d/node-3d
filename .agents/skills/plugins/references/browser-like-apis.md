# Browser-like and Multimedia APIs

Node3D's initial plugin motivation includes extending the core browser-like environment with web-style multimedia capabilities.

## Principles

- Match browser semantics where practical and valuable.
- Keep the implementation honest about native/runtime differences.
- Avoid broad DOM emulation unless a target library requires it.
- Prefer compatibility shims driven by actual library probes.
- Keep native resource access available for Node3D-specific power use cases.

## Candidate Areas

Plugins and high-level integrations may target:

- QML overlays and UI,
- WebAudio-like APIs,
- physics engines,
- image/media handling,
- input systems,
- browser framework compatibility,
- richer document/canvas/event behavior.

## Compatibility Work

When supporting a browser-oriented library:

1. Run or inspect the library's failing example.
2. Identify exact missing globals, methods, or semantics.
3. Add the smallest coherent compatibility surface.
4. Add an example or test that locks the behavior.
