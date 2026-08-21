---
name: examples
description: Create, review, or maintain Node3D runnable examples, consumer-style package imports, feature demos, vendor adaptations, assets, and example validation.
---

# Examples

## Owns

Supported runnable workflows under package `examples/`.

## Workflow

1. Define the consumer behavior the example proves.
2. Import Node3D packages by package name; never reach into `../ts` or `../dist`.
3. Prefer TypeScript-first examples when the supported Node runtime can execute
   them directly.
4. Separate Node3D-authored examples from adapted vendor examples clearly.
5. Run the example or nearest type/build validation; state hardware/visual limits
   honestly.
6. Keep examples out of npm package contents.

## Load References

Load `.agents/references/documentation-examples.md` for ownership/layout,
consumer-code, and validation conventions.

Use the behavior-owning skill as secondary when the example requires source/API
changes.
