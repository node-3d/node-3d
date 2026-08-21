---
name: compute
description: Work on CUDA, OpenCL, GLSL compute, GL/CUDA or GL/OpenCL interop, GPU data ownership, kernels, argument packing, and compute-driven rendering.
---

# Compute

## Owns

GPU compute architecture, resource ownership, synchronization, and compute
examples.

## Workflow

1. Identify the backend and where simulation/render state lives.
2. Keep GPU data resident where practical; avoid per-frame CPU round trips.
3. Make GL/compute ownership transitions explicit and exception-safe.
4. Keep JS responsible for orchestration and kernels for data-parallel work.
5. Keep kernel argument layout explicit; validate handles, contexts, lifetimes,
   and dynamic pointer updates.
6. Give examples explicit runtime/device requirements and a bounded automation
   path where practical.
7. Choose texture ping-pong for browser-style GPGPU or shared GL VBOs for
   compute/render interop; keep dynamic state stride and typed representation
   explicit.

## Load References

Load `.agents/references/gpu-interop.md` for GL/CUDA/OpenCL ownership,
synchronization, resource handles, or argument packing.

Load `.agents/references/boids-workflow.md` when extending or diagnosing the
canonical `packages/core/examples/core/boids` implementations.

Use `$examples`/`$tests` as secondary skills only when modifying their artifacts.
