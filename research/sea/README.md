# Node3D SEA research

This is a standalone consumer experiment. Build it separately on each target
OS/architecture with Node.js 24. It creates a single executable application
that opens a small Node3D/Three.js window. The executable
contains a bootstrap; `dist/app` contains the generated game entry, production
`node_modules`, and native addon/library directories in their installed layout.

From this directory, using Node.js 24 and npm 10.9 or newer:

```console
npm ci --ignore-scripts
npm run build
```

The build stages a separate production install with normal lifecycle scripts.
Run `dist/Node3D-SEA.exe` on Windows or `dist/Node3D-SEA` on Linux/macOS. Press
Escape to exit. Copy or archive the **whole** `dist` directory; the executable
alone is insufficient. On Windows this research build is unsigned and may open
a console window.

Run the executable with `--smoke` to load Node3D's public entry and native
dependencies without creating a game window. GLFW still requires a display
context on Linux, so CI runs the smoke check under Xvfb. For example:

```console
dist/Node3D-SEA.exe --smoke
```

The GitHub Actions workflow builds Windows and Linux tarballs. Separate consumer
jobs download each artifact into a fresh runner without checking out the source
or installing Node/npm dependencies, then run `--smoke` from outside the extracted
directory. This proves the archived executable can load its staged Node3D
dependencies. It does not prove rendering, sound, Steam integration, or operation
on a clean player's machine; run the downloaded executable there.

The embedded SEA entry uses `createRequire()` to load `app/entry.cjs` from disk.
That file imports `app/main.js` using normal ESM loading. This keeps Node3D's
package-relative `.node` paths and native dependency directories intact.
