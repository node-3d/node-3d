# Boids Compute Workflow

The primary compute reference is `packages/core/examples/boids`. It implements one simulation three ways:

- `boids-gl.ts`: GLSL render-to-texture compute through Three.js `GPUComputationRenderer`.
- `boids-cl.ts`: OpenCL kernel updates shared OpenGL VBOs.
- `boids-cuda.ts`: CUDA kernel updates shared OpenGL VBOs.

All three variants render the same conceptual model: position plus phase, velocity, and a bird mesh oriented by velocity.

## Common Setup

The shared setup lives in `utils/`:

- `init-common.ts` initializes Node3D core with `isGles3: true`, `isWebGL2: true`, Three.js helpers, a `Screen`, and debug shader support.
- `loop-common.ts` provides the animation loop, clamps large frame deltas, converts mouse position into normalized predator coordinates, and optionally counts frames for perf mode.
- `fill-data.ts` initializes position/phase and velocity arrays as groups of four floats.

For compute examples, JavaScript should orchestrate:

1. initialize Node3D, GL, camera, controls, and render mesh,
2. allocate GPU-visible state,
3. fill initial data,
4. compile shader/program/kernel,
5. set static kernel/uniform arguments,
6. update dynamic arguments each frame,
7. run compute,
8. synchronize/transfer ownership back to GL,
9. render.

## GLSL Variant

`boids-gl.ts` follows the browser-style GPGPU pattern:

- state lives in float textures created by `GPUComputationRenderer`,
- `texturePosition` stores `xyz = position`, `w = phase`,
- `textureVelocity` stores `xyz = velocity`,
- fragment shaders compute the next position and velocity into render targets,
- the render mesh samples current position and velocity textures in the vertex shader.

This pattern is useful for WebGL compatibility and browser-porting, but it is still render-to-texture compute.

## OpenCL Variant

`boids-cl.ts` switches state from textures to GL VBOs:

- `BirdGeometryCl` creates instanced GL VBO attributes for `offset` and `velocity`.
- JavaScript fills the initial `Float32Array` data and uploads it with `gl.bufferData`.
- `gl.extractId(vbo)` exposes the actual GL buffer ID.
- `cl.createFromGLBuffer(...)` wraps those GL buffers as OpenCL memory objects.
- Each frame:
  - update dynamic kernel args such as `dt` and predator position,
  - call `gl.finish()`,
  - acquire GL objects for OpenCL,
  - enqueue the kernel,
  - release GL objects back to OpenGL,
  - `cl.finish(queue)`,
  - render.

The OpenCL kernel uses 256-item chunks. Each workgroup copies positions and velocities into `__local` memory, synchronizes, and then every thread reads the local chunk. This reduces repeated global memory reads for the N-body interaction.

## CUDA Variant

`boids-cuda.ts` uses the same instanced VBO data model as OpenCL:

- `BirdGeometryCuda` creates `offset` and `velocity` VBO attributes.
- `memVBO()` wraps GL buffers for CUDA interop.
- `moduleRuntimeCompile(...)` compiles `cuda/boids.cu` to PTX at runtime.
- `prepareArguments(...)` builds a packed kernel argument buffer.
- Each frame:
  - set the CUDA context current,
  - update `dt` and predator values in the argument buffer,
  - call `gl.finish()`,
  - register/map GL VBOs for CUDA,
  - write mapped device pointers into the kernel argument buffer,
  - launch the kernel with `[gridSize, 1, 1]` and `[256, 1, 1]`,
  - synchronize the CUDA context,
  - unregister/unmap VBOs in `finally`,
  - render.

The CUDA kernel mirrors the OpenCL algorithm with 256-thread blocks and `__shared__` arrays for the chunked N-body reads.
