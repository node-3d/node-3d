# Documentation and Examples Reference

Load when writing package READMEs/API text or establishing runnable consumer
examples.

## Documentation

Inspect the public entrypoint, relevant source, examples, and tests before
describing behavior. Do not invent APIs.

Use only sections a package needs: role, install, capabilities, minimal usage,
API overview, examples, native/install/platform notes, and third-party
provenance where applicable.

Keep language direct and technical rather than promotional.

Package-family emphasis:

- core -> browser-like environment and Three.js/WebGL compatibility;
- native addon -> prebuilt/install behavior and native capability;
- deps -> bundled third-party software, license/provenance;
- plugin -> composition of core and lower-level capabilities.

## Examples

- Import Node3D packages by package name, never via `../ts` or `../dist`.
- Prefer TypeScript-first examples where the supported Node.js runtime executes
  them directly.
- Put Node3D-authored examples/diagnostics under package-owned example areas and
  adapted vendor samples under clearly named vendor areas.
- Demonstrate meaningful consumer behavior, not internal implementation access.
- Run the example or nearest type/build check.
- For visual/hardware examples, state what was and was not validated.
- Examples are repository-only and must not enter npm package contents.

Derive README snippets from runnable examples or public source, then keep named
ESM exports and package self-imports synchronized. Do not document private
source paths as consumer API.
