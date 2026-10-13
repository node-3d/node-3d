# GSOM prototype refactor checklist (temporary)

Scope: improve the readability of this research game without changing its rules,
controls, assets, or supported run commands. Keep `demo.ts` as the entry point and
keep `model.ts` free of native, rendering, and network imports. This is a working
checklist, not a new package architecture or release plan.
The sections follow the requested priority order: earlier review items 1, 2,
5, 4, then 3. Item 3 (replay) is a decision/documentation task by default.

## 1. Make `demo.ts` an understandable entry point

- [x] Identify the current startup order and the values shared among world setup,
      presentation, input, networking, and the frame loop.
- [x] Extract world construction and Bullet collision setup to `world.ts`. Return
      the scene objects and collision resolver that the entry point needs.
- [x] Extract actor synchronization, HUD updates, and event-driven sound to
      `presentation.ts`, with explicit `update(state, events)` and cleanup where
      needed. Keep rendering state out of `Game`.
- [x] Leave CLI parsing, initialization, local input dispatch, the fixed-step
      loop, and host/guest orchestration visible in `demo.ts`. Add small named
      functions there when they clarify the loop; avoid a framework or generic
      service container.
- [x] Confirm `node research/gsom/demo.ts --no-audio` starts and all existing
      capture modes still work.

## 2. Use one room layout for visuals and collision

- [x] Add a typed, engine-independent `layout.ts` containing the static solids
      (size and position), room enemy spawn points, and any shared bounds.
- [x] Build the relevant Three.js meshes and Bullet shapes from those solids;
      keep purely decorative assets separate from collision geometry.
- [x] Have `model.ts` read spawn points and bounds from the same layout data
      without importing Three.js or Bullet.
- [x] Check that crates and walls still align visually with collision after the
      data move. Retain the current movement response for this pass.

## 3. Move research automation out of the play loop

- [x] Put phase setup, scripted room clearing, screenshot/telemetry writing, and
      automated co-op actions in `capture.ts` or a similarly named research
      driver. Keep its calls from `demo.ts` short and explicit.
- [x] Keep normal input handling separate from scripted inputs; the driver should
      use the same command path where possible.
- [x] Run all six capture phases and `coop-harness.ts`; check the existing JSON
      assertions and inspect representative images. These are native/visual
      checks, so record exactly which were actually run.

## 4. Tighten the small co-op boundary

- [x] Keep `network.ts` as the transport adapter. Extract packet parsing and
      validation into named helpers so `poll()` reads as connection handling,
      input delivery, and snapshot delivery.
- [x] Validate the snapshot fields consumed by the guest view before replacing
      its current state; reject malformed packets without crashing rendering.
- [x] Detect a gap in journal sequence numbers. Choose a small policy (request a
      fresh event range, or explicitly mark missed effects and continue); do not
      imply the latest-64-event window guarantees delivery.
- [x] Add focused tests for malformed packets and an event gap, then rerun the
      local two-process co-op harness. LAN latency/reconnect work remains outside
      this readability pass.

## 5. Decide what “replay” promises

- [x] Document the current distinction: `replay()` simulates recorded commands
      with a new `Game`; captured snapshots and journals are inspection output,
      not inputs to that simulation.
- [x] If recordings remain pure-model demonstrations only, say so in README and
      leave the implementation alone. Snapshot playback could be a separate
      feature later; it does not need collision queries because it displays
      recorded state rather than recomputing it.

Future requirement only: if command replay must reproduce a live session where
Bullet blocked movement, provide the same collision resolver during replay (or
record resolved movement) and add a collision-constrained replay case.

## Completion checks

- [x] `node node_modules/typescript/bin/tsc --project research/gsom/tsconfig.json`
- [x] `node --test research/gsom/model.test.ts`
- [x] Run only the native probes/captures affected by the edits and report what
      was observed versus what was not exercised.
- [x] Update README/RESULTS only for changed architecture or validated claims.
- [x] Leave generated `captures/` and `records/` out of source control.
