# Node3D Plan

This is the root repository's living execution checklist. It records agreed work
and its order; update it when scope or priorities change. Check an item only
after its implementation and relevant validation are complete.

## Do now

### Draft platform support

The platform-support document is [docs/platform-support.md](docs/platform-support.md).
It is a draft contract and evidence tracker, not a replacement for package-level
READMEs or release-asset verification.

- [x] Create the root platform-support draft with clear meanings for goal,
  published availability, CI coverage, and consumer runtime requirements.
- [ ] Audit every published package's release archives and installer selection
  to fill its platform row from evidence rather than convention.
- [ ] Establish and document the Linux glibc baseline for each native archive
  line.
- [ ] Establish and document Windows runtime dependencies, including whether a
  Microsoft Visual C++ Redistributable is required and which version/architecture.
- [ ] Confirm the macOS deployment target represented by published archives;
  document it separately from the GitHub runner used to build or test them.
- [ ] Reconcile root-level platform language with package-specific exclusions,
  starting with Core, CUDA, and Steam API.

### Improve onboarding documentation

- [ ] Review the root and Core quick starts as a clean consumer would use them;
  keep Bash commands as the documented default unless a command is explicitly
  labelled for another shell.
- [ ] Make Core's direct install instructions include its required Three.js
  peer when the following example imports Three.js.
- [ ] Replace or qualify the Core crate example's repository-only texture path
  so copied consumer code does not depend on an asset excluded from npm packages.
- [ ] State the supported Node.js/npm baseline near each applicable quick start.
- [ ] Check the resulting snippets against real public package imports and a
  clean local consumer directory.

### Initiate the GSOM demo repository

- [ ] Decide the repository location, licensing, asset policy, and release
  relationship to Node3D; do not create it until those choices are agreed.
- [ ] Write a short vertical-slice brief: first-person loop, one arena, one
  weapon/enemy interaction, and the success criterion for a playable build.
- [ ] Identify the smallest initial Node3D dependency set. Do not make QML,
  WebAudio, physics, or networking prerequisites unless the first slice needs
  them.
- [ ] Define how the project will serve as a consumer validation target without
  coupling its development to unpublished workspace packages.

## Do next

### 1. CI improvements

- [ ] Add ordinary lint/test CI for `@node-3d/uv-loop`, including its
  Node-major-sensitive runtime behavior where feasible.
- [ ] Remove the stale statement in Gabenet CI saying that no published Gabenet
  archive exists.
- [ ] Align `@node-3d/deps-gns` test workflow with the other `deps-*` packages;
  remove its exceptional `npm pack --dry-run` step unless a package-specific
  contract justifies keeping it.
- [ ] Design a root-owned consumer-health workflow that installs released npm
  packages into clean applications. Prefer a scheduled daily run plus manual
  dispatch; decide separately whether push-triggered coverage earns its cost.
- [ ] Start the consumer-health workflow with a small set of meaningful flows:
  Core + Three.js, a native binary load, and a Gabenet loopback. Report runtime
  validation separately from builds, lint, and hardware-dependent tests.

### 2. Platform support details

- [ ] Complete every per-package row in `docs/platform-support.md`, including
  Node range, platform/architecture availability, test status, and prerequisites.
- [ ] Record binary evidence: `readelf`/equivalent Linux ABI inspection,
  `otool` macOS target inspection, and Windows DLL/runtime dependency inspection.
- [ ] Add package-level links for special constraints such as NVIDIA CUDA,
  OpenCL ICD/device availability, Qt/QML runtime needs, and Steamworks SDK
  restrictions.
- [ ] Decide how support claims and exceptions are kept current on subsequent
  binary releases.

### 3. GSOM demo features

- [ ] Implement the agreed playable vertical slice with published Node3D
  dependencies.
- [ ] Add automated checks appropriate to the demo: install/build first, then
  deterministic non-visual or headless gameplay checks where practical.
- [ ] Add physics, QML HUD, WebAudio, and Gabenet deliberately as individual
  milestones rather than as initial scaffolding.
- [ ] Use the completed demo to identify missing APIs, lifecycle problems, and
  consumer documentation gaps; create focused package work from those findings.

### 4. Diagnostic tool

- [ ] Decide whether diagnostics are a CLI, an importable API, an issue-template
  helper, or a combination.
- [ ] Define the minimal safe report: Node/package versions, platform/arch,
  selected native archive/tag, and relevant graphics/compute capability.
- [ ] Decide which probes are opt-in because they require a display, GPU,
  driver, or external service.

### 5. API surface documentation and tests

- [ ] Choose one package at a time and state its intended public API surface:
  exports, options, lifecycle/ownership rules, failures, and platform behavior.
- [ ] Make package README/API text, generated declarations, focused tests, and
  consumer examples agree with that intended surface.
- [ ] Add regression tests at the correct layer: public import/type shape,
  native load, native runtime, rendering/readback, or hardware validation.
- [ ] Record durable cross-package policy changes in ADRs; do not use this plan
  as a substitute for an accepted compatibility policy.

### 6. Further demo and onboarding work

- [ ] Use findings from GSOM and consumer-health runs to prioritize the next
  onboarding/documentation improvement.
- [ ] Add only examples that demonstrate supported consumer workflows; retain
  examples as repository-only material.
- [ ] Revisit the project-level documentation structure once the support matrix
  and a real application provide evidence for a more useful navigation path.
