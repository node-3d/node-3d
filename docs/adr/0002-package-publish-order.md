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

Publishing remains local and agent-assisted. Agents prepare and validate package
state, inspect `npm pack --dry-run`, and leave the final interactive
`npm publish` command for the human operator because npm OTP prompts are
terminal-interactive.

Dedicated package publish GitHub Actions are not maintained under the current
release policy.

## Consequences

Publishing in dependency order reduces failed consumer installs caused by
missing packages.

Release work requires explicit sequencing across package repositories rather
than a single monorepo publish command.

After publishing, verify registry state with `npm view` before moving on to
dependent packages.
