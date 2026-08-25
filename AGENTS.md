# Node3D Agent Guidance

The root is a superproject; `packages/*` are standalone npm workspaces and Git
repositories.

## Precedence

1. Current user instructions.
2. This file: policy and authorization.
3. `docs/contract-workflow.md` when Contract Gate = YES.
4. Loaded skills: domain procedure.
5. Loaded references: detailed facts/checklists.
6. Existing source/docs/history.

Deeper context may specialize procedure but must not broaden authority. This file
wins over conflicting skills/references.

## Global Invariants

- Preserve unrelated dirty work in root and package submodules.
- Keep every workspace package standalone-capable and root/package Node/npm
  engine metadata aligned.
- Do not edit/commit generated output as source: `dist/`, `.rslib/`, tarballs,
  native build folders, generated `.clang-format`.
- Examples are repository-only: exclude package `examples/` from npm `files`,
  `dist/`, tarballs, and runtime dependencies.
- Report validation exactly; build/type checks do not prove native runtime,
  rendering, audio, compute, input, or platform behavior.
- On Windows-native agent sessions execute npm as `npm.cmd`; user-facing commands
  use `npm`.

## Authorization

Inspection and task-required edits are allowed.

- Commit/push only with explicit authorization from the user.
- Explicit commit/push authorization applies to the currently checked-out branch.
- Do not create or switch branches, open a pull request, or impose a review flow
  unless the user explicitly requests it. An authorized push to the default
  branch remains a push to that branch.
- **"prepare <package> for publishing"** explicitly authorizes committing and
  pushing the validated package state and corresponding root repo state.
- Publishing prep does not authorize unrelated commits, tags,
  GitHub releases/assets, or changes outside the release scope.
- Tags/releases require explicit authorization.
- Never run npm operations that require authentication. Validate and
  give the intended command to the user instead.

Before any commit/push/tag/release action, re-check authorization and name the
repositories affected.

## Context Routing

Use the smallest useful context. Skills are selected by the changed behavior or
artifact, not merely by nearby package names:

1. Choose exactly one primary skill for the behavior/artifact being changed.
2. Add secondary skills only for additional artifacts actually modified; prefer
   at most two.
3. Load references only when a loaded skill names the triggering condition.
4. Never preload all skills/references.

Primary routes:

- C++ bindings, GYP, `install.js`, `ts/native.ts`, native handles/lifetimes ->
  `$native-addons`
- core browser/DOM/canvas/WebGL/Three.js/runtime behavior -> `$core`
- CUDA/OpenCL/GL compute and GPU interop -> `$compute`
- `deps-*` binary/header/path contracts -> `$deps`
- plugin composition/high-level integrations -> `$plugins`
- README/API/package docs -> `$docs`
- `examples/**`/consumer workflows -> `$examples`
- tests/test infrastructure/validation strategy -> `$tests`
- GitHub Actions/workflows/platform CI -> `$ci`
- package metadata, pack/release readiness, versions/lock release state,
  submodule release coordination -> `$publishing`

For mixed work, the behavior owner is primary; changed artifact owners are
secondary.

## Contract Gate

Set **YES** when a change affects or may desynchronize public API/exports, native
arguments/returns/handles/callbacks/lifetime, runtime/browser/graphics/audio/
compute/plugin behavior, install/binary/archive/package contents, supported
consumer examples, platform claims, CI validation meaning, release policy, or a
cross-package convention. Then load `docs/contract-workflow.md`.

Set **NO** for typo/format-only edits and internal refactors whose public behavior,
tests, examples, package contents, and exports remain unchanged.

## Checkpoints

Before editing: package/repo scope; primary/secondary skills; Contract Gate.

Before side effects: authorization; exact root/submodule targets; unrelated dirty
work safely excluded.

Before completion: validations actually run; relevant validations not run;
remaining dirty/submodule state; contract drift/durable artifact needs.

## Execution

Prefer focused package commands before broad root checks. Use normal `npm ci`
for native consumer validation; reserve `--ignore-scripts` for metadata-only
work. Load `.agents/references/repository-model.md` when package/submodule
boundaries or workspace-wide commands matter.

## Durable Decisions

Use `docs/adr/` for durable cross-package policy and keep `docs/adr/README.md`
synchronized. Do not substitute README or agent prose for an ADR when changing a
global project policy.
