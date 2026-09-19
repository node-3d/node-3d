# 0020 - Native addon CI validation baseline

- Status: Accepted
- Date: 2026-09-20

## Context

Native-addon repositories accumulated different subsets of portable validation.
That makes a missing validator easy to mistake for an intentional package
difference and leaves C++, TypeScript, or unit-test regressions unchecked.

## Decision

Every package classified as a native addon in
`.agents/references/repository-model.md` must run the following checks for push
and pull-request changes:

- TypeScript type checking;
- `oxlint`;
- C++ `cpplint`, using the shared `CPPLINT.cfg` copied by
  `@node-3d/addon-tools`;
- the package-owned unit-test suite.

The checks may be grouped into any workflow layout. This baseline is portable
validation and complements, rather than replaces, package-specific native,
graphics, hardware, or platform matrices. A package may deviate only for a
specific documented constraint, with the exception kept narrow in its workflow
or an ADR.

## Consequences

Native-addon CI has a common minimum contract while retaining specialized
runtime coverage. Future CI reviews can compare the four baseline validators
directly instead of inferring intent from neighboring repositories.
