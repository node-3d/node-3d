# Research results — 2026-10-11

## Environment and scope

- Windows x64, Node.js 24.13.0, Visual Studio 2022, NVIDIA GeForce RTX 4070
  Laptop GPU OpenGL renderer.
- Dear ImGui v1.92.5 compiled into a Node-API addon with the official GLFW and
  OpenGL3 backends. The addon links to Node3D's `deps-opengl` GLFW import library.
- TypeScript retains controller definitions and JavaScript object references.
  C++ holds ImGui structures and makes widget calls. The render path uses one
  JS-to-native call per frame, plus one call when controller definitions change.
  Native-to-JS changes return in the render result.
- This is an in-repository research build, not a packed or published package.

## Live runs

| Run                                                                                                                         | Result                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node examples/crate-controls.ts --capture=captures/crate.jpg`                                                              | Completed 90 frames; framebuffer capture shows a Three.js crate with the native panel, folder, checkbox, color control, speed slider, camera FOV slider, and button. The FOV control binds directly to a `THREE.PerspectiveCamera` property.                                                                                  |
| `node examples/fog-controls.ts --capture=captures/fog.jpg`                                                                  | Completed 90 frames; capture shows a fogged Three.js scene and controls for density, color, dropdown mode, and boolean motion.                                                                                                                                                                                                |
| `node examples/bridge-probe.ts`                                                                                             | Typed `doc.emit` events exercised button, checkbox, snapped slider, string text input, change/finish callbacks, and capture flags through Node3D's event emitter.                                                                                                                                                             |
| `node examples/parity-probe.ts --capture=captures/parity.jpg`                                                               | Passed assertions for controller/folder state, bubbled events, save/load/reset, color formats and object identity, removal, and two simultaneous panels on one window. Capture visually checked.                                                                                                                              |
| `node examples/three-hemisphere.ts --capture=captures/three-hemisphere.jpg`                                                 | Completed 90 frames. Adapted the GUI block from upstream Three.js `webgl_lights_hemisphere.html`; native panel and simplified light scene visually checked. OrbitControls initialized with a local `ownerDocument` alias and uses the GUI capture flag to set its enabled state. Physical input interaction remains untested. |
| `node examples/three-indexed.ts --capture=captures/three-indexed.png`                                                       | Completed 90 frames with Three.js's renderer and animation loop. Typed Node3D events clicked the checkbox, and an assertion confirmed `material.wireframe`. Ten repeated runs passed raw framebuffer checks across the panel width.                                                                                           |
| `node --import ./runtime-loader.ts examples/three-indexed-auto.ts --capture=captures/three-indexed-auto.png --verify-panel` | Completed 90 frames. The preload remapped the original lil-gui import, initialized Node3D, drew the panel, and reset Three renderer state. Ten repeated runs passed the same framebuffer checks.                                                                                                                              |

The captures are generated locally and ignored by Git. They prove the overlay
rendered into the same framebuffer as the Three.js scene on this machine. The
input probes now exercise the Node3D window event stream from `doc.emit` through
the batched native ImGui bridge. This is the event API used for GLFW callbacks.
Physical callback delivery and arbitration with another listener such as
OrbitControls remain untested. See [EXAMPLE-COMPARISON.md](EXAMPLE-COMPARISON.md).
An apparent intermittent clipping issue in full-frame image previews was traced
to the preview: raw framebuffer pixels and decoded PNGs contain the full panel.
The indexed capture harness now verifies the panel header at x=100, 200, and 300
before saving each frame, and saves a `-panel.png` crop. Both paths
passed 10/10 repeated captures. This verifies framebuffer output on the tested
machine, not physical display output or other platforms.

## Dynamic upstream example loading

The [example browser experiment](EXAMPLE-BROWSER.md) reads the official r186
catalog and HTML sources at runtime, extracts an inline module script, and
loads it through the Node3D preload without writing a translated source file.
The initial screen selected 80 of 294 WebGL entries and passed 77 framebuffer
probes. The expanded browser now resolves installed npm addons generically,
supports custom loading managers and XML loaders, captures render-on-demand
scripts, and omits nonessential page chrome. Its current full sweep passed
215 of 244 admitted pages; the DOM audit is in [DOM-AUDIT.md](DOM-AUDIT.md).
The remaining failure clusters are recorded in
[COMPATIBILITY-CLUSTERS.md](COMPATIBILITY-CLUSTERS.md). A separate probe decoded
Draco geometry and ETC1S/UASTC KTX2 textures with the unmodified loaders; an
ETC1S texture also rendered into the framebuffer. See
[DECODER-WORKERS.md](DECODER-WORKERS.md). A terminal selection menu probes and
launches each example in a fresh process. Assets load from pinned upstream
URLs; shader text is extracted as data from HTML.

## Callback cost

`examples/benchmark.ts` ran at the default 1280×720 window size with vsync on.
Each case discarded 60 warmup frames and measured 180 frames. Times below are
median milliseconds of synchronous JavaScript callback work; they exclude time
spent waiting in GLFW swap/vsync and do not measure GPU completion.

| Controls | Scene draw | GUI portion | Value snapshot | Native render call |
| -------: | ---------: | ----------: | -------------: | -----------------: |
|        0 |      0.057 |       0.000 |              — |                  — |
|       10 |      0.062 |       0.211 |          0.001 |              0.184 |
|       50 |      0.067 |       0.213 |          0.002 |              0.189 |
|      200 |      0.066 |       0.238 |          0.009 |              0.211 |

The 200-control case had a 0.343 ms p95 GUI portion. One 10-control run had
an unexplained 5.33 ms p95 native-call tail; a repeat had 0.200 ms median and
0.307 ms p95 GUI time. These are exploratory single-machine measurements, so
the tail needs further investigation. Control rows beyond the
visible panel area may be clipped by ImGui, so these numbers are evidence for
this panel layout and idle workload, not a general upper bound. They also do
not isolate the native call overhead from ImGui's rendering work or compare
against an all-C++ implementation. The TypeScript value snapshot remained
small in this experiment; the native render call dominated measured callback
time.

After the parity changes, one repeat of the 200-control idle benchmark measured
0.243 ms median GUI time and 0.445 ms p95 (0.212 ms median native call). This
single run is not a regression conclusion.

## Assessment

The initial result supports a narrow lil-gui-style Node3D control panel: the
core overlay works, JavaScript objects can be bound directly, and the batched
bridge did not dominate these idle-frame measurements. It is too early to
promote this into a package.

The separate GameUI study now tests state-based event routing and repeated
windowed/borderless/fullscreen switches on this Windows host. Node3D's GLFW
windows share a hidden root OpenGL context; the UI keeps shared textures and
the ImGui context while rebinding the per-window GLFW backend. The
`event-flow-probe.ts` checks rendering and a menu click after two round trips
for each alternate mode. `world-ui.ts` also captures its render-target panel
after repeated borderless switches. See [GAME-UI.md](GAME-UI.md).

Before promotion, test broader scene input arbitration, multiple simultaneous
GUI windows, higher DPI, Linux/macOS builds, native color editing, and a broader sample of actual
upstream Three.js example panels. Measure active editing and all-C++ or
direct-binding baselines as well. See [PARITY.md](PARITY.md) for the API audit.
