# Node3D platform support

## Baseline

| Platform | Architectures | Note |
| --- | --- | --- |
| Windows | x64, ARM64 | - |
| Linux | x64, ARM64 | glibc baseline follows the oldest supported Node.js LTS or the Ubuntu build baseline. |
| macOS | x64, ARM64 | Deployment target follows Node.js LTS; native builds currently use `MACOSX_DEPLOYMENT_TARGET=13.5`. |

Node.js: `>=22.18.0` (Node 24 is the current recommended LTS).  
npm: `>=10.9.0` (the npm line bundled with Node 22).

## Node.js support policy

Node3D supports Node.js LTS releases only. We baseline on the oldest supported
LTS line, support older LTS lines until their upstream end-of-life date, and add
support for the next even-numbered LTS line before or when it becomes LTS.
Non-LTS odd-numbered releases are not a supported target, even when the npm
engine range permits installation. End-of-life Node.js releases are unsupported.

## Package support

| Package | Platforms | Notes |
| --- | --- | --- |
| `@node-3d/addon-tools` | To establish | Node/npm only, if no native artifact is loaded. |
| `@node-3d/core` | Windows x64; Linux x64/ARM64; macOS ARM64 | OpenGL-capable graphics stack. |
| `@node-3d/glfw` | To establish | Native window/display and OpenGL requirements. |
| `@node-3d/image` | To establish | Native runtime requirements. |
| `@node-3d/segfault` | To establish | Native runtime requirements. |
| `@node-3d/webgl` | To establish | OpenGL driver/runtime requirements. |
| `@node-3d/bullet` | To establish | Native runtime requirements. |
| `@node-3d/cuda` | Windows x64/ARM64; Linux x64/ARM64 | NVIDIA driver, GPU, and CUDA runtime. |
| `@node-3d/gabenet` | To establish | Native runtime requirements. |
| `@node-3d/iohook` | To establish | OS input-hook permissions and runtime requirements. |
| `@node-3d/opencl` | To establish | OpenCL ICD, driver, and device. |
| `@node-3d/qml` | To establish | Qt/QML runtime and display requirements. |
| `@node-3d/steam-api` | To establish | Windows ARM64 is omitted by Steamworks SDK inputs. |
| `@node-3d/uv-loop` | To establish | Node-major-specific release lines. |
| `@node-3d/webaudio` | To establish | Audio device/runtime requirements. |
| `@node-3d/deps-bullet` | To establish | Binary-library runtime requirements. |
| `@node-3d/deps-freeimage` | To establish | Binary-library runtime requirements. |
| `@node-3d/deps-gns` | To establish | Binary-library runtime requirements. |
| `@node-3d/deps-labsound` | To establish | Audio runtime requirements. |
| `@node-3d/deps-opengl` | To establish | Driver and display/OpenGL runtime requirements. |
| `@node-3d/deps-qmlui` | To establish | Qt/QML runtime requirements. |
| `@node-3d/deps-qt-core` | To establish | Qt runtime requirements. |
| `@node-3d/deps-qt-gui` | To establish | Qt GUI/display runtime requirements. |
| `@node-3d/deps-qt-qml` | To establish | Qt/QML runtime requirements. |
| `@node-3d/deps-uiohook` | To establish | OS input-hook permissions and runtime requirements. |
| `@node-3d/plugin-bullet` | To establish | Inherits Core and Bullet constraints. |
| `@node-3d/plugin-qml` | To establish | Inherits Core and QML constraints. |
| `@node-3d/plugin-webaudio` | To establish | Inherits Core and WebAudio constraints. |
| `@node-3d/qml-colorhelpers` | To establish | Required QML host package/version. |
| `@node-3d/qml-fontawesome` | To establish | Required QML host package/version. |
| `@node-3d/qml-themedui` | To establish | Required QML host package/version. |

## Evidence required before declaring support

For every native package and target, record the release tag/archive inspected
and verify:

- Linux ABI requirements, including the highest required glibc symbol version.
  The target is the oldest supported Node.js LTS glibc baseline, or the baseline
  of the Ubuntu version used to build the archive.
- macOS architecture and deployment target. The target is defined by build flags
  and follows the applicable Node.js LTS baseline.
- Windows imported DLLs and Microsoft runtime dependency.
- Package-specific prerequisites: graphics driver/display, CUDA, OpenCL, Qt,
  Steamworks, audio, or input permissions.
- Whether source CI covers build, native load, runtime behavior, or rendering;
  describe only the level actually exercised.
