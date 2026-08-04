# 0007 - CUDA Toolkit Installer Policy

## Status

Accepted.

## Context

CUDA package CI needs enough CUDA toolkit support to build native addon binaries,
but GitHub-hosted runners do not provide NVIDIA GPUs or a complete CUDA runtime
environment by default.

CUDA installer behavior can be slow or fragile in CI, especially when installing
unneeded components.

## Decision

Use explicit CUDA installer control in CI instead of relying on third-party
setup actions when package builds need precise component selection.

Install only the CUDA components required for addon builds. Exclude Nsight tools
from CI installs because they are not needed for addon builds and can hang CI.

Add installer progress logging and timeouts so CUDA installation cannot hang
indefinitely without useful diagnostics.

Keep portable build/config validation separate from hardware-dependent runtime
execution. Tests that require NVIDIA GPU hardware or a working CUDA runtime
should be isolated or skipped clearly when unavailable.

## Consequences

CUDA CI remains focused on buildability and package correctness rather than
pretending GitHub-hosted runners provide full CUDA runtime coverage.

Explicit component selection reduces install time and avoids known CI hangs.

Runtime CUDA behavior still needs validation on machines with suitable NVIDIA
hardware and drivers.
