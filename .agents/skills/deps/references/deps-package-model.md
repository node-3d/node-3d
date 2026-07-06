# deps-* Package Model

`deps-*` packages carry third-party binary and header dependencies for Node3D native addons.

## Purpose

They allow addon packages to build and run without every consumer manually installing platform-specific third-party libraries.

Examples:

- `@node-3d/deps-opengl`: OpenGL/GLFW/GLEW-related binaries and headers.
- `@node-3d/deps-freeimage`: FreeImage binaries and headers.
- `@node-3d/deps-bullet`: Bullet Physics binaries and headers.
- `@node-3d/deps-labsound`: LabSound binaries and headers.
- `@node-3d/deps-qt-*`: Qt runtime packages.
- `@node-3d/deps-uiohook`: libuiohook binaries and headers.

## Typical Shape

These packages may intentionally have:

- `index.js`,
- `index.d.ts`,
- platform-specific `bin-*` folders,
- include/header folders,
- thin exports describing `bin` and `include` paths,
- install or packaging scripts specific to binaries.

Do not force Rslib, `ts/`, or native addon `dist/` conventions onto them without a real reason.

## Consumer Contract

Addon packages may use dependency packages in GYP variables, runtime imports, or path helpers.

When changing exported paths or binary layout, inspect consumers for:

- `require('@node-3d/deps-*')`,
- `import '@node-3d/deps-*'`,
- `.bin`,
- `.include`,
- `getPaths(...)`,
- `binding.gyp` variables.
