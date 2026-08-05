# 0008 - Render Loop Scheduling Policy

## Status

Accepted.

## Context

Node3D render loops that directly poll native window events and swap frames are
sensitive to uneven callback pacing. Recursive `setImmediate` and timer-based
loops can keep the JavaScript event loop operational, but they do not
consistently provide the visual frame stability needed for native desktop 3D
rendering.

An infinite synchronous loop can produce steadier frame pacing, but it prevents
normal JavaScript timers, garbage collection opportunities, and event-loop
progress from functioning normally. That makes it unsuitable as a public
Node3D programming model.

## Decision

Use `@node-3d/uv-loop` as the scheduling primitive for GLFW-backed frame
generation.

`@node-3d/glfw` owns render-loop integration. Applications should normally use
GLFW or `@node-3d/core` loop APIs rather than depend on `@node-3d/uv-loop`
directly for application-level rendering policy.

Non-render-critical work can continue to use Node.js timers, immediates, or
other ordinary JavaScript scheduling.

## Consequences

GLFW frame generation uses a hot native/libuv idle scheduler instead of a
recursive `setImmediate` loop.

Browser-style frame APIs that are implemented on top of GLFW route through
GLFW frame scheduling when they need to swap native frames.

Performance comparison examples should be limited to examples whose purpose is
frame pacing or scheduler comparison; ordinary examples should just use the
current GLFW loop APIs.
