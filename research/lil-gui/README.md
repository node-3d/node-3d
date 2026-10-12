# lil-gui-style controls for Node3D: research

## Goal

Make the control panels in Three.js examples straightforward to adapt to Node3D.
Many Three.js examples use [lil-gui](https://lil-gui.georgealways.com/) to bind
sliders, checkboxes, colors, buttons, and folders to JavaScript objects. lil-gui
renders these controls with the browser DOM. Node3D's browser-like runtime does
not provide a general HTML/CSS DOM, so this research tests a native-rendered
replacement with a similar _consumer API_.

This directory is a research area in the root superproject. It is not an npm
workspace, package, supported example, or decision to adopt Dear ImGui.

**Status:** A Windows x64 prototype now builds and runs. See [RESULTS.md](RESULTS.md)
for captures and measurements, and [PARITY.md](PARITY.md) for the lil-gui and
Three.js example compatibility audit. [EXAMPLE-BROWSER.md](EXAMPLE-BROWSER.md)
records the dynamic upstream example loading experiment.
The decoder worker experiment is in [DECODER-WORKERS.md](DECODER-WORKERS.md).
The current runnable subset and outstanding example groups are in
[COMPATIBILITY-CLUSTERS.md](COMPATIBILITY-CLUSTERS.md).
The source audit of omitted HTML and DOM use is in [DOM-AUDIT.md](DOM-AUDIT.md).
The separate game UI experiment against the QML FPS example is in
[GAME-UI.md](GAME-UI.md).

## Working hypothesis

Dear ImGui may be a suitable renderer behind a small, retained controller model:

1. TypeScript creates controllers once through a lil-gui-like API, such as
   `gui.add(params, 'speed', 0, 10).onChange(callback)`.
2. Native code owns the ImGui context, controller descriptors, and ImGui calls
   during each frame. ImGui pointers and transient structures remain native.
3. TypeScript owns the JavaScript objects and callbacks. Values needed for a
   frame cross the boundary in a batch; changes return in a batch and update
   the corresponding object properties and callbacks.

The prototype tests whether this retained bridge gives acceptable behavior and
cost. A call-for-call ImGui binding is outside this research target.

## Compatibility target

Start with the lil-gui usage common in Three.js examples:

| Consumer feature                               | Prototype question                                                                |
| ---------------------------------------------- | --------------------------------------------------------------------------------- |
| `add(object, property, min?, max?, step?)`     | Do number, boolean, string, and function controllers behave as expected?          |
| `add(object, property, options)`               | Can dropdown labels and values round-trip without exposing native pointers?       |
| `addColor(object, property)`                   | Which Three.js example color formats need faithful read/write behavior?           |
| `addFolder(title)`                             | Are nested folders, labels, and open state stable?                                |
| `.name()`, `.onChange()`, `.onFinishChange()`  | Do callbacks fire with useful values and correct timing?                          |
| `.listen()`, `.setValue()`, `.updateDisplay()` | Can external JavaScript changes reach the panel without per-control native calls? |

This is a compatibility _subset_. DOM access (`domElement`), CSS styling, and
browser placement cannot be mapped directly to a native overlay. Any examples
that depend on them need to be identified rather than silently approximated.

## Running the prototype

From `research/lil-gui`, with the root workspace dependencies already installed:

```powershell
node ../../node_modules/node-gyp/bin/node-gyp.js rebuild
node examples/crate-controls.ts
node examples/fog-controls.ts
node examples/bridge-probe.ts
node examples/parity-probe.ts
node examples/three-hemisphere.ts
node examples/three-indexed.ts --capture=captures/three-indexed.png
node --import ./runtime-loader.ts examples/three-indexed-auto.ts --capture=captures/three-indexed-auto.png --verify-panel
node examples/benchmark.ts 200
node example-browser-app.ts
node examples/fps-game-ui.ts
node examples/world-ui.ts
node examples/event-flow-probe.ts
node example-browser.ts list
node example-browser.ts browse
node examples/decoder-probe.ts
```

`examples/bridge-probe.ts` emits Node3D's typed window events, which use the
same event stream as GLFW callbacks. See [EXAMPLE-COMPARISON.md](EXAMPLE-COMPARISON.md)
for the direct Three.js baseline and runtime preload experiment.
The indexed examples verify raw framebuffer pixels across the panel before
saving each PNG and a smaller `-panel.png` crop for visual inspection.

The examples use package imports for Node3D and Three.js. The compiled addon and
image captures are ignored generated files. Vendored Dear ImGui sources are
pinned to [v1.92.5](https://github.com/ocornut/imgui/releases/tag/v1.92.5),
with its license at [vendor/imgui/LICENSE.txt](vendor/imgui/LICENSE.txt).

`example-browser-app.ts` is the clickable browser: search or scroll the full
catalog, click a page, and see either its scene in a separate window or a
reason in the browser. The `example-browser.ts` commands remain diagnostics.

## Experiments

1. **Example census:** Select representative upstream Three.js examples with a
   simple parameter panel, folders/colors, and externally changing values. Record
   their lil-gui calls and the edits required to run on Node3D.
2. **Minimal native overlay:** Render one controller panel over a Node3D/Three.js
   scene through the existing GLFW/OpenGL context. Verify frame order, GL state,
   input capture, high-DPI sizing, and cleanup after window-mode changes.
3. **Retained bridge:** Define controllers once; exchange primitive values and
   change events in batches. Keep JavaScript object references and callbacks out
   of native storage. Test `.listen()` and externally modified properties.
4. **Compare costs:** Measure frame time, allocations, and JS/native call counts
   for representative panels (for example 10, 50, and 200 controls), both idle
   and while editing. Compare against a direct per-widget binding as a baseline
   if one is implemented. Report the scene-only baseline separately.
5. **Adapt examples:** Port the selected panels using consumer-style imports.
   Record API differences, visual limitations, and runtime behavior on each
   platform actually tested.

## Decision criteria

Promotion is worth considering only if representative example panels can be
ported with small, documented changes; interaction and rendering work reliably;
the bridge has a measured acceptable frame cost for this use case; and the
native lifecycle is manageable across Node3D's supported platforms. Record
failed cases and measurements here before recommending a standalone repository
or npm package. The user will make that promotion decision.

## Evidence

- The installed Three.js dependency includes a lil-gui module, and the
  [Three.js manual](https://threejs.org/manual/pages/scenegraph.html) uses its
  object/property controller pattern.
- [lil-gui's API](https://lil-gui.georgealways.com/) documents the controller
  methods above and describes its DOM-based panel.
- Node3D exposes a GLFW window handle and native OpenGL context through
  `@node-3d/glfw` and `@node-3d/core`; [Dear ImGui's GLFW/OpenGL integration](https://github.com/ocornut/imgui/wiki/Getting-Started)
  provides a plausible starting point.
- The Windows x64 prototype renders a panel over two live Node3D/Three.js
  scenes and verifies a button and checkbox change through the native-to-JS
  bridge. Initial measurements are in [RESULTS.md](RESULTS.md).
