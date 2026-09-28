# deps-qmlui / qml-raub: a destroyed View is never freed on Windows (report v2, self-contained)

Hi Luis (and your assistant). This is version 2 of the report: everything is in this one file — root causes,
a standalone reproducer (no code of ours, only `3d-core-raub` + `3d-qml-raub`), numbers, the full patch.
Found in Space Simulation Toolkit (SST): node 22.14, Windows 10, NVIDIA, Qt 6.8.0, `deps-qmlui` at `47501cb`
(the 2024-12-27 release build), `qml-raub` 2.0.1-line of the same date, `3d-qml-raub`. The code in question is
unchanged on `master` (5.0.1) as of 2026-09-20, so the bugs are still there.

What changed since v1: a **second leak** in `~QmlView()` (the root items are never deleted — it was hiding behind
the first one), the standalone reproducer, the `release()` note, a small `qml-raub` JS bug, how to run on node 22.

## Symptom

`new View(...)` → `load(...)` → `view.destroy()` frees **nothing**. In our app every world reload creates a
fresh View and destroys the old one: the process grows by ~230 MB RSS (~275–300 MB private bytes) and
~15–30 MB of VRAM per reload until `RangeError: Array buffer allocation failed` / a crash around the 20th reload.
Inside a living UI the same applies to everything QML deletes on its own (`destroy()`, `Loader`, list delegates).

## Root causes

1. **`deleteLater()` is never delivered.** `QmlView::~QmlView()` (src/qt/qml-view.cpp) releases everything with
   `deleteLater()`: `_renderControl`, `_offscreenWindow` (the QQuickWindow), both components, `_qmlEngine`;
   `QmlView::unload()` does the same with `_customItem` / `_customComponent`; QML itself uses `deleteLater()` for
   `destroy()` etc. There is no `QEventLoop::exec()` anywhere — the embedding never enters a Qt event loop. Per the
   Qt docs (QObject::deleteLater / QCoreApplication::processEvents): when you drive Qt with `processEvents()` from
   a local loop, **DeferredDelete events are not processed**. In `QCoreApplicationPrivate::sendPostedEvents` an
   event posted at loop level 0 is only delivered when `event_type == QEvent::DeferredDelete` is requested
   explicitly. `QmlUi::update()` is just `QCoreApplication::processEvents()`, so it never delivers them.
2. **On Windows `QmlUi::update()` is never called at all**: `3d-qml-raub/js/index.js` wraps `core.loop` with
   `View.update()` only under `process.platform === 'linux'`. On Windows Qt events are pumped by the native
   window message loop (QEventDispatcherWin32 via GLFW's PeekMessage/DispatchMessage), which, again, never
   delivers DeferredDelete at loop level 0. Net effect of 1 + 2: not a single `deleteLater()` in the process
   ever executes.
3. **`~QmlView()` never deletes the root items.** `_customItem` and `_systemItem` come from
   `QQmlComponent::create()` and have **no QObject parent** — `setParentItem()` sets the visual parent only.
   Neither the QQuickWindow nor the QQmlEngine deletes them, and `~QmlView()` does not touch them (only
   `unload()` deletes `_customItem`). So even with 1 + 2 fixed the whole item tree of every destroyed View stays:
   in the reproducer below that is 18.6 of the 21.7 MB per cycle. Also `_customComponent->deleteLater()` there is
   called without a null check (it is null after `unload()`).

## Standalone reproducer

Save as `repro-view-leak.js` in any folder where `3d-core-raub` and `3d-qml-raub` are installed.

```
node --no-experimental-global-navigator repro-view-leak.js            # nobody calls View.update() (Windows default)
node --no-experimental-global-navigator repro-view-leak.js --update   # the host calls View.update() every frame
```

`--no-experimental-global-navigator` is needed on node 21+: node defines a read-only `global.navigator` there and
`3d-core-raub` fails to install its own (without the flag the script dies at `init3dCore`).

```js
// Reproducer: a destroyed qml-raub View is never freed (deleteLater() never runs, root items never deleted).
//   node repro-view-leak.js            - stock behaviour: nobody calls View.update() on Windows
//   node repro-view-leak.js --update   - the host calls View.update() + release() once per frame
// Node 22+: add --no-experimental-global-navigator (3d-core-raub defines its own global.navigator).
// Prints RSS (MB) after every create / destroy cycle; the verdict is the mean growth per cycle.
'use strict';
const init3dCore = require('3d-core-raub');
const { doc, loop, qml } = init3dCore({ plugins: ['3d-qml-raub'], width: 640, height: 360, title: 'repro-view-leak' });
const { View } = qml;

const UPDATE = process.argv.includes('--update');
const CYCLES = 12, ALIVE_MS = 1500, REST_MS = 1500;
// a QML scene heavy enough to be seen in RSS: 3000 items with text
const SOURCE = 'import QtQuick 2.7\nItem { width: 1600; height: 900\n Repeater { model: 3000\n'
	+ '  Rectangle { x: (index % 60) * 26; y: Math.floor(index / 60) * 18; width: 24; height: 16; color: "#335"\n'
	+ '   Text { anchors.centerIn: parent; text: index; color: "white"; font.pixelSize: 8 } } } }\n';

const rss = () => Math.round(process.memoryUsage().rss / 1048576);
let view = null, cycle = 0, t0 = Date.now(), phase = 'rest', rss0 = 0;

loop(() => {
	if (UPDATE) { View.update(); qml.release(); }
	const now = Date.now();
	if (phase === 'rest' && now - t0 > REST_MS) {
		if (cycle === 2) rss0 = rss();   // the first two cycles warm the caches up
		if (cycle === CYCLES) {
			const per = (rss() - rss0) / (CYCLES - 2);
			console.log(`mode ${UPDATE ? 'update' : 'stock'}: mean growth ${per.toFixed(1)} MB per cycle over ${CYCLES - 2} cycles`);
			process.exit(0);
		}
		view = new View({ width: 1600, height: 900, silent: true, source: SOURCE });
		phase = 'alive'; t0 = now;
	} else if (phase === 'alive' && now - t0 > ALIVE_MS) {
		const before = rss();
		// qml-raub: JsView.destroy() reads View.__instances through the NATIVE class, where it is undefined
		// ("Cannot read properties of undefined") - mirror it there; harmless on versions without that bug
		const NativeView = Object.getPrototypeOf(View.prototype).constructor;
		if (NativeView && !NativeView.__instances) NativeView.__instances = View.__instances;
		view.removeAllListeners(); view.destroy(); view = null;
		console.log(`cycle ${cycle}: alive ${before} MB, after destroy() ${rss()} MB`);
		cycle++; phase = 'rest'; t0 = now;
	}
	doc.makeCurrent();
});
```

Measured with it (Windows 10, node 22.14, Qt 6.8.0; mean RSS growth, MB per create / destroy cycle):

| `qmlui.dll` | no flag | `--update` |
|---|---|---|
| stock (47501cb) | +21.7 | +21.7 (`update()` = `processEvents()` only) |
| + DeferredDelete flush in `update()` (patch part 1) | +21.7 | +18.6 (view + engine freed, root items still leak) |
| + root items deleted in `~QmlView()` (patch part 2) | +21.7 | **+0.5…1.0** |

With an empty scene (`Item { }`) the View itself costs +1.7 (stock) → 0.0 (part 1 + `--update`). With part 1
only, loading an empty source right before `destroy()` (it runs `unload()` → `_customItem->deleteLater()`)
gives +2.8 — that is how root cause 3 was isolated.

## Evidence from the app

- Instrumented build (fprintf in `~QmlView()` + `QObject::destroyed` on the engine and the window):
  `~QmlView enter` fires on every `destroy()`, `QQmlEngine destroyed` / `QQuickWindow destroyed` — never (stock),
  6 / 6 (patched). A call counter in `QmlUi::update()` stays at 0 on Windows.
- Address-space walk (VirtualQueryEx) across reloads: growth is ~8 fully committed NT-heap segments of 0xFD0000
  bytes per reload, all owned by the process default heap (CRT malloc) + ~32 MB of `PAGE_WRITECOMBINE` regions
  (GPU driver — the scene graph's GL resources, matches the VRAM growth). Leaked segments contain QString payloads
  of `set()` calls and GLSL source.
- Whole app, RSS per world reload (a large UI: ~10 windows, charts, lists), MB:

  | build | per reload | VRAM per reload |
  |---|---|---|
  | stock | +230 | +15…30 |
  | patch part 1 + `View.update()` per frame | +103…120 | 0 |
  | patch parts 1 + 2 + `View.update()` per frame | +106, +60, +29, +22, +28, +9 (settles at ~+20) | 0 |

  Our UI test gates (3 suites, 212 checks: windows, charts, hover / click, reloads) pass on the fully patched DLL;
  stderr is clean — no "object already deleted" fallout.

## Fix (what we run now)

```diff
--- a/src/qt/qml-ui.cpp
+++ b/src/qt/qml-ui.cpp
@@ void QmlUi::update() {
     QCoreApplication::processEvents();
+	// No QEventLoop::exec() in this embedding: without an explicit flush DeferredDelete events are
+	// never delivered, so every deleteLater() (the view in ~QmlView(), unload(), QML destroy()) leaks.
+	QCoreApplication::sendPostedEvents(nullptr, QEvent::DeferredDelete);
 }
--- a/src/qt/qml-view.cpp
+++ b/src/qt/qml-view.cpp
@@ QmlView::~QmlView() {
     // Delete the render control first since it will free the scenegraph resources.
     // Destroy the QQuickWindow only afterwards.
+	// The root items come from QQmlComponent::create() and have no QObject parent (setParentItem() is the
+	// visual parent only): neither the window nor the engine deletes them, so the whole item tree leaked here.
+	if (_customItem) {
+		_customItem->deleteLater();
+		_customItem = nullptr;
+	}
+	if (_systemItem) {
+		_systemItem->deleteLater();
+		_systemItem = nullptr;
+	}
     _renderControl->deleteLater();
     _offscreenWindow->deleteLater();

     // Now that scene is clear (no component based items) - delete the components
-	_customComponent->deleteLater();
+	if (_customComponent) {
+		_customComponent->deleteLater();
+	}
     _systemComponent->deleteLater();
```

The ABI of `QmlUi` does not change — only `qmlui.dll` is rebuilt, `qml.node` stays as is.

**Host side: `View.update()` once per frame on every platform, followed by `release()`.** We do it from the app:

```js
const { qml } = core;            // 3d-core-raub + 3d-qml-raub
qml.View.update();               // processEvents() + the DeferredDelete flush
qml.release();                   // = doc.makeCurrent()
```

`release()` right after `update()` matters: `processEvents()` may render QML and deleting Qt objects makes Qt's
GL context current (`~QmlView()` does `makeCurrent` / `doneCurrent`, the scene graph cleanup too) — without
handing the context back the host's next GL calls land in the wrong context. Your linux branch in
`3d-qml-raub/js/index.js` already has exactly this order (`View.update(); release(); cb();`); the proper fix is
to drop the `linux`-only condition there — `processEvents()` is harmless next to the native message pump.

## Smaller things found on the way

- **`qml-raub` JS: `JsView.destroy()` throws.** `destroy()` reads `View.__instances[this._index]`, but inside the
  class body `View` resolves to the NATIVE class, where `__instances` is undefined →
  `TypeError: Cannot read properties of undefined`. So `view.destroy()` cannot be called at all without the
  mirror hack you see in the reproducer (`NativeView.__instances = View.__instances`). Fix: reference the JS
  class (or `this.constructor.__instances`).
- `~QmlView()`: consider deleting synchronously instead of `deleteLater()` (items → render control → window →
  components → engine, with the GL context current) — then a destroyed View is freed even if the host never
  calls `update()` again.
- The early `return` on a foreign thread in `~QmlView()` leaks everything silently — at least log it.
- Document that the host must call `View.update()` every frame, on all platforms.
- Packaging: the npm package labelled `deps-qmlui-raub` 2.0.0 that we have carries the binaries of the 4.0.0
  line (exports `init2` etc.); the git tag `v2.0.0` is the 2019 Qt 5 code and does not match them. The matching
  source is commit `47501cb`.

## Side note (not proven to be related)

Rare (~1 %) transient QML load failures on the same stack: `module "QtQuick" plugin "qtquick2plugin" not found`
on the first load of a process, and `ListModel is not a type` / `Type X unavailable` on later Views. With the bugs
above every old QQmlEngine stayed alive forever, sharing the type registry / plugin loader with the new one —
we will re-measure the failure rate with the fix and report back.
