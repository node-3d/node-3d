# Node3D platform support

This is the published-artifact inventory as of **2026-10-10**. It uses the
current npm versions below, their `install.js` release selectors, and the
assets currently served from those releases. Release assets may be refreshed
without changing the tag or npm version, so later audits must check them again.

## Platform and runtime baseline

| Code | Platform | Installer archive |
| --- | --- | --- |
| WX | Windows x64 | `windows.gz` |
| WA | Windows ARM64 | `win32-arm64.gz` |
| LX | Linux x64 | `linux.gz` |
| LA | Linux ARM64 | `aarch64.gz` |
| MX | macOS x64 | `osx.gz` |
| MA | macOS ARM64 | `darwin-arm64.gz` |

**Six** means WX, WA, LX, LA, MX, and MA. **Five without WA** means every
platform above except Windows ARM64. These are the exact filenames requested
by `@node-3d/addon-tools` for each Node.js platform and architecture. An npm
package version need not equal its native release tag.

Node.js: `>=22.18.0`; npm: `>=10.9.0`. Node3D supports LTS Node.js releases,
baselining on the oldest supported LTS line and adding the next even-numbered
line before or when it becomes LTS. Odd-numbered and end-of-life releases are
outside the support policy even when the npm engine range permits them. Node 24
is the current recommended LTS. `uv-loop` has separate Node 22, 24, and 26
binary lines on all six platforms; that does not imply that every package has
been runtime-tested on every Node-major/platform combination.

The published binaries' concrete Windows runtime, Linux glibc, and macOS
deployment requirements are recorded below. Runner labels alone are
insufficient: some dependency packages redistribute upstream binaries with
requirements different from the runner used to package them.

## Published dependency and addon binaries

Every linked release below was selected by the published npm version's
installer. All 145 archives across these 25 release tags were downloaded,
their SHA-256 digests matched GitHub's release metadata, and their tar contents
held the expected addon or libraries. The platform column records artifact
availability and matching direct runtime dependency chains. Hardware and
graphical prerequisites still apply.

| Package (npm version) | Native release | Platforms | Runtime condition or limit |
| --- | --- | --- | --- |
| `@node-3d/deps-bullet@5.0.2` | [5.0.0](https://github.com/node-3d/deps-bullet/releases/tag/5.0.0) | Six | Bullet libraries and headers. |
| `@node-3d/deps-freeimage@7.0.2` | [7.0.0](https://github.com/node-3d/deps-freeimage/releases/tag/7.0.0) | Six | FreeImage runtime library. |
| `@node-3d/deps-gns@0.1.2` | [0.1.0](https://github.com/node-3d/deps-gns/releases/tag/0.1.0) | Six | GameNetworkingSockets runtime library. |
| `@node-3d/deps-labsound@7.0.2` | [7.0.0](https://github.com/node-3d/deps-labsound/releases/tag/7.0.0) | Six | Audio backend/device needed to produce sound. |
| `@node-3d/deps-opengl@8.1.1` | [8.0.0](https://github.com/node-3d/deps-opengl/releases/tag/8.0.0) | Six | OpenGL driver and usable context/display path required. |
| `@node-3d/deps-qmlui@5.0.2` | [5.0.2](https://github.com/node-3d/deps-qmlui/releases/tag/5.0.2) | Five without WA | QmlUi runtime; depends on Qt Core, GUI, and QML. No WA archive. |
| `@node-3d/deps-qt-core@5.0.2` | [5.0.0](https://github.com/node-3d/deps-qt-core/releases/tag/5.0.0) | Six | Qt Core runtime. |
| `@node-3d/deps-qt-gui@5.0.2` | [5.0.0](https://github.com/node-3d/deps-qt-gui/releases/tag/5.0.0) | Six | Qt GUI runtime; the WA archive lacks `Qt6OpenGL.dll`. |
| `@node-3d/deps-qt-qml@5.0.2` | [5.0.0](https://github.com/node-3d/deps-qt-qml/releases/tag/5.0.0) | Six | Qt QML runtime; QmlUi integration remains unavailable on WA. |
| `@node-3d/deps-uiohook@1.0.2` | [1.0.0](https://github.com/node-3d/deps-uiohook/releases/tag/1.0.0) | Six | OS input-hook permissions may be required. |
| `@node-3d/segfault@4.0.3` | [4.0.0](https://github.com/node-3d/segfault/releases/tag/4.0.0) | Six | Native crash reporter. |
| `@node-3d/uv-loop@0.1.2` | [0.1.0-22](https://github.com/node-3d/uv-loop/releases/tag/0.1.0-22), [0.1.0-24](https://github.com/node-3d/uv-loop/releases/tag/0.1.0-24), [0.1.0-26](https://github.com/node-3d/uv-loop/releases/tag/0.1.0-26) | Six on each Node line | Direct libuv ABI; installer selects a Node-major-specific tag. |
| `@node-3d/bullet@5.1.1` | [5.0.0](https://github.com/node-3d/bullet/releases/tag/5.0.0) | Six | Depends on `deps-bullet` and `segfault`. |
| `@node-3d/cuda@1.1.1` | [1.1.1](https://github.com/node-3d/cuda/releases/tag/1.1.1) | WX, WA, LX, LA | NVIDIA driver, GPU, and CUDA runtime required. No macOS CUDA binary; import and device-count queries are safe there, but CUDA work is unsupported. |
| `@node-3d/gabenet@0.1.2` | [0.1.0](https://github.com/node-3d/gabenet/releases/tag/0.1.0) | Six | Depends on `deps-gns` and `segfault`. |
| `@node-3d/glfw@7.4.1` | [7.3.1](https://github.com/node-3d/glfw/releases/tag/7.3.1) | Six | Depends on `deps-opengl`, `segfault`, and `uv-loop`; window/display or supported headless context required. |
| `@node-3d/image@6.0.3` | [6.0.1](https://github.com/node-3d/image/releases/tag/6.0.1) | Six | Depends on `deps-freeimage` and `segfault`. |
| `@node-3d/iohook@1.0.2` | [1.0.0](https://github.com/node-3d/iohook/releases/tag/1.0.0) | Six | Depends on `deps-uiohook` and `segfault`; OS input-hook permissions may be required. |
| `@node-3d/opencl@3.0.2` | [3.0.2](https://github.com/node-3d/opencl/releases/tag/3.0.2) | Six | OpenCL ICD, driver, and device required for compute; WA CI uses OpenCLOn12. |
| `@node-3d/qml@5.0.2` | [5.0.0](https://github.com/node-3d/qml/releases/tag/5.0.0) | Five without WA | Depends on `deps-qmlui` and `segfault`; Qt/QML runtime and display/context required. |
| `@node-3d/steam-api@0.4.2` | [0.4.1](https://github.com/node-3d/steam-api/releases/tag/0.4.1) | Five without WA | No WA archive; Steam client and application ID context needed for live Steamworks calls. |
| `@node-3d/webaudio@6.0.2` | [6.0.0](https://github.com/node-3d/webaudio/releases/tag/6.0.0) | Six | Depends on `deps-labsound` and `segfault`; sound output requires a working backend/device. |
| `@node-3d/webgl@6.0.3` | [6.0.1](https://github.com/node-3d/webgl/releases/tag/6.0.1) | Six | Depends on `deps-opengl` and `segfault`; OpenGL driver/context required. |

## Packages built on those binaries

These packages have no separately downloaded native archive. Their functional
platform set is the intersection of the native packages needed for their public
workflow, including the Node3D host where applicable. Development-only
dependencies do not reduce a standalone package's installation set, but they
do matter for the documented integration workflow.

| Package (npm version) | Functional platforms | Basis |
| --- | --- | --- |
| `@node-3d/addon-tools@10.2.0` | Six | Platform-neutral JS and headers; its packed consumer builds and loads an addon on all six. |
| `@node-3d/core@6.4.1` | Six | `glfw`, `image`, `webgl`, and their native dependencies all have six archives; Core packed-consumer CI passed on all six. Requires a usable OpenGL context. CUDA is a development integration, not a Core runtime dependency. |
| `@node-3d/plugin-bullet@4.0.2` | Six | `bullet` plus a Core host; both have six-platform binary chains. |
| `@node-3d/plugin-qml@5.0.2` | Five without WA | `qml` plus a Core host; `qml` and `deps-qmlui` omit WA. |
| `@node-3d/plugin-webaudio@4.0.2` | Six | `webaudio` plus a Core host; both have six-platform binary chains. |
| `@node-3d/qml-colorhelpers@1.0.2` | Five without WA in Node3D QML | Its files are platform-neutral, but its documented QML host uses `plugin-qml`. |
| `@node-3d/qml-fontawesome@1.0.2` | Five without WA in Node3D QML | Its files are platform-neutral, but its documented QML host uses `plugin-qml`. |
| `@node-3d/qml-themedui@1.0.2` | Five without WA in Node3D QML | Its files are platform-neutral, but its documented QML host uses `plugin-qml` and `qml-fontawesome`. |

## Operating-system runtime requirements

### Windows Visual C++ runtime

The published Windows `.node` and DLL payloads' PE import tables name the Visual C++ v14
runtime, including `VCRUNTIME140.dll`, `VCRUNTIME140_1.dll`, `MSVCP140.dll`,
`MSVCP140_1.dll`, and `MSVCP140_2.dll` across the package set. Individual
binaries import different subsets. They also import Universal CRT API-set
DLLs. None of the selected Windows release archives bundles VC or UCRT DLLs.
The Node3D addon GYP configuration selects the dynamic runtime (`/MD`), and
the Qt packages redistribute upstream MSVC 2022 binaries. Some dependency
packages carry only static libraries; their consuming addon supplies the
runtime imports at final link.

On Windows x64 or ARM64, ensure the current supported
[Microsoft Visual C++ v14 Redistributable](https://learn.microsoft.com/en-us/cpp/windows/latest-supported-vc-redist)
for the target architecture is available. DLL names alone do not identify an
exact minimum redistributable build, so an old v14 installation should not be
assumed sufficient for every package. The Universal CRT is an OS component on
Windows 10 and later; see [Microsoft's CRT deployment guidance](https://learn.microsoft.com/en-us/cpp/windows/determining-which-dlls-to-redistribute).
The Windows CI runners have build tools and runtimes installed, so their
success does not prove that a clean consumer Windows image already has the
needed redistributable.

### Linux glibc

These are the highest `GLIBC_*` entries in the published Linux ELF
`.gnu.version_r` sections, **including the listed package's runtime Node3D
dependencies**. They are necessary glibc floors, not complete distro support
claims: Node.js itself, `libstdc++`, graphics drivers, and other system
libraries can add requirements. Static-only dependency archives have no
direct ELF runtime floor; the final addon row captures their linked result.

| Package or package group | Linux x64 | Linux ARM64 |
| --- | --- | --- |
| `deps-bullet`, `deps-uiohook` | Static-only | Static-only |
| `deps-labsound` | 2.16 | 2.34 |
| `deps-freeimage`, `deps-gns`, `deps-opengl` | 2.34 | 2.34 |
| `deps-qt-core`, `deps-qt-gui`, `deps-qt-qml`, `deps-qmlui` | 2.28 | 2.38 |
| `segfault`, `iohook`, `opencl`, `steam-api` | 2.14 | 2.17 |
| `uv-loop` (Node 22, 24, 26 binaries) | 2.4 | 2.17 |
| `bullet` | 2.27 | 2.27 |
| `cuda`, `gabenet`, `glfw`, `image`, `webaudio`, `webgl` | 2.34 | 2.34 |
| `qml` | 2.34 | 2.38 |
| `core`, `plugin-bullet`, `plugin-webaudio` | 2.34 | 2.34 |
| `plugin-qml`, QML helpers in the Node3D QML host | 2.34 | 2.38 |

`addon-tools` has no prebuilt ELF payload; a consumer-built addon determines
its own floor. [Ubuntu 22.04](https://packages.ubuntu.com/jammy/libc6) ships
glibc 2.35, sufficient for the listed Node3D binary symbol floors except the
Linux ARM64 Qt/QML chain. [Ubuntu 24.04](https://packages.ubuntu.com/noble/libc6)
ships glibc 2.39 and satisfies that chain's 2.38 floor. The Qt packages fetch
official Qt 6.8.0 binaries rather than rebuilding them on their Ubuntu 22.04
packaging runners; their Linux ARM64 runtime and consumer CI uses Ubuntu 24.04
for this reason.

### macOS deployment target

The published dynamic Mach-O payloads' minimum-version load commands for both
macOS architectures specify no higher than **13.5**. Node3D-built addons and dynamic
libraries report 13.5; the bundled Qt 6.8.0 binaries report 12.0; bundled
Steamworks libraries can report 10.15. Native build workflows set 13.5 and
check the output with `otool`; the Qt workflows check that every copied
dynamic binary supports 13.5 or older. Static-library build workflows also
check their `.a` payloads with `otool`. Those libraries have no standalone
dynamic load target, while their downstream addons report 13.5.

## Meaning and limits of the evidence

The release inventory establishes that a matching published archive exists and
contains the expected payload for each platform shown. It does not alone prove
that a host has a compatible C runtime, GPU driver, display server, Qt plugin,
Steam client, audio device, or input permission. Package Test workflows and
packed-consumer jobs provide separate installation and runtime evidence; their
assertions differ by package and platform. For example, `plugin-qml` exercises
full context-sharing tests on WX and LX, loads and runs on LA without screenshot
comparison, and validates binary/package loading on macOS without proving QML
rendering there.

For a refreshed release, inspect the selected archive and record its digest
and update time before reusing these requirements. A green build or TypeScript
check does not establish native load, rendering, compute, audio, input, or
platform behavior.
