---
name: tests
description: Add, review, or maintain Node3D tests. Use for node:test unit tests, native-load tolerant tests, visual and screenshot tests, offscreen rendering checks, feature coverage strategy, package test scripts, skipped hardware-dependent tests, and testing browser/WebGL/Three.js compatibility.
---

# Tests

Use this skill for normal unit tests and visual tests. Node3D tests often need to distinguish pure TypeScript logic, native binary load, graphics runtime behavior, and hardware-dependent compute behavior.

## Workflow

1. Identify what layer the test targets: pure TS, native adapter typing/argument packing, native runtime, rendering, visual output, plugin integration, or compute interop.
2. Prefer `node --test` tests that run in the package's existing script shape.
3. Keep tests near TS source as `*.test.ts` when that is the package convention.
4. Make native-load or hardware-dependent tests skip gracefully when the environment cannot support them.
5. For visual tests, verify that screenshots or generated images are deterministic enough for CI before adding baselines.
6. Run the focused package test command and relevant lint/type checks.

## References

- Read [test-strategy.md](references/test-strategy.md) for layer-specific coverage guidance.
- Read [visual-testing.md](references/visual-testing.md) for screenshot/offscreen rendering patterns and caveats.
