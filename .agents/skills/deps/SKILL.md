---
name: deps
description: Work on Node3D deps-* packages that bundle third-party binaries, headers, and thin entrypoints. Use for dependency package layout, platform archives, bundled library motivation, getPaths/bin/include contracts, licensing notes, install behavior, and creating or updating packages such as deps-opengl, deps-freeimage, deps-bullet, deps-labsound, deps-qt-*, deps-qmlui, and deps-uiohook.
---

# Dependency Packages

Use this skill for `deps-*` packages. These packages exist to make native Node3D packages installable and buildable by carrying third-party binaries, headers, and small JS/type entrypoints.

## Workflow

1. Treat `deps-*` packages as a different family from TypeScript runtime packages and native addon packages.
2. Preserve the thin entrypoint contract: expose paths and load-time environment setup needed by dependent addons.
3. Keep third-party license and binary/header provenance visible in package docs.
4. Do not force Rslib or `ts/` conventions onto a deps package unless the package has a concrete runtime reason.
5. When changing binary layout, audit consumers that call `getPaths()`, `require(...)`, GYP variables, or platform bin/include paths.

## References

- Read [deps-package-model.md](references/deps-package-model.md) for package purpose, layout, and consumer contracts.
- Read [third-party-bundling.md](references/third-party-bundling.md) for library acquisition, platform archives, and licensing concerns.
