# README Structure

Node3D package READMEs should be practical package docs.

## Suggested Sections

Use the sections that fit the package:

- package title and one-line role,
- Node3D ecosystem note,
- install command,
- key capabilities,
- runnable example,
- API overview,
- examples link/list,
- native/binary/install note when applicable,
- OpenGL/WebGL/Three.js/QML/audio/physics notes when applicable,
- third-party license/provenance notes for `deps-*` packages,
- contribution or issue guidance when needed.

## Tone

Keep README text direct and concrete. Explain what the package enables and how to use it.

Preserve Node3D's central positioning:

- desktop 3D applications with Node.js and real OpenGL,
- WebGL-like and Three.js-compatible interfaces,
- direct native addon interoperability,
- access to resource IDs for compute interop,
- lightweight alternative to browser shells for JS graphics work.

## Package-specific Notes

- Native addon docs should mention prebuilt binaries and whether install compiles.
- `deps-*` docs should identify third-party software and license constraints.
- Plugin docs should show how the plugin composes `@node-3d/core` with addon-level capabilities.
- Core docs should explain the browser-like environment and Three.js helpers.
