# Contract Workflow

Load this file only when the root `AGENTS.md` Contract Gate is YES.

This workflow does not grant commit, push, tag, release, or publish authority.
Authorization remains exclusively in root `AGENTS.md`.

## 1. Name the Contract

Identify only what applies:

- affected package(s);
- API/native/runtime/install/binary/package/example/docs/CI/release contract;
- root workspace versus standalone package impact;
- platform/runtime scope.

Avoid treating every touched file as a separate contract.

For a changed public/native API, also answer only the applicable questions:
accepted inputs, returned values, side effects, invalid-input behavior, resource
ownership/lifetime, and platform/runtime differences.

## 2. Resolve the Source of Truth

When sources disagree, prefer:

1. upstream technical contracts Node3D intentionally follows;
2. accepted Node3D ADRs;
3. public exports in `ts/index.ts`;
4. generated declarations after a successful build;
5. C++ binding implementation and package-local native wrappers;
6. `ts/native.ts`;
7. runnable examples and tests using package self-imports;
8. package README/root docs;
9. agent skills and process notes;
10. undocumented historical behavior.

If the chosen source is lower in this order, state the reason.

## 3. Inspect the Minimum Contract Surface

Read the files that can actually drift for this change. Usually this means some
subset of:

- `package.json`;
- `ts/index.ts`;
- relevant C++ bindings and `ts/native.ts`;
- tests for the behavior;
- examples that demonstrate the workflow;
- README/API text;
- relevant ADRs;
- focused skills/references for the affected package family;
- install/binary/pack configuration.

Do not load unrelated package families or references merely because they exist.

## 4. Keep Owning Artifacts Synchronized

A contract-changing implementation should leave the durable owner aligned:

- tests -> executable behavior;
- README -> consumer-facing API/platform/install behavior;
- examples -> supported consumer workflows;
- ADR -> durable cross-package policy;
- skill/reference -> repeated agent maintenance procedure;
- source comment -> local non-obvious implementation constraint.

Do not add an ADR for a one-package implementation detail unless it creates a
reusable project rule.

## 5. Validate at the Changed Layer

Use the narrowest proof that matches the contract, then broaden only when needed.

- public TS API -> build + declaration inspection;
- pure TS behavior -> focused `node --test`/package tests;
- native binding shape -> C++ export inspection + `ts/native.ts`;
- native availability -> native-load check;
- native runtime -> focused runtime test;
- rendering -> pixel/readback/offscreen or visual validation;
- example -> run or type-check as appropriate;
- package contents -> build, then `npm pack --dry-run`;
- cross-package declarations -> root/topological build;
- CI contract -> nearest equivalent local/package/root command.

Use precise wording such as: `built declarations`, `type-checked example`,
`loaded native binary`, `validated native runtime behavior`,
`validated pixel/readback output`, or `inspected npm pack contents`.

Do not describe one validation level as another. If a relevant validation was
not run, state the missing runtime, hardware, platform, or time constraint.

## 6. Drift Check

Before finishing, check only relevant mismatches:

- C++ export changed but `ts/native.ts` did not;
- `ts/native.ts` changed but wrapper tests did not;
- `ts/index.ts` changed but README/API docs did not;
- README/example uses an API not exported publicly;
- example reaches into `ts/` or `dist/` instead of package imports;
- package works only from the root workspace;
- install behavior changed but consumer docs did not;
- binary tag changed without a native artifact reason;
- validation language overclaims what was tested;
- skill/process guidance contradicts an accepted ADR.

Fix the mismatch or record why it is intentional.

## Final Contract Report

For a contract-changing task, be able to answer:

- What contract changed?
- What source defined it?
- Which durable artifact records it?
- What was validated?
- What relevant validation was not performed?
- Which root/submodule boundary matters?
