---
name: docs
description: Write and maintain Node3D package READMEs, API text, usage snippets, package roles, platform/install notes, and source-backed consumer documentation.
---

# Documentation

## Owns

Consumer-facing package documentation.

## Workflow

1. Inspect the package public entrypoint plus the source/examples/tests that prove
   the documented behavior.
2. Derive snippets from real package imports and runnable examples; do not invent
   APIs.
3. Keep docs concise and package-specific.
4. Keep `deps-*` provenance/license notes and native install/platform notes where
   consumer-relevant.
5. If wording changes a public API/platform/install claim, set Contract Gate YES
   even when no source code changes.

## Load References

Load `.agents/references/documentation-examples.md` for README structure,
package-family emphasis, or snippet/example rules.

Load the behavioral owner skill as secondary only when verifying or modifying
its implementation contract.
