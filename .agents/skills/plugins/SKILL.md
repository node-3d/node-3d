---
name: plugins
description: Work on Node3D high-level plugin packages that compose core, native addons, QML/audio/physics/browser-like systems, or other integrations.
---

# Plugins

## Owns

High-level integration contracts that compose lower-level Node3D packages.

## Workflow

1. Identify the lower-level packages and runtime capabilities being composed.
2. Keep the plugin ergonomic without hiding necessary low-level escape hatches.
3. Align browser-like APIs with the core environment rather than inventing
   competing globals/semantics.
4. Test the integration contract, not only isolated helper functions.
5. Document behavior when optional native/QML/audio/physics/runtime support is
   absent.
6. Use consumer-style examples through package imports.
7. Do not turn a plugin into a second core runtime: compose lower-level packages
   while preserving documented escape hatches and optional-capability failures.

## Load References

Load `.agents/references/browser-runtime.md` only when browser-like compatibility
semantics are involved.

Add the owning lower-level skill as secondary only when its source artifacts are
also modified.
