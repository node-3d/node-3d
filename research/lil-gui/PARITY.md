# lil-gui compatibility audit — 2026-10-11

## Verdict

The addon implements most of lil-gui's **non-DOM controller and folder API**,
but is not a drop-in replacement. After Node3D `init()`, `new GUI()` and
`new GUI({ title: '...' })` use the
active document; ordinary usage still calls `gui.draw()` after scene drawing.
The research preload can supply that draw call for conventional Three.js loops. The target is
Three.js example panel compatibility, not browser DOM/CSS equivalence.

## Scope checked

- Compared the wrapper and native renderer with the [lil-gui 0.21 guide and
  API](https://lil-gui.georgealways.com/).
- Inspected Three.js `r186` (commit `9b4a2ac29c63ccb43fd51c5661f2f873ac2c39b8`),
  matching the installed `three@0.186.1` line. Of 608 top-level HTML examples,
  160 import lil-gui. This is an import count, **not** a runtime coverage score.
- Ran the probes and adapted example recorded in [RESULTS.md](RESULTS.md).
  `three-hemisphere.ts` uses the GUI block from the upstream
  [hemisphere-light example](https://github.com/mrdoob/three.js/blob/r186/examples/webgl_lights_hemisphere.html)
  with a simplified self-contained scene. `crate-controls.ts` and
  `fog-controls.ts` are original Node3D scenes. The indexed-geometry example
  is a direct scene port with a separate runtime-preload variant; see
  [EXAMPLE-COMPARISON.md](EXAMPLE-COMPARISON.md).
  The [dynamic example browser](EXAMPLE-BROWSER.md) ran unedited module scripts
  extracted from upstream HTML and exposed a constructor-options gap that is
  now fixed.

## Non-DOM API

| Feature                                                                                            | Current implementation                                                              | Remaining qualification                                                                                            |
| -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `add()` number, boolean, function, string                                                          | Native slider/input, checkbox, button, text input                                   | Typed Node3D events exercised each type.                                                                           |
| Dropdown array/object and `.options()`                                                             | Labels and original JS values retained in TypeScript                                | Object-valued options and duplicates need interaction tests.                                                       |
| `addColor()`                                                                                       | Integer, short/six-digit hex, bare hex, `rgb(...)`, RGB object/array, channel range | Format conversion and object identity asserted; native color edits and all Three.Color color-space cases untested. |
| `.min()`, `.max()`, `.step()`, `.decimals()`                                                       | Double-precision number widgets; step snaps values                                  | Browser widget formatting and edge cases may differ.                                                               |
| Controller `.name()`, `.onChange()`, `.onFinishChange()`, `.getValue()`, `.setValue()`             | Implemented with JS object references and batched native events                     | Finish timing tested for slider/text; other widget timing needs event-stream interaction checks.                   |
| Controller `.listen()`, `.updateDisplay()`                                                         | Compatible methods; every property is sampled on `draw()`                           | Updates appear next draw, even without `.listen()`; large panels may pay extra read cost.                          |
| Controller `.options()`, `.enable()`, `.disable()`, `.show()`, `.hide()`, `.reset()`, `.destroy()` | Implemented                                                                         | Disabled click behavior needs a separate interaction probe.                                                        |
| Folders and GUI `.open()`, `.close()`, `.title()`, `.show()`, `.hide()`, `.reset()`, `.destroy()`  | Implemented, including nested folders and two panels on one window                  | Multiple GLFW windows and context recreation unsupported.                                                          |
| GUI/folder `.onChange()`, `.onFinishChange()`, `.onOpenClose()`                                    | Implemented with event bubbling                                                     | Folder toggle through Node3D event input untested.                                                                 |
| `.children`, `.controllers`, `.folders`, recursive traversal                                       | Implemented                                                                         | No DOM element properties.                                                                                         |
| `.save()` / `.load()`                                                                              | `{ controllers, folders }` shape, recursive option, collision check                 | JSON persistence asserted on representative values; broader data shapes untested.                                  |
| `domElement`, CSS styling/placement                                                                | No native equivalent                                                                | HTMLMesh/XR examples need a separate approach.                                                                     |

The native render result exposes `wantsCaptureMouse` and
`wantsCaptureKeyboard`. This reports ImGui's state after each draw; it does not
automatically prevent Node3D scene controls from handling the same event.
High DPI, context changes, multiple GLFW windows, Linux/macOS, and packed
consumer installation remain unverified.

## Representative Three.js patterns

- [EXR export](https://github.com/mrdoob/three.js/blob/r186/examples/misc_exporter_exr.html)
  uses `.options()` after `.add()` and `gui.open()`. These calls are implemented,
  though the exporter has not been ported.
- [CSS3D orthographic](https://github.com/mrdoob/three.js/blob/r186/examples/css3d_orthographic.html)
  uses folder `.close()`, `.children`, `.enable()`, `.disable()`, and stepped
  sliders. The calls are implemented; the example has not been run on Node3D.
- [XR native layers](https://github.com/mrdoob/three.js/blob/r186/examples/webgpu_xr_native_layers.html)
  passes `gui.domElement` to `HTMLMesh`; an ImGui overlay cannot substitute for
  that DOM surface.

## Next evidence before a package decision

1. Test arbitration with OrbitControls or other scene controls, plus high DPI
   and window/context changes. The typed Node3D event path is validated.
2. Port more complete upstream examples and record GUI edits separately from
   unrelated Node3D rendering adaptations. Only then estimate example coverage.
3. Exercise native color editing, object-valued options, disabled controls,
   folder toggles, and callbacks through Node3D's event stream.
4. Validate Linux/macOS builds, multiple windows, packed installation, active
   editing cost, and an all-C++ baseline.
