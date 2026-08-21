# GPU Interop Reference

Load for CUDA/OpenCL/OpenGL resource sharing, compute ownership, kernel argument
packing, GPU-resident simulation state, or compute-driven rendering examples.

## Ownership

Never let GL and compute write the same resource concurrently.

OpenCL/OpenGL sequence:

1. finish pending GL work;
2. acquire shared GL objects;
3. enqueue compute;
4. release GL objects;
5. finish the queue before GL renders.

CUDA/OpenGL sequence:

1. make the CUDA context current;
2. finish pending GL work;
3. register/map graphics resources before CUDA access;
4. launch against mapped device pointers;
5. synchronize CUDA;
6. unmap/unregister before GL renders.

Use `try/finally` around ownership transitions when failures could strand a
resource in compute ownership.

## Design

- Keep render/simulation data GPU-resident when practical.
- JS owns orchestration: setup, compilation, argument updates, frame scheduling,
  synchronization, and rendering.
- Kernels own data-parallel math.
- Keep packed kernel arguments explicit and update dynamic values/pointers
  deliberately.
- Validate context, ownership, lifetime, and null/invalid handles before native
  calls.
- State GPU/runtime/platform requirements in examples.
- Prefer a bounded `--max-frames` or equivalent path for automation.

## Implementation Patterns

For browser-style GPGPU, keep state in float textures and use render-to-texture
ping-pong. For CUDA/OpenCL interop, prefer shared instanced GL VBOs: keep static
mesh data separate from dynamic per-instance state and let compute update the
same GPU buffers that GL renders. When N-body kernels repeatedly read neighbor
chunks, use shared/local memory deliberately and document the workgroup/block
assumption.
