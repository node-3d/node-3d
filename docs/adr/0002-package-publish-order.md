# 0002 - Package Publish Order

## Status

Accepted.

## Context

Node3D packages are developed together in a root workspace, but consumers install
them from the npm registry. Workspace linking can hide registry availability
problems during local validation.

Many packages depend on other Node3D packages. Native addon packages often
depend on `deps-*` binary/header packages and shared tooling packages.

## Decision

Publish packages in dependency order.

Packages must be available in the registry before dependents that reference
them are published. Release validation should not rely on the monorepo to
resolve dependencies that registry consumers need.

Each standalone package repository maintains a manually dispatched
`.github/workflows/publish.yml`. The workflow packs the package, installs the
same tarball in an isolated consumer project with lifecycle scripts enabled,
and publishes that tarball only after the consumer gate passes. npm trusted
publishing authenticates the GitHub Actions job through OIDC, without a
long-lived npm token or a browser keychain. Configure `publish.yml` as an
allowed direct publisher for each package on npmjs.com before dispatching it.

Native binary releases remain separate from npm publication. The binary
release and its consumer gates must succeed before dispatching the npm publish
workflow for a package whose installer downloads those assets. The npm version
does not by itself require a new binary release (ADR 0012).

Agents may prepare and validate release state, but must not run authenticated
npm operations locally. A human operator chooses when to dispatch a package's
publish workflow and completes any npm-side trusted publisher setup.

## Consequences

Publishing in dependency order reduces failed consumer installs caused by
missing packages.

Release work requires explicit sequencing across package repositories rather
than a single monorepo publish command. Each package's workflow is registered
separately as an npm trusted publisher.

After publishing, verify registry state with `npm view` before moving on to
dependent packages.
