# Node3D SEA research

This is a standalone consumer experiment. Build it separately on each target
OS/architecture with Node.js 24. It creates a single executable application
that opens a small Node3D/Three.js window. The executable
contains a bootstrap; `dist/app` contains the generated game entry, production
`node_modules`, and native addon/library directories in their installed layout.
Rsbuild bundles the application TypeScript into `app/main.js` and may emit
additional JavaScript chunks there. Production packages such as `@node-3d/core`
and `three` remain external and are loaded from `app/node_modules` at runtime.

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

Run the executable with `--render-check` to initialize the game, draw its cube,
read framebuffer pixels, and exit. This uses a hidden window or headless context;
Linux needs a display server such as Xvfb. For example:

```console
dist/Node3D-SEA.exe --render-check
```

The GitHub Actions workflow builds archives for Windows, Linux, and macOS on
x64 and ARM64. Separate consumer jobs download each artifact into a fresh runner
and run `--render-check` from outside the extracted directory, using the same
headless graphics setup as Core CI. macOS consumers check out this repository
only for the copied headless GL setup script; the executable and packages load
from the downloaded archive. These checks prove rendering on the CI runners, not sound, Steam
integration, or every player's graphics driver.

The embedded SEA entry uses `createRequire()` to load `app/entry.cjs` from disk.
That file imports the Rsbuild output `app/main.js` using normal ESM loading.
The small CommonJS bootstrap and bridge are stripped from their TypeScript
sources with Node.js during packaging. This keeps Node3D's package-relative
`.node` paths and native dependency directories intact.
