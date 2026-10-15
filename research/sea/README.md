# Node3D SEA research

This is a standalone consumer experiment. Build it separately on each target
OS/architecture with Node.js 24. It creates a single executable application
that opens a small Node3D/Three.js window. The executable
contains a bootstrap; `dist/app` contains the generated game entry, production
`node_modules`, and native addon/library directories in their installed layout.
Rsbuild bundles and minifies the application TypeScript into `app/main.js` and
may emit additional JavaScript chunks there. Production packages such as
`@node-3d/core` and `three` remain external and are loaded from
`app/node_modules` at runtime.

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

## Bytecode packaging research

The original [`vercel/pkg`](https://github.com/vercel/pkg) is archived. Its
maintained fork, [`@yao-pkg/pkg`](https://yao-pkg.github.io/pkg/), has two
relevant modes:

| Mode | JavaScript delivery | Node.js binary |
| --- | --- | --- |
| This experiment | Minified `app/main.js` and chunks remain on disk | Stock Node.js 24 with a SEA bootstrap |
| `pkg` Standard | V8 bytecode without the original JavaScript source | Patched Node.js with a virtual filesystem |
| `pkg` Enhanced SEA | Source embedded in the executable | Stock Node.js with a virtual filesystem |

See the fork's [mode comparison](https://yao-pkg.github.io/pkg/guide/sea-vs-standard)
and [bytecode guide](https://yao-pkg.github.io/pkg/guide/bytecode). Bytecode
raises the effort of recovering application logic; it is not encryption.
Native `.node` addons still need real files, so `pkg` extracts them to a cache
before loading them. Node3D's addon paths and dependent libraries would need
their own packaging and render validation with `pkg`; this experiment has not
tested that path. See the [native addon guide](https://yao-pkg.github.io/pkg/guide/native-addons).

Stock Node.js SEA's `useCodeCache: true` is not a source-free bytecode option:
it embeds a V8 code cache alongside the source of the SEA main script. On the
Node.js 24 version used here, it also does not support `import()` in that script.
Our SEA main script is only a bootstrap; enabling its code cache would not
transform the on-disk `app/main.js`. See [Node.js 24 code cache support](https://nodejs.org/download/release/v24.13.0/docs/api/single-executable-applications.html#v8-code-cache-support).

`useSnapshot: true` is a different stock SEA mechanism. It runs setup code at
build time and serializes a V8 startup state with a function to run after
deserialization. It may be worth a separate experiment for application logic,
but it is not `pkg`'s per-module bytecode format, and this game's native
initialization and module loading have not been tested with it. See
[Node.js 24 snapshot support](https://nodejs.org/download/release/v24.13.0/docs/api/single-executable-applications.html#startup-snapshot-support).
A dedicated source-free bytecode API in Node.js remains an
[open proposal](https://github.com/nodejs/node/issues/62670).
