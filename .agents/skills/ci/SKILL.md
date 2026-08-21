---
name: ci
description: Maintain Node3D GitHub Actions, reusable CI patterns, install modes, matrices, native/GPU/platform limits, lint/test/build jobs, and validation semantics.
---

# CI

## Owns

CI workflow behavior and what automated validation claims to prove.

## Workflow

1. Compare the target with similar package workflows before inventing a pattern.
2. Choose install mode deliberately; use `--ignore-scripts` when native
   postinstall behavior is irrelevant or brittle.
3. Separate portable checks from native/hardware/graphics checks.
4. Keep workflow names, triggers, Node/npm baselines, and package commands
   consistent where the package model is shared.
5. Encode unavoidable legacy/platform exceptions narrowly.
6. If CI changes the meaning of project validation or supported platform claims,
   Contract Gate is YES.
7. Preserve standalone-package workflow paths; do not assume a root workspace
   checkout. Use plain `npm ci` for native binary build workflows unless a
   documented reason requires `--ignore-scripts`.

## Load References

Load `.agents/references/ci-platform-limits.md` for GPU, OpenGL, native binary,
macOS/Linux/Windows ARM, or runner-capability constraints.

Use `$tests` as secondary when test semantics/scripts are modified.
