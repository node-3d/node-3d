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

## Headless Native Windows

Tests that create GLFW or `@node-3d/core` windows must not assume a user
desktop exists in CI. Use the package's test bootstrap/helper for every
test-created window or document so initialization order, visibility, context
hints, and platform-specific runner behavior stay centralized.

macOS native-window tests should use the explicit headless path: set GLFW
`PLATFORM_NULL` before importing public modules that auto-initialize GLFW, then
create hidden EGL/OpenGL ES windows with depth, stencil, and multisampling
disabled unless the test needs those buffers.

Linux native-window tests may use the established Xvfb/default platform path
when that package already validates it. Do not change a green Linux suite to
another GL bootstrap merely because macOS needs a stricter path.

For core tests that create additional `BrowserDocument` instances after the
initial test bootstrap, keep the context hints compatible with the initial
document. On Linux this means using the Xvfb/default platform but preserving the
same hidden GLES profile used by the first core test document; do not switch
Linux to Null/EGL unless the workflow also provides and validates EGL.

Use child-process probes when initialization order matters. A process that has
already imported an auto-initializing GLFW entry cannot later switch the GLFW
platform.

Xvfb is acceptable as runner plumbing. Prefer proving the context is actually
renderable through framebuffer or pixel readback.

## Runtime Diagnostics

Temporary probes are useful during native runtime research, but successful paths
should be promoted into normal public APIs or tests and the probe code removed.

When a child-process test validates native runtime behavior, fail on native error
diagnostics such as `GLFW Error ...` even if the child process exits
successfully.

## Commands

Use package scripts first:

```powershell
npm --workspace @node-3d/package-name run test:ci
npm --workspace @node-3d/package-name run lint:ts
```
