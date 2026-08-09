# 0013 - Frame Pacing and Real-Time Callbacks

## Status

Accepted.

## Context

Node3D rendering needs stable visual cadence in windowed, borderless, and
fullscreen modes. Relying only on JavaScript timers, recursive `setImmediate`,
or native driver swap blocking produced visible jitter in GLFW-backed examples.
The worst cases showed alternating very short and very long frame gaps,
especially under compositor-managed presentation and input-event load.

Experiments with DWM flushing, native swap interval variants, and synthetic
fixed timestamps showed two separate concerns:

- presentation needs a stable native frame-start gate;
- application callbacks need real elapsed time for input, animation, physics,
  networking, and game logic.

A synthetic fixed timeline can hide visual spikes in passive demos, but it is
the wrong public contract for interactive applications because simulation
state no longer reflects real time.

## Decision

GLFW owns native frame pacing for render callbacks. `@node-3d/uv-loop` supplies
hot-loop opportunities, and GLFW decides whether a frame should actually start.

For `swapInterval` or `vsync` requests:

- `false` and `0` mean unpaced `glfwSwapInterval(0)`;
- `true` maps to the synced path;
- values below zero are normalized to adaptive sync;
- values above zero are normalized to ordinary sync.

Non-zero sync requests use Node3D's native frame-start gate in all window modes.
The native layer samples the intended monitor refresh rate for the window and
does not emit a render callback until the next frame slot is due. Driver swap
sync remains enabled underneath the frame gate: adaptive sync is used where the
window context reports support, otherwise ordinary sync is used.

The refresh rate is captured during window creation and refreshed when the
window's display relationship can change, such as move, resize, and mode
changes. This keeps windowed and borderless pacing aligned with the monitor the
window is actually on without doing monitor selection work on every idle tick.

When a paced frame is not due yet, GLFW returns before polling window events,
running the render callback, or swapping buffers. Event polling is therefore
paced with actual frame attempts instead of happening on every hot idle-loop
turn.

Render callbacks receive the actual monotonic timestamp. Node3D does not feed a
synthetic fixed-period timestamp to application code. Applications that need to
protect simulation from rare long pauses should clamp their own delta or use a
fixed-step accumulator at the game-logic layer.

When rendering work exceeds the target frame period, Node3D does not try to
catch up with burst frames. The application naturally runs at the lower rate
that the workload can sustain.

## Consequences

Windowed, borderless, and fullscreen presentation share one pacing policy.

Interactive scenes use real-time movement and animation, so controls remain
predictable even when the scene cannot hit the monitor refresh rate.

Passive examples can still clamp or smooth their own animation deltas, but that
is an application decision rather than GLFW or core API behavior.

Frame-pacing diagnostics belong in core-authored examples such as
`examples/core/pacing-stress.ts`, not in vendor example folders.
