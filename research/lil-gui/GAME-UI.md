# Game UI research against the QML FPS example

The reference is `packages/plugin-qml/examples/fps`, especially `Hud.qml`,
`HudView.qml`, `StartMenu.qml`, `EscMenu.qml`, `OverMenu.qml`, `MenuItem.qml`, and
`Score.qml`. Its TypeScript game owns the state (`start`, `hud`, `esc`, `over`),
health, charge, fuel, and score. QML renders screen UI and emits menu actions
back to TypeScript. It also renders `Score.qml` into a texture used by a 3D
sprite; that is a separate world-space use of QML.

`examples/fps-game-ui.ts` is a small, independent 3D range that follows the
same screen state and input flow. It demonstrates the proposed game UI API
without copying the QML game implementation or its models:

| QML FPS UI element | Game UI research result |
| --- | --- |
| Start / pause / game-over views | Full-screen dimming rectangles, text, and clickable buttons |
| `HudView` health, fuel, charge | Positioned text and bars, updated from TypeScript state |
| `crosshair121.png` | Reuses the reference PNG as an uploaded native image |
| Score | The FPS study uses screen-anchored text; `examples/world-ui.ts` now demonstrates the same render-to-texture technique as the QML world-space sprite |
| Damage / hit flash | A fading translucent rectangle |
| Hovering and clicking menu items | ImGui-backed invisible hit areas with custom drawing and action IDs |
| Pointer capture and escape | TypeScript switches between game input and menu input |

## Event flow

The QML FPS example gates gameplay handlers on `hudState`; its visible QML
`MouseArea` handles menu clicks and emits actions back to TypeScript. The research
bridge now makes the equivalent route explicit:

1. Node3D emits a typed keyboard or mouse event. Its browser document may label
   mouse events as `pointerdown`/`pointermove`/`pointerup` even on `mousedown`/
   `mousemove`/`mouseup` listeners.
2. `GameUI.setInputMode('modal')` forwards menu input to ImGui. Application event
   handlers call `ui.routeEvent(event)` and skip gameplay when it returns true.
   `setInputMode('passthrough')` gives keyboard and mouse control to gameplay.
   A key such as Escape can pass through a modal menu with
   `{ passthroughKeys: ['Escape'] }`.
3. `ui.draw()` processes the queued input once, draws the current UI, and invokes
   action callbacks. Callbacks can change the UI mode for the next event.

ImGui no longer polls GLFW mouse position during this frame, so passive mode
does not silently feed the UI. Changing modes clears queued and held ImGui
input. `wantsCaptureMouse` and `wantsCaptureKeyboard` remain available after a
frame, but `routeEvent` gives the application a synchronous state decision in
its own event handler. Node3D event propagation is not cancelled automatically.

The native frame reads the current GLFW window and framebuffer sizes, so normal
resizes do not rebuild the UI. For a mode change that replaces the GLFW handle,
call `ui.rebindWindow(() => { doc.mode = 'borderless'; })` while the old window
is still current. Node3D's GLFW addon creates every OpenGL window in a share
group rooted at a hidden window. The old window is usually cached and hidden;
an outgoing fullscreen window is destroyed. The UI detaches ImGui's GLFW
backend before that happens, switches the mode, and binds the same ImGui context
to the new GLFW handle. Its font atlas, images, shader, and buffers stay in the
shared GL group; their IDs and UI state do not change. The OpenGL backend
creates its temporary VAO per render on the current context. All other GUI
panels must be closed first. `Screen` recreates its Three.js renderer on a mode
change; `examples/world-ui.ts` therefore uses the current `screen.renderer` on
each frame. A direct mode change while a GUI is live fails with a handle-change
error rather than rendering through a stale GLFW binding.

The research API is in `game-ui.ts`. A frame batches `rect`, `text`, `image`,
`bar`, and `button` commands through the existing `GUI.draw()` native call.
JavaScript holds callbacks and state. Native code owns ImGui draw lists and
OpenGL textures. Uploaded images have library-issued numeric IDs; the caller
releases them explicitly or `GameUI.destroy()` releases them all. No ImGui
pointers or OpenGL texture names are exposed to JavaScript. `drawToTarget(renderer,
target)` sends the same batch into a Three.js `WebGLRenderTarget`; its texture
can be assigned to a mesh or sprite material. The caller owns and disposes the
render target. The API accepts a TTF/OTF file with `loadFont(path, size)` and an
optional font ID on `text(...)`. Loaded fonts live until the shared ImGui context
shuts down.

Without a supplied font, ImGui uses its embedded ProggyClean.ttf face. The
previous large HUD labels scaled that face, which accounts for their pixelated
appearance. The world-space demo loads the repository's Open Sans Regular font
and renders it into the texture at several sizes.

From `research/lil-gui`, after building the native addon:

```powershell
node examples/fps-game-ui.ts
node examples/world-ui.ts
node examples/world-ui.ts --capture=captures/world-ui-custom-font.png
node examples/world-ui.ts --smoke-window --capture=captures/world-ui-recreated.png
node examples/event-flow-probe.ts --capture=captures/event-flow.png
node examples/event-flow-probe.ts --fullscreen --capture=captures/event-flow-fullscreen.png
```

Click **Start**, use W/A/S/D and the mouse, hold and release the mouse button
to fire, and press Escape for the pause menu. `K` forces the game-over screen
for inspection. The following focused captures exercise each UI state and a
synthetic Node3D mouse click on Start:

```powershell
node examples/fps-game-ui.ts --capture=captures/fps-ui-start.png --capture-mode=start
node examples/fps-game-ui.ts --capture=captures/fps-ui-hud.png --capture-mode=hud
node examples/fps-game-ui.ts --capture=captures/fps-ui-esc.png --capture-mode=esc
node examples/fps-game-ui.ts --capture=captures/fps-ui-over.png --capture-mode=over
node examples/fps-game-ui.ts --smoke-start --capture=captures/fps-ui-clicked.png
node examples/fps-game-ui.ts --smoke-pause --capture=captures/fps-ui-pause-input.png
node examples/fps-game-ui.ts --smoke-over --capture=captures/fps-ui-over-input.png
```

## Current boundary

The screen-space HUD and the world-space render target were captured on the
tested Windows OpenGL host. The event-flow probe changed the window size and
completed two windowed ↔ borderless and two windowed ↔ fullscreen round trips,
including a return to a cached handle and destruction of outgoing fullscreen
windows. It rendered the same image and font and handled a menu click afterward. The in-world panel was
captured after two windowed ↔ borderless round trips. World-space content is
currently passive: mapping a ray hit back to the texture for button input is
not implemented. Font loading uses ImGui's shared atlas, so individual fonts
cannot be unloaded while the context lives. Multiple simultaneous GUI windows
and cross-platform installation are not verified. The
demo does not establish full QML parity.
