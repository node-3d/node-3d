# Three.js example versus Node3D

Baseline: Three.js r186 [`webgl_buffergeometry_indexed.html`](https://github.com/mrdoob/three.js/blob/r186/examples/webgl_buffergeometry_indexed.html), matching the installed `three@0.186.1` line. It has no assets or custom shaders: an indexed, vertex-colored plane rotates, and one `wireframe` checkbox binds to its material.

| Part                                                | [Direct Node3D port](examples/three-indexed.ts)                 | [Preloaded port](examples/three-indexed-auto.ts)         |
| --------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| HTML, CSS, import map                               | Removed; Node runs the module as TypeScript                     | Same                                                     |
| Scene, geometry, camera, light, material, animation | Same algorithm and values                                       | Same algorithm and values                                |
| `WebGLRenderer`, `setAnimationLoop`, resize handler | Kept; Node3D supplies `window` and `document`                   | Kept                                                     |
| lil-gui import                                      | Replaced with research addon import                             | Original import; preload resolves it to the addon        |
| GUI binding                                         | `new GUI(); gui.add(material, 'wireframe')`                     | Same                                                     |
| Browser `Stats` widget                              | Removed                                                         | Removed                                                  |
| Node3D initialization                               | Explicit `init()`                                               | Preload initializes before module evaluation             |
| Overlay and GL state                                | Explicit `gui.draw()` and renderer reset                        | RAF wrapper draws panels and resets registered renderers |
| Validation harness                                  | Emits Node3D events, asserts material change, captures frame 90 | Preload emits events and captures frame 90               |

The preloaded scene module has **no Node3D import or explicit overlay call**. It still needs the HTML module script extracted into a Node-runnable file, the DOM-based `Stats` widget removed, and TypeScript annotations. The preload is a proof of concept for this conventional `setAnimationLoop()` example. Its `three` import shim registers renderer instances so the runtime can call `renderer.resetState()` after native drawing.

**Capture diagnosis:** Image previews sometimes made the panel look like a narrow strip near its left edge, in both direct and preloaded runs. This was a preview artifact. During an apparently clipped run, raw `glReadPixels` samples at panel-header positions x=100, 200, and 300 (y=25) were all RGBA `(41, 74, 122, 255)`. Independently decoded PNG data confirmed the same color across the header; even a 450×100 crop was sometimes displayed incorrectly by the preview tool. ImGui reported a 400-pixel-wide panel with clip-right 414; the framebuffer was 1280×720. The capture harness now checks those three raw pixels before saving a full PNG and a `-panel.png` crop. Ten direct and ten preloaded 90-frame runs passed this check. This establishes that the panel was present in the captured framebuffer across its width; it does not test physical display output or other platforms.

## Event path

`doc.emit('mousemove'/'mousedown'/'mouseup', typed event)` passes through `GlfwWindow.emit`, Node3D's normal event emitter, the addon's shared input queue, and one native `render(values, events)` call. Native code feeds ImGui IO after the GLFW backend's `NewFrame`. `bridge-probe.ts` also sends `keydown` events with `charCode` and checks text edits and callbacks. The direct indexed example asserts that a checkbox click changes `THREE.MeshPhongMaterial.wireframe`. Both capture paths verify the panel header in raw framebuffer pixels.

This proves translation from Node3D's emitted events. Physical device callback delivery was not tested. Input arbitration remains: Node3D has already dispatched an event to other listeners before the GUI's post-frame `wantsCaptureMouse` value is available. OrbitControls and the panel could both react to one event. A general solution needs event routing at dispatch time or a scene-control policy based on prior capture state.

## Automation boundary

For simple WebGL examples using `window`/`document`, `WebGLRenderer.setAnimationLoop()`, and ordinary lil-gui object bindings, a preload can supply the browser-like runtime, remap the GUI import, batch input, draw the overlay, and reset renderer state. The scene algorithm can remain upstream code.

The [example browser](EXAMPLE-BROWSER.md) now extracts inline module scripts and shader text from upstream HTML and resolves ordinary loader assets to the pinned upstream directory. It does not implement DOM widgets, CSS, browser file APIs, WebXR, or every renderer and animation topology. Those need runtime adapters or manual changes. Module remapping is a research loader behavior, not yet a package contract. This loader supports one window and a straightforward animation loop; it exits after 90 frames only for the capture harness.

From `research/lil-gui`, after building the addon:

```powershell
node examples/bridge-probe.ts
node examples/three-indexed.ts --capture=captures/three-indexed.png
node --import ./runtime-loader.ts examples/three-indexed-auto.ts --capture=captures/three-indexed-auto.png --verify-panel
```

Both 90-frame runs and the bridge probe completed on Windows x64 with the local Node3D build. The saved `-panel.png` crops can aid inspection, but decoded pixel values are the reliable check when the preview looks clipped. All capture files are ignored generated files.
