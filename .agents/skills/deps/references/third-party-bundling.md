# Third-party Bundling

Dependency packages must make third-party provenance and licensing clear.

## Bundling Questions

When creating or updating a deps package, answer:

- Which upstream library and version are bundled?
- Which platforms and architectures are supported?
- Which files are runtime binaries?
- Which files are headers or build-time assets?
- Which downstream Node3D packages consume it?
- Which license terms apply to the third-party code?
- Are there redistributable binary restrictions?

## Docs

Package README files should identify the bundled library, what the package provides, and any important license notes. Root docs emphasize that Node3D code is MIT, while bundled third-party components keep their own licenses.

## Platform Archives

Keep platform archive naming and extraction behavior compatible with `@node-3d/addon-tools` helpers when those helpers are used.

Avoid surprising postinstall behavior. For metadata-only workflows or CI jobs that do not need native binaries, use `--ignore-scripts`.
