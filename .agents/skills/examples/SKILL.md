---
name: examples
description: Create, review, or maintain Node3D examples. Use for runnable examples, package self-imports, realistic consumer-like usage, feature coverage demos, example assets, screenshots, README snippets derived from examples, and avoiding legacy relative imports into ts or dist.
---

# Examples

Examples are part of the public package contract. They should be realistic, runnable, and close to how a consumer would use the package.

## Workflow

1. Identify the package feature or workflow the example should demonstrate.
2. Import Node3D packages by package name, such as `@node-3d/core`, not by reaching into `../dist` or `../ts`.
3. Keep examples TypeScript-first when the supported Node.js version can execute them directly.
4. Use package-local `examples/assets/` for fixtures that exist to support examples.
5. Prefer examples that cover meaningful behavior: rendering, event loops, browser compatibility, interop, plugins, resources, or API edge cases.
6. Run the example or the closest available type/build check. For visual examples, verify output when the environment supports it.

## References

- Read [example-design.md](references/example-design.md) for consumer-code conventions and feature coverage guidance.
- Read [example-validation.md](references/example-validation.md) for practical run, type-check, asset, and screenshot validation patterns.
