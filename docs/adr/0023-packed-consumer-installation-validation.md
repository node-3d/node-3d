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

Pure JavaScript packages may run this gate in ordinary pull-request CI. Native
packages whose installers download GitHub release assets pass the candidate
archives to fresh platform jobs through workflow artifacts. Their install
scripts may expose a package-scoped CI override for the candidate archive base
URL so normal lifecycle behavior is retained without relying on a public
release. The GitHub release is created or updated only after every consumer lane
passes, and npm publication follows separately.

Repository unit tests, `npm pack --dry-run`, binary metadata checks, and the
consumer gate prove different layers. None substitutes for the others.

## Consequences

Release workflows gain an explicit producer-to-consumer boundary. Missing pack
files, lifecycle failures, registry-only dependency failures, non-relocatable
native dependencies, public-entry load failures, and platform archive mistakes
are detected from the same perspective as an external npm installation.

A failed consumer gate leaves no newly published GitHub release or npm package.

The gate may be introduced package-by-package, but new packages must include it
from their first release workflow and existing packages must add it when their
release workflow is next changed.
