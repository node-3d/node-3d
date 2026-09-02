---
name: native-addons
description: Work on Node3D C++ addons, addon-tools bindings, binding.gyp/common.gypi, install.js, ts/native.ts, native handles, lifetime safety, and native verification.
---

# Native Addons

## Owns

Native addon source/binding contracts and package-native plumbing.

## Workflow

1. Identify the affected standalone package and inspect C++ exports before
   changing TypeScript native types.
2. Keep `ts/native.ts` a narrow, precise adapter over the binary surface.
3. Validate external inputs, lengths, pointer/handle semantics, ownership, and
   destroyed-object async paths.
4. Preserve standalone build/install behavior; do not introduce root-only paths.
5. For standalone native consumer validation, install with normal `npm ci` so
   dependency `postinstall` hooks provide their binary artifacts. Reserve
   `--ignore-scripts` for metadata-only work that will not build, load, or run
   native code. Never invoke a dependency installer from the consumer directory:
   its lifecycle working directory is part of its binary-path contract.
6. Run the focused native/build/type/test checks that match the changed layer.
7. If public native behavior changes, ensure Contract Gate is YES and synchronize
   wrapper tests/docs/examples as needed.

## Binding Boundary Policy

Follow `docs/adr/0015-native-addon-cpp-binding-organization.md` for every
non-trivial native addon. `bindings.cpp` is the mount table only; place API
wrappers, callback bridges, state, and resource behavior in thematically named
files. Prefer the matching `addon-tools` argument and return macro for ordinary
JS arity/type conversion. Add custom checks only for an upstream constraint,
memory/ownership safety, or an explicitly documented Node3D contract; do not
duplicate macro checks or add speculative abstraction at the binding boundary.

## Load References

Load `.agents/references/native-addons.md` for package shape, binding organization,
GYP/install conventions, or pointer/lifetime rules.

Add `$publishing` only for package/pack/install release state, not for ordinary
native implementation work.
