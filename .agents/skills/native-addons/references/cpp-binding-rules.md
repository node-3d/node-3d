# C++ Binding Rules

Node3D native addons use addon-tools conventions to reduce repetitive N-API code. Preserve those conventions unless a package has a clear local reason not to.

## General Rules

- Use addon-tools macros consistently for argument and return handling.
- Prefer `#pragma once` in headers.
- Validate all external inputs before dereferencing.
- Check image, buffer, and typed-array byte lengths before copying.
- Prefer owning containers such as `std::vector` over temporary raw allocations.
- Return `null` to JavaScript when native APIs return `nullptr` and absence is valid.
- Treat negative indexes the same as missing indexes when that matches the JavaScript API.
- Initialize all state fields explicitly.
- Make async event paths tolerant of objects that have been logically destroyed but may still be referenced by queued callbacks.

## Pointer-like Values

Prefer pointer-specific helpers when JavaScript does not need arithmetic or serialization.

Use `External` values for real opaque native pointers. Use numeric handles only when the API deliberately exposes numeric platform, Vulkan, OpenGL, or similar resource identifiers.

## ES5 Class Wrapping

`@node-3d/addon-tools` supports ES5-style class wrapping through `DECLARE_ES5_CLASS`, `IMPLEMENT_ES5_CLASS`, `JS_DECLARE_*`, `JS_ASSIGN_*`, and `JS_IMPLEMENT_*` macros.

Generated method/getter/setter trampolines validate and unwrap `this` before dispatching to the instance method. Detached invalid calls should fail as JS exceptions instead of crashing the process.

Use the generated `unwrap(obj)` helper only for lower-level manual probing. Normal wrapper methods should not need manual unwrap calls.

## common.gypi

Standalone clones must build without root-workspace-only paths. Native addons that need shared GYP settings should include a local `src/common.gypi` synchronized with `@node-3d/addon-tools/utils/common.gypi`.

Use:

```powershell
npm run lint:gypi --workspace @node-3d/package-name
```
