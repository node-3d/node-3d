# Native Addon Reference

Load for native package shape, C++ binding organization, `ts/native.ts`, opaque
handles, install/build plumbing, or native input/lifetime safety.

## Typical Package Shape

```text
package-root/
  install.js
  package.json
  rslib.config.ts
  tsconfig*.json
  src/
    binding.gyp
    common.gypi
    cpp/
  ts/
    index.ts
    native.ts
    *.test.ts
  examples/
```

Keep packages usable both standalone and in the root workspace.

Public TS packages normally expose `dist/index.js` and `dist/index.d.ts` through
`main`, `types`, and `exports`. Keep public values re-exported from `ts/index.ts`.
Use `prepack`, not `prepare`, for generated publish output.

## Type Adapter

Use `createRequire(import.meta.url)` to load the `.node` binary once. Packages
with platform-specific binary folders normally obtain the location through
`getBin()` from `@node-3d/addon-tools`.

Derive `TNative` from C++ rather than loosening it: `DBG_EXPORT JS_METHOD(...)`
names exports; `_ARG` macros reveal inputs and optionality; `RET_*` macros and
the immediately preceding `Napi::*::New`/object construction reveal returns.
Use function-valued properties for exports that may be detached; use method
syntax only when `this` is contractual. Do not hide known native surfaces behind
`any`, `Function`, broad records, or catch-all argument signatures.

## Binding Rules

- Inspect C++ exports before editing `ts/native.ts`.
- Keep `ts/native.ts` a narrow typed adapter over the `.node` binary.
- Use addon-tools argument/return conventions consistently.
- Validate external inputs before dereferencing.
- Check buffer/image/typed-array byte lengths before copying.
- Prefer owning containers over temporary raw allocations.
- Return JS `null` when a valid native absence is represented by `nullptr`.
- Initialize state explicitly.
- Make queued async/event paths safe after logical destruction.
- Use opaque `External`/branded handles for true native pointers JS should not
  manipulate; use numbers only for intentionally numeric GL/Vulkan/platform IDs.

For non-trivial C++ surfaces, follow
`docs/adr/0015-native-addon-cpp-binding-organization.md`: keep `bindings.cpp` as
the module mount table and place implementation in responsibility-specific files.

Standalone builds must not depend on root-only GYP paths.
