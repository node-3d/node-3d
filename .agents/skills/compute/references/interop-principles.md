# Interop Principles

Compute work should preserve explicit control of native resources, memory ownership, and synchronization.

## Resource Types

Interop may involve:

- OpenGL texture IDs,
- OpenGL buffer IDs,
- Vulkan instances/devices/surfaces,
- CUDA resources,
- OpenCL memory objects/queues,
- platform window/context/device handles.

## Ownership and Synchronization

Do not let GL and compute write the same resource at the same time.

Use the ownership sequence that matches the backend:

- OpenCL/OpenGL:
  - finish pending GL work with `gl.finish()` before OpenCL uses GL objects,
  - acquire GL objects with `cl.enqueueAcquireGLObjects(...)`,
  - enqueue kernels,
  - release with `cl.enqueueReleaseGLObjects(...)`,
  - finish the queue before GL renders from those objects.
- CUDA/OpenGL:
  - set the CUDA context current before CUDA work,
  - finish pending GL work with `gl.finish()`,
  - map/register graphics resources before CUDA use,
  - launch kernels against mapped device pointers,
  - synchronize the CUDA context,
  - unmap/unregister before GL renders.

Use `try/finally` around CUDA map/register sections so resources return to GL ownership after kernel failures.

## API Design

Expose resource IDs and handles deliberately when they are needed for interop. Use branded opaque object handles for real native pointers that JavaScript should not manipulate. Use numbers for GL/Vulkan/platform handles that are intentionally numeric.

Keep packed kernel arguments explicit. In the CUDA boids example, `prepareArguments(...)` creates a buffer with scalar arguments and placeholder device pointers; each frame overwrites dynamic floats and mapped device pointer slots before launch.

## Examples

Compute examples should state requirements clearly:

- GPU vendor/runtime,
- CUDA toolkit/runtime,
- OpenCL ICD/device,
- Vulkan support,
- OpenGL context requirements,
- platform limitations.

When possible, separate setup/argument tests from real compute execution so CI and local development can validate portable parts.

## Safety

Interop code should validate ownership, current context, resource lifetime, and null/invalid handles before native calls. When a resource can be destroyed while callbacks or compute work remain queued, handle that state explicitly.

For bounded validation examples, support a max-frame argument or another deterministic exit path so examples can run in automation without becoming infinite demos.
