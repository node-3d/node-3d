# 0009 - uv-loop Shared Idle Pump

## Status

Accepted.

## Context

`@node-3d/uv-loop` exists to isolate direct libuv scheduling in one small
package. Early handle-per-consumer native designs added lifecycle complexity
without improving the benchmarked frame-loop behavior.

The package needs a public API that feels familiar to Node.js users while
keeping the native implementation small.

## Decision

Use one module-level native `uv_idle_t` pump for the lifetime of the module.
The pump starts during module initialization, starts unref'd, and does not stop
during normal runtime.

Expose public idle handles from TypeScript. `setIdle()` and `setIdleLoop()`
return object handles with Node timer-style methods:

- `ref()`
- `unref()`
- `hasRef()`

Keep native global `ref()` and `unref()` control private to the TypeScript
implementation. TypeScript tracks per-handle ref state and translates it to the
single shared native pump.

## Consequences

The native binding surface stays intentionally small.

Consumers get per-handle lifecycle semantics similar to Node.js timers without
forcing the native addon to allocate and destroy a libuv handle for every
consumer.

Packages that compose `@node-3d/uv-loop`, such as `@node-3d/glfw`, should rely
on `uv-loop` handle ref accounting unless they have a separate lifecycle reason
to count active work themselves.
