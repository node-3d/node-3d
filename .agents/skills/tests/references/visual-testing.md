# Visual Testing

Visual tests are important for Node3D because many regressions are only visible in rendered output.

## Good Candidates

- raw WebGL output,
- Three.js examples,
- core `Screen` behavior,
- image loading and texture upload,
- framebuffer/offscreen rendering,
- context recreation after mode changes,
- plugin rendering overlays or physics visualization.

## Baselines

Only add screenshot baselines when output is deterministic enough across supported CI platforms.

When output differs by driver/platform, prefer targeted pixel checks, tolerance thresholds, or platform-specific baselines.

## Environment

Document and detect requirements:

- display server or offscreen context,
- OpenGL version/profile,
- WebGL2 compatibility flags,
- native package binary availability,
- GPU/device availability.

## Validation

When a visual test cannot run locally, still run type/lint/build checks and report the missing runtime requirement clearly.
