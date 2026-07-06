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

## cpplint

Legacy native sources may have known style categories that are not worth fixing in the same CI task. If a workflow must filter those categories, encode filters explicitly and narrowly, and do not hide new categories unnecessarily.
