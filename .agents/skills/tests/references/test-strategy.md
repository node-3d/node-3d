# Test Strategy

Node3D packages need tests at multiple layers.

## Layers

- Pure TypeScript logic: should run broadly in `node --test`.
- Native adapter typing and argument packing: can often run without real hardware.
- Native binary load: should skip or fail clearly when the binary/runtime is unavailable.
- Native runtime behavior: may require platform libraries, display, GPU, audio, or device access.
- Integration behavior: plugin/core/addon cooperation.
- Visual rendering: screenshot or pixel comparisons.
- Compute interop: CUDA/OpenCL/Vulkan/OpenGL resource behavior with real runtime support.

## Location

TS source-level tests live next to source as `ts/**/*.test.ts`.

Some packages still use `test/**/*.test.ts`. Follow the package's current convention unless changing it is part of the task.

## Skips

Skip gracefully only for environmental absence, not for real code failures. A skip should make clear what dependency was missing: binary, CUDA runtime, OpenCL device, display server, etc.

## Commands

Use package scripts first:

```powershell
npm --workspace @node-3d/package-name run test:ci
npm --workspace @node-3d/package-name run lint:ts
```
