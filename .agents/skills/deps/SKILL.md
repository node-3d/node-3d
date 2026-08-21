---
name: deps
description: Work on Node3D deps-* packages, third-party binaries/headers, getPaths/bin/include contracts, redistribution, provenance, and binary layout consumers.
---

# Dependency Packages

## Owns

`deps-*` package layout and third-party binary/header contracts.

## Workflow

1. Confirm the third-party input may be redistributed; otherwise follow ADR 0014.
2. Preserve the thin dependency-package role rather than forcing runtime/native
   addon source conventions onto it.
3. Keep license and provenance visible.
4. When exported paths or binary layout change, audit all consumers of imports,
   `bin`/`include`, `getPaths()`, and GYP variables.
5. Validate both package contents and at least the affected consumer path when the
   contract changes.

## Load References

Load `.agents/references/dependency-packages.md` for package shape and consumer
audit details.

Use `$publishing` when pack/release metadata is modified; use `$native-addons`
when consumer binding/build behavior is also changed.
