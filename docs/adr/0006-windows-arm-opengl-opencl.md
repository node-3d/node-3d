# 0006 - Windows ARM OpenGL And OpenCL Compatibility

## Status

Accepted.

## Context

GitHub-hosted Windows ARM runners do not provide the same graphics and compute
runtime stack as a typical developer or consumer machine.

Windows ARM OpenGL tests initially failed with:

```text
WGL: The driver does not appear to support OpenGL
```

OpenCL linking also needed to work on Windows ARM without relying on a
checked-in Win64-only `OpenCL.lib`.

## Decision

Install Microsoft's OpenGL/OpenCL compatibility support on Windows ARM CI so
Mesa/D3D12 can provide OpenGL over the Microsoft Basic Render Driver.

A successful diagnostic renderer on that setup typically reports:

- vendor: `Microsoft Corporation`
- renderer: `D3D12 (Microsoft Basic Render Driver)`
- version: Mesa compatibility profile

For OpenCL on Windows ARM, generate the OpenCL import library from the official
Khronos DEF file instead of relying on a checked-in Win64-specific import
library.

Tests should distinguish Node3D wrapper correctness from runtime-specific
behavior. Do not add addon-side validation solely to reject handles or arguments
that a native OpenCL runtime accepts. Document platform-specific differences
instead.

## Consequences

Windows ARM CI can validate GLFW/OpenGL and OpenCL paths using platform support
available on GitHub-hosted runners.

The OpenGL renderer identity in CI reflects Mesa over D3D12 rather than vendor
GPU hardware.

OpenCL behavior may differ between Microsoft's compatibility layer and vendor
runtimes, especially for invalid-input edge cases, so tests should focus on
valid build, argument setup, queue, buffer, and execution paths.
