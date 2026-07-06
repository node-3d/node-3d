# Example Validation

Use the strongest practical validation without assuming unavailable hardware or display resources.

## Type and Build Checks

Examples should be included in package `tsconfig.json` when useful for type checking, but excluded from `tsconfig.build.json` unless the package deliberately builds examples.

Run package checks:

```powershell
npm --workspace @node-3d/package-name run lint:ts
npm --workspace @node-3d/package-name run lint:oxlint
```

## Running Examples

The supported Node.js version can run TypeScript examples directly in this repo's current model. Prefer package or example scripts when present.

If an example requires native binaries, a display server, GPU hardware, CUDA, OpenCL, audio devices, or QML runtime assets, say what was and was not validated.

## Visual Output

For screenshot-producing examples or tests:

- verify offscreen rendering where supported,
- compare screenshots when the package already has a visual comparison harness,
- keep generated screenshots out of source unless the package intentionally tracks baselines.

## Consumer Contract

An example is not complete if it only works by importing internal source paths. It should exercise the same package contract as downstream users.
