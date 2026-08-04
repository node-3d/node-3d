# Platform and Native CI Limits

Node3D CI should be honest about what GitHub-hosted runners can validate.

## Native Addons

Native addon checks may involve:

- TypeScript build and lint,
- `node-gyp` compile,
- C++ lint,
- native binary load,
- runtime behavior,
- visual/offscreen output.

These are different levels of confidence. Do not imply that a pure TS or lint workflow validates native runtime behavior.

## CUDA and GPU Packages

Do not assume GitHub-hosted runners have:

- NVIDIA GPUs,
- CUDA toolkit,
- working CUDA runtime,
- OpenCL ICD/device availability,
- display server support,
- Vulkan/OpenGL driver behavior matching user machines.

For CUDA and similar packages, separate portable tests from hardware-dependent tests. Pure TypeScript argument packing tests and source linting can run broadly. Native-load tests should skip gracefully or be isolated when binaries/runtime are unavailable.

Install runtime/platform support explicitly when the runner image does not have
it, such as OpenCL support on Windows ARM64.

## Binary Baselines

Node.js 24's macOS minimum aligns with `MACOSX_DEPLOYMENT_TARGET=13.5`. Native
builds that matter for macOS should set that target. GitHub macOS runners are
standardized on `macos-26`, with the deployment target controlling binary
compatibility; runner version and deployment target are separate concerns.

Native addon binaries built with modern MSVC require the corresponding Visual
C++ runtime on consumer machines. Stay aligned with Node.js' supported Windows
baseline and current toolchain expectations instead of inventing a lower runtime
target independently.

Linux binary compatibility is tied to the glibc version of the build
environment. Keep Linux build images aligned with the same baseline Node.js
effectively supports, rather than building on newer images that silently raise
the glibc floor.

## macOS OpenGL

Core and GLFW need real offscreen rendering in GitHub macOS CI. Native Cocoa
GLFW window creation can fail on macOS runners with
`NSGL: Failed to find a suitable pixel format`.

The established headless path is Mesa through Homebrew, GLFW `PLATFORM_NULL`,
EGL + OpenGL ES in surfaceless mode, rendering to an FBO, and pixel readback to
prove the context is renderable. For macOS x64 jobs on ARM runners, use x86_64
Homebrew under `/usr/local` and expose Mesa EGL/GLES dylibs to the runtime.

GLFW tests should validate GLFW initialization, context/window creation,
rendering, and pixel readback directly. Core tests should rely on the
established runner setup instead of rediscovering GLFW platform support.

For GLFW teardown, prefer Node environment cleanup hooks over process
`std::atexit()` cleanup. On macOS Mesa/EGL, `std::atexit()` cleanup can run too
late and emit `EGL: Failed to clear current context`.

## Windows ARM OpenGL

Windows ARM runners can report
`WGL: The driver does not appear to support OpenGL`. Install Microsoft's
OpenGL/OpenCL compatibility support so Mesa/D3D12 can provide OpenGL over the
Microsoft Basic Render Driver. A working diagnostic renderer typically reports
vendor `Microsoft Corporation`, renderer `D3D12 (Microsoft Basic Render
Driver)`, and a Mesa compatibility profile.

## cpplint

Legacy native sources may have known style categories that are not worth fixing in the same CI task. If a workflow must filter those categories, encode filters explicitly and narrowly, and do not hide new categories unnecessarily.
