---
name: compute
description: Implement Node3D GPU compute workflows. Use for CUDA, OpenCL, GLSL render-to-texture compute, GL/CUDA or GL/OpenCL interop, GPU-side model data layout, VBO/texture memory ownership, kernel argument packing, shared/local memory optimization, compute-driven rendering examples, and boids-style simulations.
---

# Compute

Use this skill for the mechanics of GPU compute in Node3D. The reference model is `packages/core/examples/boids`, which implements the same simulation three ways: GLSL render-to-texture, OpenCL/OpenGL shared VBOs, and CUDA/OpenGL shared VBOs.

## Workflow

1. Identify the compute path: GLSL texture ping-pong, OpenCL over shared GL buffers, CUDA over shared GL buffers, or another native interop path.
2. Define the GPU-side data model first. Decide whether simulation state lives in textures, GL VBOs, CUDA device pointers, OpenCL memory objects, or a combination.
3. Keep render data GPU-resident whenever possible. Prefer shared GL buffers or textures over CPU readback/writeback in per-frame loops.
4. Establish ownership transitions explicitly: `gl.finish()` before compute takes over, OpenCL acquire/release around GL objects, CUDA map/register before kernel access and unmap/unregister before GL rendering.
5. Keep JavaScript responsible for orchestration: initialization, resource creation, kernel/program compilation, argument updates, frame loop, synchronization, and rendering.
6. Keep kernels responsible for data-parallel math and memory-efficient iteration. Use shared/local memory when an N-body style workload repeatedly reads the same neighbor chunks.
7. Make examples explicit about device/runtime requirements and provide bounded run options such as `--max-frames` when useful for validation.

## References

- Read [boids-workflow.md](references/boids-workflow.md) for the three implementation variants and render/compute frame flow.
- Read [gpu-data-layout.md](references/gpu-data-layout.md) for texture versus VBO state layout, instancing, and model data ownership.
- Read [interop-principles.md](references/interop-principles.md) for GL/CUDA/OpenCL resource ownership and synchronization rules.
