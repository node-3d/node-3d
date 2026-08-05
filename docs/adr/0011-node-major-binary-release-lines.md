# 0011 - Node-Major Binary Release Lines

## Status

Accepted.

## Context

Most Node3D native addons can publish one set of platform archives for a
package version because their public native surface relies on Node-API.

Packages that depend on direct libuv ABI details need binaries built against
specific Node.js major versions. The existing addon installer downloads release
assets from a tag directory using the established `<platform>.gz` archive names.

## Decision

For Node-major-sensitive native binaries, use release tags shaped as:

```text
<package-version>-<node-major>/<platform>.gz
```

For `@node-3d/uv-loop` version `0.1.0`, this produces:

```text
0.1.0-20/windows.gz
0.1.0-22/windows.gz
0.1.0-24/windows.gz
0.1.0-26/windows.gz
```

and the same tag pattern for each supported platform archive.

Build Node.js LTS/even major lines. Odd Node.js majors inside the supported
range fall back to the previous even major. Node.js versions below the minimum
supported binary major use the minimum line. Node.js versions above the maximum
supported binary major use the maximum line.

Document supported platform and Node-major binary limits in the root README
and package READMEs that use this policy.

## Consequences

The existing `@node-3d/addon-tools` archive layout can remain unchanged.

Release workflows for affected packages need a matrix over both platform and
Node.js major.

Install scripts for affected packages must compute the release tag from the
runtime Node.js version before calling the shared installer.
