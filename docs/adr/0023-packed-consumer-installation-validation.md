# 0023 - Packed Consumer Installation Validation

## Status

Accepted.

## Context

Workspace and standalone repository tests run with source files, build outputs,
private SDK caches, workspace links, and build-machine paths available. They can
therefore pass even when the published tarball is incomplete, lifecycle scripts
run from the wrong assumptions, registry dependencies are unavailable, or a
native binary only loads on its build runner.

## Decision

Every publishable Node3D package must have a release gate that:

1. builds and creates the actual npm tarball with `npm pack`;
2. transfers only that tarball and the exact candidate artifacts produced by
   the build jobs to an isolated consumer environment;
3. creates an empty project with no workspace links or source/build-tree access;
4. installs the tarball with normal lifecycle scripts and registry dependency
   resolution;
5. loads the package through its public entry point; and
6. runs the narrowest additional consumer smoke behavior needed to prove the
   package's install/runtime contract.

The smoke behavior follows the package family rather than an ad hoc test for
each repository:

- `addon-tools` builds and loads a consumer-owned addon using the packed
  package's public helpers and headers;
- dependency packages build and load a consumer-owned addon that includes the
  dependency's public compilation surface, links the candidate library, and
  calls one safe symbol so required runtime libraries are also loaded;
- native addon packages load their public entry point and exercise the least
  invasive operation that proves the native module initialized;
- `core` initializes the browser-like runtime at its lowest meaningful level;
  and
- plugin packages initialize `core`, apply the plugin through its public
  contract, and verify the capability the plugin adds.

These are minimum family contracts. A package may add a narrower
package-specific assertion when its public role is not proven by the family
baseline, but the consumer gate is not a second unit-test suite.

Dependency fixtures must take their platform libraries, required system
libraries, compile definitions, and ABI settings from the existing production
addon consumers. A fixture may omit workspace-only fallback paths, but it must
not replace the production link surface with a smaller path that can pass while
the real addon cannot link. When a dependency package supplies multiple primary
libraries used by production addons, the fixture covers each of those libraries
with the narrowest safe load or symbol probe.

Pure JavaScript packages may run this gate in ordinary pull-request CI. Native
packages whose installers download GitHub release assets pass the candidate
archives to fresh platform jobs through workflow artifacts. Their install
scripts may expose a package-scoped CI override for the candidate archive base
URL so normal lifecycle behavior is retained without relying on a public
release. When the workflow supplies such an override, the installer must consume
it; silently falling back to an already-published release does not validate the
candidate. The GitHub release is created or updated only after every consumer
lane passes, and npm publication follows separately.

When an ordinary push or pull-request workflow already builds the same native
candidate, it must run the consumer gate in a separate fresh job as well. The
dispatch release workflow repeats that producer-to-consumer boundary for the
exact artifacts it may release; success in one workflow does not stand in for
the other workflow's candidate.

A repository consumer fixture may contain its own `tsconfig.json` to resolve the
package self-import against local source for static validation. That config is
repository-only: consumer preparation removes it after copying the fixture so
the isolated test can resolve only the installed npm candidate.

Repository unit tests, `npm pack --dry-run`, binary metadata checks, and the
consumer gate prove different layers. None substitutes for the others.

Consumer build commands must preserve compiler, linker, and build-system
diagnostics in CI. They must not use quiet or silent modes that reduce a failed
build to an exit code without its underlying diagnostic.

Consumer fixtures that compile native code must declare and pin `node-gyp`
themselves rather than relying on npm's private bundled copy. This keeps the
fixture toolchain explicit and allows new runner toolchains to be supported
without waiting for a Node.js/npm distribution update.

## Consequences

Release workflows gain an explicit producer-to-consumer boundary. Missing pack
files, lifecycle failures, registry-only dependency failures, non-relocatable
native dependencies, public-entry load failures, and platform archive mistakes
are detected from the same perspective as an external npm installation.

A failed consumer gate leaves no newly published GitHub release or npm package.

The gate may be introduced package-by-package, but new packages must include it
from their first release workflow and existing packages must add it when their
release workflow is next changed.
