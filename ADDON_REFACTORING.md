# Native Addon Refactoring Guide

This document captures the package shape proven by the `@node-3d/glfw` migration. Use it as the reference pattern when moving the other native addons to the new Node 24, ESM, TypeScript, Rslib, and Oxlint setup.

## Target Shape

Each addon should remain usable as a standalone repository, while also working as a package inside the `node-3d` workspace.

The intended package layout is:

```text
package-root/
  install.js
  oxlint.config.ts
  package.json
  rslib.config.ts
  tsconfig.json
  tsconfig.build.json
  src/
    binding.gyp
    common.gypi
    cpp/
      ...
  examples/
    *.ts
  ts/
    index.ts
    native.ts
    *.ts
    *.test.ts
```

`ts/` is for library source and source-level tests only. Examples live under `examples/` as TypeScript.
Package lifecycle plumbing stays outside it.

Delete stale source folders after migration. In particular, remove an old `js/`
directory once its contents have moved to `ts/`; do not leave an empty `js/`
folder behind.

If `test/` no longer contains tests after moving them into `ts/`, move any
remaining shared fixtures to the package that uses them, usually
`examples/assets/`, and delete the stale `test/` directory.

`dist/` is generated output. It should be ignored by Git, but included in the npm package.

## Package Contract

The package should publish one public JavaScript entry and one declaration entry:

```json
{
	"type": "module",
	"main": "dist/index.js",
	"types": "dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"default": "./dist/index.js"
		}
	},
	"files": [
		"dist",
		"install.js",
		"LICENSE",
		"package.json",
		"tsconfig.json"
	]
}
```

Avoid package exports for internal modules unless there is a real standalone import use case. Re-export public values from `ts/index.ts`.

Prefer named exports. Do not keep a default export just to preserve the old CommonJS shape during this overhaul.

## Rslib Build

Use a single `index` entry. Internal files should not appear as Rslib entries.

```ts
import { defineConfig } from '@rslib/core';

export default defineConfig({
	lib: [
		{
			format: 'esm',
			bundle: true,
			autoExtension: false,
			syntax: 'es2024',
			dts: {
				tsgo: true,
			},
			outBase: './ts',
			source: {
				entry: {
					index: './ts/index.ts',
				},
				tsconfigPath: './tsconfig.build.json',
			},
			output: {
				target: 'node',
				distPath: {
					root: './dist',
				},
			},
		},
	],
});
```

Important details:

- `bundle: true` is required if `dist/` should contain only the public runtime entry.
- Do not enable declaration bundling. Leave `dts.bundle` unset and use
  `dts.tsgo: true`. Declaration bundling is only cosmetic when it works, but it
  can silently drop global interface merges, module augmentations, and other
  package-visible type details.
- Do not add `@microsoft/api-extractor` for these packages. It is only needed
  for bundled declarations, which this migration intentionally avoids.
- The entry value should be a string, not an array.

Expected generated files after a clean build:

```text
dist/index.js
dist/index.d.ts
dist/*.d.ts
```

Unbundled declaration output may include one `.d.ts` file per source module.
This is expected. Keep `package.json` pointing consumers at `dist/index.d.ts`
and avoid package exports for internal modules unless there is a real standalone
import use case.

## Native Adapter

Every native addon package should have a `ts/native.ts` adapter with this shape:

```ts
import { createRequire } from 'node:module';

type TNative = {
	doSomething: (value: number) => string;
};

const loadAddon = createRequire(import.meta.url);

export const native = loadAddon('../src/build/Release/addon.node') as TNative;
```

Rules:

- Declare `type TNative = { ... }` locally from the C++ binding surface.
- Trace every exported C++ binding function before declaring `TNative`. For
  addon-tools bindings, infer positional argument names, optionality, and types
  from the `_ARG` macros used in the `DBG_EXPORT JS_METHOD(...)` body, including
  package-local helper macros such as `LET_ID_ARG`.
- Infer native return types from `RET_*` macros and explicit `Napi::*::New`
  return values. If a `RET_VALUE(...)` expression is not self-evident, inspect
  the object or array construction immediately above it and type that shape.
- Type addon-exported constants explicitly as numeric properties, either as
  named properties or a `Record<LiteralUnionOfExportedConstants, number>`.
- Prefer function-valued properties such as `doSomething: () => void` for native exports that are intended to be detached and re-exported as standalone functions. Use method syntax only when the JS `this` receiver is genuinely part of the contract.
- Load the `.node` binary with `createRequire(import.meta.url)`.
- Export the cast native object.
- Do not import local package types into `native.ts` unless they are simple shared data types that do not create dependency cycles.
- Do not leave known functions as `(...args: unknown[]) => unknown`, `Function`,
  `any`, or a broad `Record<string, unknown>`. Avoid open string fallback
  records for native packages with a known export list.
- Document any unresolved native argument or return in the migration notes with
  the C++ expression that made it unclear. Do not hide unresolved items behind a
  package-wide escape hatch.

For raw native pointers, prefer `External` values over numeric offsets when JavaScript does not need arithmetic or serialization. Model these in TypeScript with branded object types:

```ts
export type TWindowHandle = object & { readonly __glfwWindow: unique symbol };
export type THandle = number;
```

Use branded object handles for real native object pointers. Use `number` for platform handles, Vulkan handles, OpenGL handles, and other values that are intentionally represented numerically.

## TypeScript Sources

Move the old `index.d.ts` API documentation into the actual TS source files. The generated declaration files should preserve useful public JSDoc.

General source rules:

- Public API lives under `ts/`.
- Root legacy declaration files such as `index.d.ts` must be deleted once their useful comments and declarations have been migrated to TS source. The package must point TypeScript users at `dist/index.d.ts` only.
- Tests can live next to the tested files as `*.test.ts`.
- Examples live under `examples/` as `*.ts`; use package self-imports such as `import { value } from 'package-name'`.
- Do not import examples from `../dist/index.js` or `../ts/index.ts`. Self-imports exercise the package `exports` contract that consumers use and work in standalone clones through Node package self-reference resolution.
- Include `examples/**/*.ts` in the root `tsconfig.json` for type checking, but exclude examples from `tsconfig.build.json`.
- `install.js` stays at package root unless there is a concrete reason to build it.
- Prefer named imports and named exports.
- Use explicit public class members where the lint config requires it.
- Keep private fields and methods typed. Use `any` only when the native or dynamic contract is genuinely unclear and needs follow-up review.
- Remove package-local lint overrides and old suppression comments during migration. Fix `typescript/ban-ts-comment`, missing-type, and similar violations in source instead of disabling the shared rules. If a violation cannot be resolved safely, document the specific file, rule, and unclear native or runtime contract before keeping a narrowly scoped override.

Class organization used in GLFW:

1. constructor
2. readonly getters
3. get/set pairs
4. public fields
5. public methods
6. private fields
7. private methods

Private members should have short non-JSDoc comments when the field or helper is not self-explanatory.

## Install Script

Postinstall scripts should be plain Node-executable files:

```json
{
	"scripts": {
		"postinstall": "node install.js"
	}
}
```

The install script should only perform package install work, such as downloading prebuilt binaries. It should not be part of the library TS source graph.

Keeping `install.js` as root JS avoids requiring npm to execute raw TS and avoids shipping `ts/` just for lifecycle scripts.

## C++ Binding Rules

Use addon-tools macros consistently for argument and return handling.

For pointer-like addon objects, prefer pointer-specific helpers:

```cpp
#define THIS_WINDOW                                                        \
	NAPI_ENV;                                                               \
	REQ_EXT_ARG(0, __window_handle);                                        \
	auto *window = static_cast<GLFWwindow *>(__window_handle);

#define RET_WINDOW(VAL) RET_EXT(VAL)
```

This is better than passing real native object pointers through numeric offsets when JavaScript should treat them as opaque handles.

C++ quality checks to apply during migration:

- Prefer `#pragma once` in C++ headers instead of manual include guards.
- Validate all external input before dereferencing.
- Check image or buffer byte lengths before copying.
- Prefer `std::vector` or other owning containers over temporary raw allocations.
- Return `null` to JS when native APIs return `nullptr` and absence is valid.
- Treat negative indexes the same as missing indexes when that matches the JS API.
- Keep async event paths tolerant of objects that have been logically destroyed but may still be referenced by queued callbacks.
- Initialize all state fields explicitly.

## GYP Support

Standalone clones must build without monorepo-only paths.

Each native addon should include a local `src/common.gypi` copy when it needs the shared GYP settings. Keep it synchronized with `@node-3d/addon-tools/utils/common.gypi`.

Use the shared check in CI:

```json
{
	"scripts": {
		"lint:gypi": "node -e \"import('@node-3d/addon-tools').then((m) => m.checkGypi())\""
	}
}
```

## Scripts

Use namespaced scripts with a concrete flavor:

```json
{
	"scripts": {
		"build:ci": "rslib build",
		"build:watch": "rslib build --watch",
		"build:compile": "cd src && node-gyp build -j max --silent && node -e \"import('@node-3d/addon-tools').then((m) => m.cpbin('addon-name'))\"",
		"build:rebuild": "cd src && node-gyp rebuild -j max --silent && node -e \"import('@node-3d/addon-tools').then((m) => m.cpbin('addon-name'))\"",
		"test:ci": "node --test \"ts/**/*.test.ts\"",
		"test:watch": "node --test --watch \"ts/**/*.test.ts\"",
		"lint:gypi": "node -e \"import('@node-3d/addon-tools').then((m) => m.checkGypi())\"",
		"lint:oxlint": "oxlint .",
		"lint:ts": "tsgo -p tsconfig.json --noEmit",
		"lint:all": "npm run lint:gypi && npm run lint:ts && npm run lint:oxlint",
		"prepare": "npm run build:ci"
	}
}
```

`prepare` exists so npm packaging can create `dist/`. Do not rely on committed `dist/` for GitHub source.

## Migration Checklist

For each native addon:

1. Set package to `"type": "module"`.
2. Move public runtime source into `ts/`.
3. Replace CommonJS exports with named ESM exports.
4. Create `ts/native.ts` and type the native binary surface.
5. Move legacy `index.d.ts` comments and types into TS source.
6. Delete the obsolete root `index.d.ts` after confirming it has no unmigrated declarations or useful comments.
7. Delete stale empty source folders such as `js/` after all source files have moved.
8. Move tests to TS, preferably near the tested source.
9. Move shared fixtures out of `test/` if that directory no longer contains tests, preferably into `examples/assets/`, then delete the stale `test/` directory.
10. Move examples to TS under `examples/`.
11. Add `rslib.config.ts` with a single `index` entry.
12. Add `tsconfig.json` and `tsconfig.build.json`.
13. Keep lifecycle install logic as root `install.js`.
14. Include only `dist`, `install.js`, metadata, and required config files in `files`.
15. Replace ESLint config and scripts with Oxlint and tsgo scripts.
16. Remove package-local Oxlint overrides and TS suppression comments, then fix the violations they exposed.
17. Add or update local `src/common.gypi` and `lint:gypi`.
18. Review C++ binding argument handling, pointer passing, null handling, and buffer safety.
19. Update README examples to named ESM imports.
20. Run the verification commands below.

## Verification

Run these from the monorepo root:

```sh
npm run build:compile --workspace package-name
npm run build:ci --workspace package-name
npm run lint:gypi --workspace package-name
npm run lint:ts --workspace package-name
npm run lint:oxlint --workspace package-name
npm run test:ci --workspace package-name
npm pack --workspace package-name --dry-run
```

For packages with a native binary, also verify the generated entry imports:

```sh
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```

The dry-run package should not include `ts/` or old CommonJS sources. Split
`dist/*.d.ts` declaration output is expected when internal modules are imported
by `dist/index.d.ts`.
