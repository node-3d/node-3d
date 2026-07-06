# GPU Data Layout

Design compute examples around explicit GPU-resident state.

## Boids State

The boids examples use two logical state arrays:

- position/offset: `x`, `y`, `z`, `phase`
- velocity: `x`, `y`, `z`, unused or padding `w`

`phase` drives wing animation. Velocity drives both simulation movement and render orientation/color.

Initial data is written as `Float32Array` groups of four values with `fillPositionAndPhase(...)` and `fillVelocity(...)`.

## GLSL Texture Layout

The GLSL version stores state in float textures:

- texture dimensions are `WIDTH x WIDTH`,
- bird count is `WIDTH * WIDTH`,
- the bird geometry stores a `reference` attribute with UV coordinates into the state textures,
- compute fragment shaders update textures,
- render vertex shader samples textures by `reference`.

This keeps the model compatible with browser GPGPU examples.

## VBO Layout for OpenCL and CUDA

The OpenCL and CUDA versions use instanced rendering backed by GL VBOs:

- one small non-instanced bird mesh describes the body and wings,
- one instance represents one bird,
- per-instance `offset` is a vec4 position/phase VBO,
- per-instance `velocity` is a vec4 velocity VBO,
- `THREE.GLBufferAttribute` wraps the GL buffer,
- the attribute is marked as instanced through `isInstancedBufferAttribute` and `meshPerAttribute = 1`.

This layout allows both compute and rendering to touch the same GPU buffers without CPU readback.

## Geometry Implications

The GLSL renderer expands every bird into full geometry with a texture reference per vertex.

The OpenCL/CUDA renderer uses `THREE.InstancedBufferGeometry`, which is better suited to compute interop because the simulation state is already in per-instance VBO attributes.

When creating new compute examples, prefer a layout where:

- static mesh data is separate from dynamic simulation state,
- dynamic state has a clear stride and typed representation,
- GL can render the same buffers the compute backend updates,
- JavaScript does not copy per-frame simulation state through CPU memory.
