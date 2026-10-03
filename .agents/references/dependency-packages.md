# Dependency Package Reference

Load for `deps-*` layout, third-party redistribution, binary/header provenance,
path helpers, or consumers of packaged native dependencies.

`deps-*` packages carry redistributable third-party binaries/headers plus thin
runtime/type entrypoints needed by native Node3D packages.

Do not use this model for private or license-restricted SDK inputs; follow
`docs/adr/0014-private-third-party-build-inputs.md`.

Typical dependency packages may intentionally use:

- a minimal package-root `index.js` entrypoint plus `index.d.ts`, under the
  narrow ADR 0018 exception for thin path/metadata exports;
- platform-specific `bin-*` folders;
- include/header directories;
- thin `bin`/`include`/`getPaths()` style exports.

Do not force Rslib, `ts/`, or native-addon `dist/` conventions onto a deps
package merely to transpile a trivial entrypoint. If `index.js` grows beyond a
thin adapter, reassess it as TypeScript source with generated publish output.
Dependency-package tests, fixtures, build utilities, and maintenance scripts
remain TypeScript.

When binary/path layout changes, inspect consumers for imports/requires,
`.bin`, `.include`, `getPaths(...)`, and `binding.gyp` variables.

Keep third-party license and provenance visible in package documentation.
