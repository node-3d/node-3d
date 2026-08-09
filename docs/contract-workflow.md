# Node3D Contract Workflow

Use this workflow when a change alters or may desynchronize public behavior,
native bindings, package contracts, supported examples, platform/runtime claims,
CI validation meaning, release policy, or cross-package conventions.

Keep these artifacts aligned:

- upstream specifications and third-party API contracts,
- C++ binding behavior,
- `ts/native.ts` native types,
- public exports from `ts/index.ts`,
- package READMEs,
- examples,
- tests,
- ADRs,
- package release contents,
- focused agent skills.

## Apply This When

Use this workflow for any change that touches:

- public TypeScript exports,
- native addon arguments, return values, handles, callbacks, or lifetime,
- generated declarations,
- package install behavior,
- native binary download or archive layout,
- `deps-*` package path contracts,
- examples that represent supported consumer workflows,
- README API text or platform claims,
- CI behavior that defines project validation,
- package publishing, binary release, or npm pack behavior,
- cross-package conventions,
- browser-like, WebGL, WebAudio, OpenCL, GLFW, QML, plugin, or compute
  compatibility behavior.

Skip it for:

- typo-only docs changes,
- formatting-only changes,
- internal refactors that do not change public behavior,
- local cleanup with unchanged tests, examples, package contents, and exports.

## Contract Source Order

When sources disagree, use this order unless the task gives a stronger reason:

1. Upstream technical contracts that Node3D follows.
2. Accepted Node3D ADRs.
3. Public package exports in `ts/index.ts`.
4. Generated declaration output, only after build.
5. C++ binding implementation and package-local native wrappers.
6. `ts/native.ts`.
7. Runnable examples and tests using package self-imports.
8. Package README and root docs.
9. Agent skills and process notes.
10. Historical behavior that is not documented or tested.

If the chosen source is not first in this order, state why.

## Required Workflow

### 1. Classify The Change

Identify:

- package family: core, native addon, deps, plugin, QML helper, CI/release, or
  docs-only,
- affected package names,
- affected contract: API, native binding, binary layout, install behavior,
  runtime behavior, example behavior, docs, CI, or release policy,
- whether the package must work both in the root workspace and as a standalone
  repository.

### 2. Load The Owning Skill

Use the smallest relevant skill:

- `core` for browser-like, WebGL, Three.js, document, window, canvas, context,
  and resource behavior,
- `native-addons` for C++ bindings, `ts/native.ts`, native handles, binary
  loading, `binding.gyp`, `common.gypi`, and `install.js`,
- `deps` for `deps-*` package layout, path helpers, binary/include layout, and
  third-party provenance,
- `plugins` for package composition and high-level integrations,
- `docs` for README, API text, package documentation, and usage snippets,
- `examples` for runnable examples and consumer-style workflows,
- `tests` for unit, native-load, runtime, visual, and hardware-dependent tests,
- `ci` for workflows, platform limits, matrices, and runner behavior,
- `publishing` for pack contents, release readiness, binary tags, npm publish
  boundaries, and submodule/root release safety.

### 3. Read The Contract Before Editing

Read the relevant files before changing behavior.

For every package:

- `package.json`,
- `ts/index.ts` when present,
- package README,
- examples that cover the behavior,
- tests that cover the behavior.

For cross-package or release work:

- relevant ADRs,
- root `AGENTS.md`,
- relevant `.agents/skills/**`,
- root and package scripts.

Let the owning skill define additional package-family files to read.

### 4. State The Contract

Before or alongside the implementation, state the intended contract in the
smallest useful place:

- test name,
- README section,
- example,
- PR/issue note,
- ADR,
- package-local design note,
- agent skill update.

Answer only the questions that apply:

- What public behavior changes?
- What inputs are accepted?
- What outputs are returned?
- What side effects occur?
- What owns native resources?
- What happens after destroy/free/close?
- What happens on invalid input?
- Which platform/runtime differences matter?
- Which upstream contract is followed?
- Which upstream behavior is intentionally not followed?
- Which test or example proves the behavior?

### 5. Implement Under Existing Conventions

Follow `AGENTS.md` and the owning skill for package shape, exports, generated
artifacts, install lifecycle, examples, scripts, and standalone repository
compatibility.

### 6. Prove The Contract

Choose validation that matches the changed layer:

- public TypeScript API: build and generated declarations,
- pure TS behavior: `node --test` package tests,
- native binding shape: C++ export inspection plus `ts/native.ts` typing,
- native binary availability: native-load test,
- native runtime behavior: focused runtime test,
- rendering behavior: offscreen/pixel/readback test or screenshot test,
- example behavior: run or type-check the example as appropriate,
- package contents: build first, then inspect `npm pack --dry-run`,
- cross-package declaration behavior: root/topological build,
- CI behavior: run the nearest equivalent package or root script.

Use precise validation language:

- "built declarations",
- "type-checked example",
- "loaded native binary",
- "validated native runtime behavior",
- "validated pixel/readback output",
- "inspected npm pack contents",
- "not validated locally because ...".

Do not describe one validation level as another.

### 7. Update The Durable Artifact

Update the artifact that owns the changed contract:

- README for consumer-facing behavior,
- tests for executable behavior,
- examples for supported workflows,
- ADR for cross-package policy,
- agent skill for repeated maintenance procedure,
- source comment for local non-obvious implementation constraint.

If no durable artifact changes, be able to say why.

## Artifact Ownership

Use the owning artifact for the changed contract:

- README: consumer-facing behavior, install notes, API overview, platform
  limits, third-party provenance,
- tests: executable behavior that should not drift,
- examples: supported consumer workflows,
- ADR: durable cross-package decisions,
- agent skill: repeated agent procedure,
- source comment: local constraint not obvious from code.

Use ADRs only for durable cross-package decisions:

- package shape,
- publishing policy,
- native binary compatibility,
- CI strategy,
- cross-package architecture,
- conventions future packages must follow.

Do not create an ADR for a one-package implementation detail unless it creates
a reusable project rule.

## Drift Checks

Before finishing a contract-changing task, check for these mismatches:

- C++ export changed but `ts/native.ts` did not,
- `ts/native.ts` changed but wrapper tests did not,
- `ts/index.ts` changed but README/API docs did not,
- README snippet uses an API not exported from `ts/index.ts`,
- example imports internal source paths,
- package works only from the root workspace,
- install behavior changed but package README did not,
- native binary tag changed without native artifact reason,
- test claims runtime validation but only type-checks,
- agent skill contradicts an ADR.

Fix the mismatch or document why it is intentional.

## Add A Contract Artifact When

Add or update README, test, example, ADR, or skill when:

- public API changes,
- native argument or return behavior changes,
- resource ownership or lifetime changes,
- install behavior changes,
- binary/archive layout changes,
- package contents change,
- examples establish a supported workflow,
- CI establishes a reusable platform rule,
- release policy changes,
- a bug fix chooses between historical and intended behavior,
- a cross-package convention is created.

Do not add a new artifact for local implementation movement with unchanged
contract.

## Final Check

Before reporting completion, answer:

- Which contract changed?
- Which source defined the contract?
- Which artifact now records it?
- Which validation was run?
- Which validation was not run?
- Which package/submodule boundary matters?

If none of these questions apply, skip this workflow for that task.
