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

## Native Addon Baseline

Every package classified as a native addon in
`.agents/references/repository-model.md` must validate, on pushes and pull
requests:

- TypeScript with the package type-check command;
- JavaScript/TypeScript with `oxlint`;
- C++ with `cpplint` and the shared `CPPLINT.cfg` from `@node-3d/addon-tools`;
- its package-owned unit tests.

These validators may share workflows, but a package-specific platform or
hardware constraint is not an omission. Any exception must be narrow and
documented in the package workflow or an ADR.

## Packed Consumer Gate

Release workflows must validate the actual npm tarball in an empty consumer
project, without workspace linking or source/build-tree fallback. Install with
lifecycle scripts enabled, load the public entry, and add only meaningful
package-specific smoke behavior. Native packages that download release assets
must pass their exact candidate archives to fresh downstream jobs as workflow
artifacts. Create or update the GitHub release only after every consumer lane
passes; passing repository tests is not a substitute.

## Load References

Load `.agents/references/ci-platform-limits.md` for GPU, OpenGL, native binary,
macOS/Linux/Windows ARM, or runner-capability constraints.

Use `$tests` as secondary when test semantics/scripts are modified.
