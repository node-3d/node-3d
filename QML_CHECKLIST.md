# QML View Destruction Mitigation Checklist

This checklist turns the findings in `QML_REPORT.md` into an implementation and
validation sequence for the current Node3D packages.

The primary scope is `@node-3d/qml` and its native dependency,
`@node-3d/deps-qmlui`. `@node-3d/core` is not part of the reproducer or the
initial fix. `@node-3d/plugin-qml` is a later, lower-priority consumer and
resource-ownership follow-up.

## Contract and scope

- [ ] Treat the Contract Gate as **YES** throughout this work.
- [ ] Record the affected contracts:
  - `@node-3d/deps-qmlui`: Qt event delivery, QObject ownership, native
    teardown, and binary contents.
  - `@node-3d/qml`: `View.destroy()`, load-queue behavior, lifecycle events,
    and consumer update obligations.
  - `@node-3d/plugin-qml`, later: consumption of the QML lifecycle event and
    cleanup of plugin-owned listeners and Three.js resources.
- [ ] Keep `@node-3d/core` out of the package-local reproducer and initial
  mitigation.
- [ ] Preserve all unrelated root and submodule changes.
- [ ] Do not commit, push, tag, create releases, or publish without the
  authorization required by `AGENTS.md`.

## 1. Reproduce in `@node-3d/qml`

### Package-local reproducer

- [ ] Add a package-local reproducer under `packages/qml/test/` that uses the
  public `@node-3d/qml` API and does not initialize Core or plugin-qml.
- [ ] Initialize `View` directly with the minimum native inputs supported by
  the existing qml package tests.
- [ ] Use an inline QML scene large enough to make retained item trees visible
  in RSS, including a `Repeater`, rectangles, and text items.
- [ ] Run at least 12 create/load/destroy cycles and exclude at least the first
  two warm-up cycles from the reported mean.
- [ ] Pump `View.update()` while loading and between lifecycle transitions.
- [ ] Print RSS before creation, while alive, immediately after `destroy()`,
  and after the requested cleanup update.
- [ ] Support a diagnostic mode that intentionally ignores the cleanup request
  so the fixed and unfixed behavior can be compared.
- [ ] Keep the reproducer repository-only and exclude it from `dist`, npm
  package contents, and runtime dependencies.

### Reproduction cases

- [ ] Destroy a fully loaded, item-heavy view.
- [ ] Destroy a view containing only an empty root `Item`.
- [ ] Destroy a view created without a custom source.
- [ ] Destroy before the system/custom scene finishes loading.
- [ ] Destroy while the view is waiting behind another view in the JS load
  queue.
- [ ] Repeatedly call `load()` on one view before destroying it.
- [ ] Exercise QML-side deferred destruction, such as dynamic `destroy()` or a
  `Loader` releasing its item.
- [ ] Call `destroy()` twice and confirm that it remains harmless.
- [ ] Destroy the last view and stop ordinary update pumping immediately, then
  confirm that the new cleanup notification still enables a final drain.

### Baseline evidence

- [ ] Capture the current Windows x64 RSS growth per cycle.
- [ ] Capture VRAM growth where the test environment exposes a reliable
  measurement.
- [ ] In a diagnostic native build, connect `QObject::destroyed` for:
  - the custom root item;
  - the system root item;
  - the custom and system components;
  - the `QQmlEngine`;
  - the `QQuickWindow`;
  - the `QQuickRenderControl`;
  - the callback wrapper.
- [ ] Record which destruction signals are absent before applying the fix.
- [ ] Keep temporary diagnostic logging out of the final release build unless
  it becomes a deliberate debug facility.

## 2. Fix deferred deletion and ownership in `deps-qmlui`

### Event delivery

- [ ] Update `QmlUi::update()` in `src/qt/qml-ui.cpp` to call
  `QCoreApplication::sendPostedEvents(nullptr, QEvent::DeferredDelete)` after
  `QCoreApplication::processEvents()`.
- [ ] Add the required Qt event include explicitly rather than relying on a
  transitive include.
- [ ] Add a source comment explaining that the embedding never enters
  `QCoreApplication::exec()` or `QEventLoop::exec()`, so `processEvents()` alone
  does not drain deferred deletion.
- [ ] Confirm that the flush applies on every supported platform.

### Root-object ownership

- [ ] In `QmlView::~QmlView()`, schedule `_customItem` for deletion when
  present, then clear the pointer.
- [ ] Schedule `_systemItem` for deletion when present, then clear the pointer.
- [ ] Add null guards for `_customComponent`, `_systemComponent`,
  `_renderControl`, `_offscreenWindow`, `_qmlEngine`, and `_framebuffer` where
  partial initialization makes them optional.
- [ ] Clear non-owning pointers such as `_systemRoot` and `_systemError` during
  teardown so they cannot be used after teardown starts.
- [ ] Preserve the existing render-control/window teardown order for the first
  focused fix unless targeted testing proves a different order is required.
- [ ] Verify the teardown order with the GL context current and confirm that
  scene-graph resources are released before their required context/surface is
  unavailable.

### Callback and thread lifetime

- [ ] Ensure the `QmlCb` wrapper remains alive until the QML roots, components,
  and engine can no longer call it.
- [ ] Prefer deferring the callback wrapper after the other QML-owned objects;
  do not leave the engine holding a wrapper for an immediately deleted QObject.
- [ ] Verify that the native `_uis` map rejects callbacks from a destroyed
  `QmlUi` without dereferencing the stale owner key.
- [ ] Replace the silent foreign-thread return in `QmlView::~QmlView()` with a
  visible diagnostic.
- [ ] Enforce or marshal teardown to the owning Qt thread before deleting
  thread-affine Qt objects.
- [ ] Add a focused test or diagnostic case for the chosen foreign-thread
  behavior.

### Destruction strategy

- [ ] Keep Qt object cleanup deferred rather than deleting QObjects
  synchronously from `View.destroy()`.
- [ ] Test destruction initiated from a QML-originated JS event handler to prove
  that the fix does not delete an object while Qt is delivering its event.
- [ ] Confirm that deferred cleanup completes on the next safe `View.update()`
  drain.

## 3. Add the qml cleanup-request event

`update-required` is the working public event name. Confirm the name and payload
before implementation, but preserve the behavior described below.

### Event contract

- [ ] Confirm the final public name: proposed `update-required`.
- [ ] Define a typed payload, initially proposed as
  `{ reason: 'destroy' | 'deferred-delete' }`.
- [ ] Emit the event only when native work has scheduled Qt objects for deferred
  deletion.
- [ ] Deliver the event asynchronously, after the native destroy call returns,
  so a consumer can call `View.update()` without re-entering the native
  destructor.
- [ ] Emit at most one cleanup request for a single successful destruction.
- [ ] Do not emit another request for an idempotent second `destroy()` call.
- [ ] Do not emit a native-cleanup request when a queued JS view is cancelled
  before its native view is constructed.
- [ ] Keep the existing `destroy` event distinct from `update-required`:
  `destroy` reports lifecycle state, while `update-required` requests a host
  action.

### Required consumer action

- [ ] Document that an `update-required` listener must arrange a safe host turn
  or frame that calls `View.update()`.
- [ ] Document that the consumer must restore its own OpenGL context immediately
  after `View.update()` if it shares graphics state with QML.
- [ ] State that the request is especially important when the destroyed view is
  the last view and the normal update loop is about to stop.
- [ ] State that the event does not replace regular `View.update()` calls needed
  for QML async work, timers, rendering, and QML-side deferred deletion.
- [ ] Include a minimal direct-`@node-3d/qml` example that handles the event
  without importing Core or plugin-qml.

### Event tests

- [ ] Assert that the notification happens after native `_destroy()` returns.
- [ ] Assert that calling `View.update()` from the scheduled handler drains the
  native deferred deletes.
- [ ] Assert event count and ordering relative to `destroy`.
- [ ] Assert that repeated `destroy()` remains silent and harmless.
- [ ] Assert that cancelling a not-yet-constructed queued view does not request
  unnecessary native cleanup.

## 4. Harden `@node-3d/qml` JS lifecycle behavior

### Load queue

- [ ] Remove a destroyed view from `queueLoading` immediately.
- [ ] Clear its load timeout immediately.
- [ ] If it was the active queue entry, advance the next queued view without
  waiting for the old timeout.
- [ ] Prevent `createView()` from constructing a native view after the JS view
  has been destroyed.
- [ ] Ignore late native load, FBO, input, or error callbacks for a destroyed
  view.
- [ ] Ensure a late callback cannot mark a destroyed view as loaded or block the
  queue.

### Instance state

- [ ] Keep `destroy()` idempotent.
- [ ] Replace the destroyed native binding with the inert binding after native
  destruction.
- [ ] Ensure property access and accidental post-destroy method calls do not
  reach a freed native instance.
- [ ] Decide and document whether post-destroy operations are no-ops or throw a
  consistent JS error.
- [ ] Confirm that the current module-level `viewInstances` map needs no legacy
  `__instances` workaround.

### JS tests

- [ ] Add focused tests for destroy before native construction.
- [ ] Add focused tests for destroy during load.
- [ ] Add focused tests for destroy after load.
- [ ] Add focused tests for two queued views when the first is destroyed.
- [ ] Add focused tests for late callbacks after destroy.
- [ ] Add focused tests for repeated destroy.
- [ ] Keep native-runtime assertions separate from pure queue/event assertions
  where practical so failures identify the responsible layer.

## 5. Follow up in `@node-3d/plugin-qml` at lower priority

Do this only after the qml/deps-qmlui contract and tests are stable.

### Consume the qml event

- [ ] Subscribe plugin-managed views to the finalized `update-required` event.
- [ ] On notification, schedule `View.update()` and then call the plugin's
  `release()`/`doc.makeCurrent()` context restoration.
- [ ] Avoid re-entering `View.update()` when destruction occurs inside an
  existing QML update callback.
- [ ] Keep the current normal-frame order:
  `View.update()` -> restore document context -> consumer callback.
- [ ] Test destroying the last plugin-managed view immediately before stopping
  the plugin loop.

### Dispose plugin-owned resources

- [ ] Give `QmlOverlay` a teardown path that calls `View.destroy()`.
- [ ] Store named resize and input listener functions instead of unremovable
  anonymous closures.
- [ ] Remove every listener registered on `doc` during overlay teardown.
- [ ] Dispose overlay geometry.
- [ ] Dispose the overlay material and wrapper texture state that the overlay
  owns.
- [ ] Detach internal `reset`, error, and cleanup-request listeners after their
  final required work completes.
- [ ] Keep resource ownership explicit so caller-owned Three.js objects are not
  disposed by the plugin.
- [ ] Add repeated overlay create/destroy coverage independently of the native
  `View` reproducer.

## 6. Synchronize documentation and release artifacts

### Documentation

- [ ] Update `packages/qml/README.md` with:
  - the regular `View.update()` requirement;
  - the `update-required` event and payload;
  - the required cleanup response;
  - GL-context restoration guidance;
  - next-safe-update resource reclamation semantics.
- [ ] Update public TypeScript event types and declarations.
- [ ] Update `deps-qmlui/include/qml-ui.hpp` comments so native consumers know
  that `update()` also drains deferred deletion.
- [ ] Later, update `packages/plugin-qml/README.md` to describe its automatic
  handling and overlay disposal behavior.
- [ ] Decide whether the cross-package event/update convention is durable and
  broad enough to require an ADR; if so, add the ADR and update
  `docs/adr/README.md`.

### Binary and package coordination

- [ ] Build a candidate `deps-qmlui` binary from the changed source for each
  validation platform.
- [ ] Test `@node-3d/qml` against that candidate binary rather than the old
  binary selected by the current `deps-qmlui/install.js` tag.
- [ ] Confirm that the `QmlUi` ABI remains unchanged; if it does, document that
  `qml.node` does not require an ABI-driven rebuild, while still rebuilding it
  in CI for source compatibility validation.
- [ ] When authorized for release work, create a new `deps-qmlui` binary tag and
  assets before changing `install.js` to select that tag.
- [ ] Update the `@node-3d/qml` dependency/lock state to the fixed
  `@node-3d/deps-qmlui` release.
- [ ] Release the qml JS lifecycle/event changes separately from the later
  plugin cleanup where practical.
- [ ] Update root submodule pointers and relevant root/package lockfiles only
  after package commits exist.
- [ ] Do not publish npm packages from the agent session; provide the intended
  authenticated publish commands to the user when the release is ready.

## 7. Validation gates

### Native correctness

- [ ] Confirm all instrumented Qt destruction signals fire once per destroyed
  view.
- [ ] Confirm custom and system root item trees are destroyed.
- [ ] Confirm the engine, window, render control, components, and callback
  wrapper are destroyed.
- [ ] Confirm no null dereference when destroying an empty, unloaded, or
  already-unloaded view.
- [ ] Confirm no QObject thread-affinity warnings or silent leaks.
- [ ] Confirm stderr contains no double-delete, already-deleted, scene-graph, or
  GL-context warnings.

### Memory and graphics behavior

- [ ] Demonstrate bounded post-warm-up RSS across repeated qml-only
  create/load/destroy cycles on Windows x64.
- [ ] Demonstrate no repeated per-cycle VRAM growth on Windows x64.
- [ ] Repeat the qml-only lifecycle test on Linux x64 to catch platform-neutral
  regressions.
- [ ] Record exact measurements and thresholds; do not describe an RSS smoke
  test as proof of object destruction without the destruction evidence.

### Functional behavior

- [ ] Run the focused `@node-3d/deps-qmlui` checks.
- [ ] Build and run the focused `@node-3d/qml` type, lint, unit, and native
  runtime checks.
- [ ] Verify QML load, render texture creation, property get/set, method invoke,
  input delivery, resize, reload, and destroy behavior.
- [ ] Verify destruction initiated from a QML-originated event handler.
- [ ] Verify cleanup after the ordinary host loop has stopped.
- [ ] Later, run plugin-qml input, screenshot, loop-order, context-sharing, and
  repeated-overlay teardown tests.

### Packed consumer gate

- [ ] Pack the candidate packages without including tests, examples, native
  build folders, or other repository-only files.
- [ ] Install the packed tarballs in an isolated consumer with lifecycle scripts
  enabled and no workspace links or source-tree access.
- [ ] Load the public `@node-3d/qml` entrypoint.
- [ ] Run the qml-only create/load/destroy reproducer against the packed
  packages.
- [ ] Confirm that the installed binary came from the intended new release tag.
- [ ] Run the packed consumer gate on fresh Windows x64 and Linux x64 runners
  after candidate native archives are available as workflow artifacts.

## Completion report

- [ ] State exactly which contracts changed.
- [ ] Name the source files, tests, documentation, and any ADR that now own the
  behavior.
- [ ] Report every validation actually run and its result.
- [ ] Report relevant validation not run and why.
- [ ] Report remaining dirty state in the root and affected package
  repositories.
- [ ] Report the final `deps-qmlui`, `qml`, and later `plugin-qml` submodule
  commits and root pointers when authorized commits exist.
- [ ] Keep release/tag/publish status explicit and separate from source
  completion.
