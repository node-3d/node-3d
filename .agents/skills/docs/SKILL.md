---
name: docs
description: Write and maintain Node3D package documentation. Use for package README files, API sections, usage snippets, examples derived from source, feature descriptions, package role explanations, third-party license notes, and synchronizing documentation with TypeScript exports and runnable examples.
---

# Docs

Use this skill for README and package documentation work. Documentation should explain what each package does, how consumers use it, and how it fits into the Node3D ecosystem.

## Workflow

1. Identify the package family: core, addon, deps, plugin, or QML helper.
2. Inspect the package public entrypoint, README, examples, and tests before writing API text.
3. Pull code snippets from real examples or source where possible. Do not invent APIs.
4. Keep snippets aligned with named ESM exports and package self-imports.
5. Include package-specific third-party license/provenance notes for `deps-*` packages.
6. Prefer concise, actionable README sections over broad marketing copy.

## References

- Read [readme-structure.md](references/readme-structure.md) for package README structure and tone.
- Read [api-snippets.md](references/api-snippets.md) for extracting examples and API references from source.
