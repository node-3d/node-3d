# Architecture Decision Records

This directory records durable Node3D project decisions that affect package
shape, publishing, CI, native binary compatibility, or development workflow.

ADRs are numbered in creation order. Use `Accepted` for decisions that describe
current project policy, and add a new ADR when a future change supersedes an
existing decision.

## Records

- [0001 - Package naming policy](0001-package-naming-policy.md)
- [0002 - Package publish order](0002-package-publish-order.md)
- [0003 - Dependency range policy](0003-dependency-range-policy.md)
- [0004 - Native addon lifecycle policy](0004-native-addon-lifecycle-policy.md)
- [0005 - macOS headless OpenGL CI strategy](0005-macos-headless-opengl-ci.md)
- [0006 - Windows ARM OpenGL and OpenCL compatibility](0006-windows-arm-opengl-opencl.md)
- [0007 - CUDA toolkit installer policy](0007-cuda-toolkit-installer-policy.md)
- [0008 - Render loop scheduling policy](0008-render-loop-scheduling-policy.md)
- [0009 - uv-loop shared idle pump](0009-uv-loop-shared-idle-pump.md)
- [0010 - Direct libuv ABI policy](0010-direct-libuv-abi-policy.md)
- [0011 - Node-major binary release lines](0011-node-major-binary-release-lines.md)
- [0012 - Native binary release reuse](0012-native-binary-release-reuse.md)
- [0013 - Frame pacing and real-time callbacks](0013-frame-pacing-and-real-time-callbacks.md)
- [0014 - Private third-party build inputs](0014-private-third-party-build-inputs.md)
- [0015 - Native addon C++ binding organization](0015-native-addon-cpp-binding-organization.md)
- [0016 - Repository-only examples](0016-repository-only-examples.md)
