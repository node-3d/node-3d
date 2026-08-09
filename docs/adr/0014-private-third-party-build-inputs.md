# 0014 - Private Third-Party Build Inputs

## Status

Accepted.

## Context

Some native addons need third-party SDKs or binary inputs to compile. The normal
Node3D preference is to make builds reproducible from public sources:

* use system packages or official public installers when CI can fetch them,
* use `deps-*` packages when the third-party license allows Node3D to carry the
  required binaries or headers,
* avoid private build inputs whenever there is a lawful public source.

CUDA is an example of the preferred path: CI can download the required toolkit
from NVIDIA's public distribution path, so no private SDK archive is needed.

Some SDKs do not have an anonymous public download that CI can use, and their
license terms do not allow Node3D to commit or redistribute the SDK archive as a
`deps-*` package. The Steamworks SDK is the prime current example: maintainers
can obtain it under Valve's Steamworks terms, but Node3D must not commit the SDK
zip, publish it to npm, or hide it inside `@node-3d/deps-*`.

## Decision

Private third-party build inputs are a last resort. Use this pattern only when:

* the package cannot reasonably build without the third-party input,
* there is no official anonymous download suitable for CI,
* Node3D is not allowed to redistribute the input in source, npm packages, or
  dependency packages,
* maintainers can provide the input under the upstream vendor's terms.

For such packages:

* do not create a `deps-*` package carrying the private SDK,
* keep the private input under a package-local ignored directory, normally
  `.sdk/`,
* keep the unpacked SDK at a documented deterministic path,
* keep any archive at a documented deterministic path,
* keep path constants in TypeScript as the single source of truth,
* let CI hydrate the local SDK path from repository secrets,
* require a checksum for downloaded private archives,
* do not log private URLs, archive hashes, or other secret material on mismatch,
* accept a generic direct-download URL rather than a vendor-specific storage
  abstraction,
* document exactly which SDK subdirectories are needed for build and runtime
  copying.

For Steamworks specifically, the package expects:

```text
.sdk/steamworks-sdk.gz
.sdk/sdk
.sdk/sdk/public/steam
.sdk/sdk/redistributable_bin
```

The archive should be trimmed to the build and runtime inputs. Steamworks
folders such as `tools` and `steamworksexample` are not needed by the addon
build and should not be included in the private archive.

## Consequences

Private inputs remain outside Git, npm packages, release archives, and public
Node3D dependency packages.

Builds that use this pattern are less convenient than public-source builds, so
the pattern must not be used when an official anonymous download or lawful
`deps-*` package is available.

Repository secrets become part of the maintainer build setup, but the package
source remains forkable: another maintainer can provide an equivalent direct URL
from different private storage as long as the downloaded bytes match the
configured checksum.
