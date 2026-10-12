# Dynamic Three.js example browser experiment

The installed `three@0.186.1` npm package provides the library and
`examples/jsm` addons, but excludes the example HTML pages. This browser reads
the official [r186 catalog](https://github.com/mrdoob/three.js/blob/r186/examples/files.json)
and [HTML sources](https://github.com/mrdoob/three.js/tree/r186/examples) at
runtime. The revision matches the installed Three.js release line.

`example-browser.ts` extracts the page's single inline module script. It drops
HTML, CSS, and the import map, then executes the original script through an
in-memory Node module hook. No translated source file is written. Its static
screen accepts imports from `three/addons/*` when they resolve in the installed
npm package. It excludes external imports, substantive HTML widgets and media,
HTML-rendered effects, and unsupported platform use. This is a
conservative screen, not a proof of incompatibility for excluded pages.

## Clickable browser

Launch `node example-browser-app.ts` from this directory. The Node3D window
lists the complete r186 WebGL catalog in scrollable groups. Search filters the
list as you type. Click any example: an excluded page shows a short explanation
in the window; a candidate is checked in a hidden child window without
freezing the list, then opens in a separate visible window if framebuffer
output is verified. Closing a scene leaves the browser available for another
choice. The catalog status line and failures stay in the app; no terminal
selection or command parameters are needed for ordinary use.

The app needs network access to fetch the pinned upstream catalog, source
pages, and scene assets. HTML/CSS presentation and DOM widgets are omitted.
The framebuffer check establishes that the scene drew varied pixels in this
environment; it does not guarantee complete visual or interaction parity.
Failures describe what this host observed, not permanent impossibility.

The preload supplies Node3D, redirects `three` through a renderer-tracking shim,
redirects lil-gui to the native panel, and replaces the HTML Stats badge with a
no-op shim. It supplies small browser event and XML parsing facilities, maps
relative loader assets to pinned upstream URLs, and exposes shader text from
HTML `<script>` elements as data. Both the default Three.js loading manager and
managers constructed by examples receive asset mapping. Relative direct
`fetch()` calls use the same URL base. Inert mount and status elements let
scripts omit page chrome; native GUI style changes have no HTML effect. See
[DOM-AUDIT.md](DOM-AUDIT.md) for the boundaries of that omission. A shared Worker bridge
runs the unmodified Three.js Draco and KTX2 decoders; see
[DECODER-WORKERS.md](DECODER-WORKERS.md).

Animated and render-on-demand examples both receive a host frame. For one-shot
rendering, the host preserves a nonuniform default-framebuffer readback at the
render call, since a later GLFW swap may clear it. It waits for tracked assets
and then validates the framebuffer. Each selection runs in a fresh Node process
because the window, GL context, module cache, and scene state are process-scoped.
This gives a hot-reload-like selection workflow, with process restart rather
than state-preserving hot module reload.

The commands below are research and diagnostic tools. From `research/lil-gui`,
after the native addon is built:

```powershell
node example-browser.ts list
node example-browser.ts list --rejections
node example-browser.ts catalog
node example-browser.ts explain webgl_geometry_colors_lookuptable
node example-browser.ts probe
node dom-audit.ts
node dom-uses.ts
node example-browser.ts browse
node --import ./runtime-loader.ts example-browser.ts run webgl_buffergeometry_indexed --capture=captures/browser-indexed.png --verify-panel
```

`list` shows static candidates. `catalog` shows all scanned entries, including
pages screened out by source inspection and the reason for each. A candidate
is marked **probe needed** until checked on this host. `explain <id>` checks
one page and reports either the static exclusion or a classified runtime
probe failure. These are current-host observations, not claims that a page
is inherently impossible to translate. HTML/CSS presentation and DOM widgets
are omitted; shader text embedded in HTML can still be used as scene data.
A passing probe does not establish visual or interaction parity.

`probe` starts each candidate in a hidden child window,
waits for tracked assets, and checks raw framebuffer pixels. Each child has a
15-second timeout. The default animated capture uses frame 12; one-shot pages
wait at least 90 ready host frames. `--verify-panel` adds a stricter pixel check
for the indexed native panel. `browse` offers selection from the full catalog
by number or ID. It explains screened-out entries, probes candidate entries,
reports a short observed reason on failure, and launches a visible window on
success. Close that window to return to the menu.
The source is fetched again at launch, so network access is required.

## Measured reach on Windows x64

- The r186 catalog contains 294 WebGL entries in the scanned categories.
- The current static screen finds 244 candidates after admitting installed npm
  addons, render-on-demand scripts, and omittable page chrome. The full sweep
  passed **215/244** isolated framebuffer probes and is recorded in
  [COMPATIBILITY-CLUSTERS.md](COMPATIBILITY-CLUSTERS.md).
- The probe establishes nonuniform default-framebuffer output, not visual
  fidelity, complete interaction, or correct behavior throughout a session.
  A runtime failure may have more than one underlying cause.

Fifty scripts remain outside the static screen. The largest groups are 17
scripts creating a 2D canvas, 14 with external imports, and 12 containing HTML
widgets or media. The source-level split and the measured omissions are in
[DOM-AUDIT.md](DOM-AUDIT.md). Individual runtime failures among admitted scripts
are grouped in [COMPATIBILITY-CLUSTERS.md](COMPATIBILITY-CLUSTERS.md).

The browser accepts only catalog IDs from the pinned official source. The
fetched script executes with ordinary Node process permissions. It is an
experiment in transparent execution for a useful WebGL subset, not a general
browser or arbitrary page translator.
