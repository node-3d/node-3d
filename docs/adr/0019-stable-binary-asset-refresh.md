# 0019 - Stable Binary Release Asset Refresh

## Status

Accepted.

## Context

Native dependency packages install platform archives from a GitHub release tag
selected by `install.js`. npm versions, source commits, and the release tag's
creation date do not establish which archive a consumer receives. GitHub
release assets can be refreshed under an existing tag, and treating a tag as an
immutable timestamp led release audits to incorrectly report rebuilt binaries
as unshipped.

## Decision

The GitHub release tag selected by `install.js` is a stable installer selector,
not an immutable-artifact promise. When refreshed native binaries remain
compatible with that selector, rebuild and replace the platform archives under
the existing tag by default. Avoid creating a new GitHub release/tag or
changing `install.js` merely to version refreshed archives.

Create a distinct artifact line or change the installer only when compatibility
requires it, such as an intentional Node/ABI/platform-baseline break, a
rollback or retirement boundary, or a user-directed release strategy.

Release audits must resolve the installer tag first and inspect the selected
release's actual assets: update times, digests, archive contents, and relevant
binary evidence. They must not infer that a source change is unshipped merely
because it is newer than the tag's creation date or the npm package version.

## Consequences

The same npm version may install refreshed native archives at different times.
Release notes and audits must identify the archive digest and update time when
reproducibility matters. This decision supersedes the binary-tag-advancement
guidance in ADR 0012 where that guidance would require a new tag for a
compatible refreshed artifact.
