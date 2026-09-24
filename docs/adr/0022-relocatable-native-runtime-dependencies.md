# 0022 - Relocatable Native Runtime Dependencies

## Status

Accepted.

## Context

An ELF addon can pass repository-local tests while retaining an absolute build
path in `DT_NEEDED`. This happens when a shared library without `DT_SONAME` is
passed to the linker by a slash-containing filename. The build runner still has
that path, but an npm consumer does not.

## Decision

On ELF platforms, Node3D native builds must link redistributable shared
libraries through search directories (`library_dirs`/`-L`) and logical library
names (`-l`). They must not pass absolute or slash-containing build, SDK, or
workspace paths for runtime `.so` dependencies unless the dependency has a
verified portable `DT_SONAME` and the exception is documented.

Libraries shipped beside an addon must use a relocatable `$ORIGIN` runpath.
macOS binaries must likewise resolve bundled dylibs through `@loader_path` or an
appropriate `@rpath`, never through a build-machine path. Windows import
libraries may use build-time search directories because those paths are not
recorded as runtime DLL dependencies.

## Consequences

GYP files use platform library search directories instead of direct `.so`
paths. Repository tests remain useful, but artifact relocation is proven by the
packed consumer gate defined in ADR 0023 rather than by assuming a successful
in-tree load is portable. Existing addons with direct `.so` paths must migrate
to logical linker names or document a verified portable `DT_SONAME` before
their next native binary release.
