# 0010 - Direct libuv ABI Policy

## Status

Accepted.

## Context

Node-API gives native addons a stable ABI for the Node addon boundary. It does
not make direct use of Node's embedded libuv ABI stable.

An addon that includes `<uv.h>`, allocates libuv structs, and calls libuv
functions can be sensitive to the Node.js major version it was built against.
If a runtime Node.js embeds a libuv version with incompatible struct layout,
the failure mode can be process memory corruption or a crash.

## Decision

Direct libuv use is allowed when it is required for a package's function, but
such packages should remain sparse and granular.

Direct-libuv addons should use Node-major-specific binary release lines when
the native binary allocates or otherwise depends on libuv ABI-sensitive types.

Runtime mismatch behavior should be warning-and-fallback rather than hard
failure. The package should choose the nearest configured binary line and still
try to run. Consumers using unsupported Node.js versions can rebuild for their
exact runtime when needed.

`@node-3d/uv-loop` must provide a JavaScript stub escape hatch that bypasses
the native binary entirely. The stub is selected through an environment
variable or process argument and uses recursive `setImmediate` scheduling.

## Consequences

Node3D can keep using Node-API for broad addon compatibility while explicitly
handling the narrower cases where direct libuv ABI compatibility matters.

The fallback approach avoids rejecting runtime setups that may work in practice,
while still making the mismatch visible.

The stub path gives CI, diagnostics, and unsupported runtime experiments a way
to bypass direct libuv use.
