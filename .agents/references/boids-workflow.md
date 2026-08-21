# Boids Compute Workflow

Load only for the canonical `packages/core/examples/core/boids` examples or
when a new compute path must match their supported workflow.

The same simulation has three implementations:

- `boids-gl.ts`: browser-style GLSL render-to-texture using float textures;
- `boids-cl.ts`: OpenCL kernels updating shared OpenGL VBOs;
- `boids-cuda.ts`: CUDA kernels updating shared OpenGL VBOs.

All variants model position/phase and velocity as groups of four floats. The GL
path uses texture state sampled by render geometry; OpenCL/CUDA use instanced
VBO attributes so rendering and compute share GPU-resident dynamic state. Keep
the static bird mesh separate from those per-instance buffers.

JavaScript owns setup, state initialization, compilation, static/dynamic
argument updates, frame scheduling, synchronization, and rendering. Kernels own
the data-parallel update. The OpenCL/CUDA N-body paths use 256-item chunks with
local/shared memory; retain that workgroup/block assumption or document a
deliberate replacement.

For every frame, update dynamic values, transfer ownership using the applicable
sequence in `gpu-interop.md`, then render only after compute has released the
resource. Keep the bounded frame-count path working for automation.
