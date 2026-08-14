# 0016 - Repository-only examples

## Status

Accepted.

## Context

Node3D packages keep runnable examples close to each package source. These
examples are part of development and review: they show supported workflows,
exercise package self-imports, and provide realistic smoke-test programs.

npm package tarballs have a different purpose. They should contain the runtime
contract needed by consumers: built entry points, type declarations, install
helpers, package metadata, licenses, and intentionally published documentation.
Shipping example trees increases package size, may pull in large assets or
development-only app files, and can imply that example-only dependencies or
fixtures are part of the install-time runtime contract.

## Decision

Keep examples repository-only for every Node3D package.

Package `examples/` directories must not be listed in package `files` arrays,
copied into `dist/`, or otherwise included in npm publish artifacts. This
applies even when examples are polished, documented, or useful to consumers.

Examples may depend on development-only packages and assets. Those dependencies
belong in `devDependencies`, peer dependency ranges, or example-local setup as
appropriate, not in runtime dependencies solely to make examples available from
an installed npm package.

README files and docs may point users to the repository examples. If a runnable
snippet is important for installed-package documentation, keep it small enough
to live in README or docs and derive it from the repository example source.

## Consequences

`npm pack --dry-run` output should not include `examples/`.

Publish reviews must treat example files in a tarball as a policy violation
unless a future ADR supersedes this rule.

Repository examples remain part of the source contract and should still be
kept runnable, type-checked where practical, and synchronized with README
snippets.
