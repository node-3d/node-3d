# Native Binding Typing

`ts/native.ts` is the typed adapter between JavaScript and the compiled `.node` binary. Keep it narrow, explicit, and derived from C++.

## Adapter Shape

Use `createRequire(import.meta.url)` to load the binary. Packages that use platform-specific binary folders usually also use `getBin()` from `@node-3d/addon-tools`.

The adapter should:

- declare local native export types,
- load the binary once,
- cast the loaded object to the precise native type,
- export the typed native object.

## Deriving TNative

Before declaring or changing `TNative`, inspect C++ exports:

- `DBG_EXPORT JS_METHOD(...)` names exported functions.
- addon-tools `_ARG` macros reveal positional argument names, expected types, and optionality.
- package-local helper macros may wrap argument extraction. Follow them.
- `RET_*` macros and explicit `Napi::*::New` calls reveal return types.
- If `RET_VALUE(...)` is unclear, inspect object or array construction immediately above it.

Type constants explicitly as numeric properties, usually with a literal union:

```ts
type TNative = TNativeMethods & Record<TConstantName, number>;
```

Use function-valued properties for exports intended to be detached and re-exported:

```ts
type TNative = {
  doSomething: (value: number) => string;
};
```

Use method syntax only when the JS `this` receiver is part of the contract.

## Handles

Use branded object handles for real native object pointers when JavaScript should treat them as opaque:

```ts
export type TWindowHandle = object & { readonly __glfwWindow: unique symbol };
```

Use `number` for platform handles, Vulkan handles, OpenGL handles, and values intentionally represented numerically.

## Avoid Escape Hatches

Do not use these for known native surfaces:

- `any`
- `Function`
- broad `Record<string, unknown>`
- `(...args: unknown[]) => unknown`

If an argument or return type is genuinely unresolved, document the specific C++ expression that made it unclear. Do not hide uncertainty behind a package-wide loose type.
