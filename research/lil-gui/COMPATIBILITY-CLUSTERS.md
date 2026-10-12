# Three.js r186 compatibility clusters

## Measured census

On Windows x64 with Node.js 24.13.0, Three.js 0.186.1, and the local
Node3D/ImGui research build, the browser scanned the official 294 WebGL
catalog entries. The DOM-aware static screen admitted **244** scripts; the full
isolated framebuffer sweep passed **215/244** and failed **29/244**. The earlier
screen admitted 156 and passed 143. The 15-second child
timeout is part of this measurement. Captures are ignored local output under
`captures/`.

The probe checks nonuniform pixels in the default framebuffer after tracked
assets finish. It does not establish visual fidelity, complete interaction,
all assets in view, or sustained rendering. A static rejection is only a
screening result. Counts below are ordered by the first reason returned, so
they do not represent independent feature totals.

| Static first rejection | Pages | Meaning |
| --- | ---: | --- |
| JavaScript-created 2D canvas | 17 | Sixteen feed scene content or data; one draws an optional palette overlay |
| External import | 14 | Import is not supplied by the installed `three` package |
| HTML widget or media tag | 12 | Page includes a canvas, input, button, or video element |
| HTML renderer | 2 | ASCII and CSS2D output require DOM rendering |
| Layout selector | 2 | Comparison sliders depend on page layout |
| Named layout/selection element | 3 | Split renderer, border, or selection control |

The source-level breakdown of the original 138 static rejections and the
omission experiments are in [DOM-AUDIT.md](DOM-AUDIT.md).

## Runtime failures among admitted scripts

| Cluster | Pages | Examples and observed boundary |
| --- | ---: | --- |
| 2D canvas API | 5 | `webgl_geometry_colors_lookuptable`, `webgl_lightprobe`, `webgl_loader_nrrd`, `webgl_shadowmap_viewer`, and `webgl_materials_physical_clearcoat` need pixel or drawing methods. The clearcoat path reaches Three's `FlakesTexture` canvas indirectly. |
| UltraHDR gain-map images | 8 | `webgl_loader_gltf`, `webgl_loader_gltf_anisotropy`, `webgl_loader_gltf_instancing`, `webgl_loader_gltf_transmission`, `webgl_materials_physical_transmission_alpha`, `webgl_performance`, `webgl_pmrem_equirectangular`, and `webgl_postprocessing_3dlut` reach `createImageBitmap`, which the host does not supply. |
| WebGL2 pixel-pack readback | 2 | `webgl_interactive_cubes_gpu` and `webgl_lightprobe_cubecamera` use Three's asynchronous render-target readback; the `gl.readPixels(..., 0)` buffer-offset overload is rejected by the Node3D binding. |
| Uniform framebuffer | 4 | `webgl_interactive_points`, `webgl_loader_3dm`, `webgl_loader_texture_pvrtc`, and `webgl_texture2darray_compressed` yielded no varied sampled pixels. Their causes remain unverified. |
| Shader language level | 1 | `webgl_buffergeometry_attributes_none` uses `floatBitsToUint` / `uintBitsToFloat`, unavailable under the current GLSL 140 rewrite. |
| Unsupported extension path | 1 | `webgl_clipculldistance` enters an unsupported path and later dereferences an uninitialized control. |
| Image codec | 1 | `webgl_loader_gltf_avif` reaches its asset but the Node3D image decoder reports an unknown format. |
| Remote transitive import | 1 | `webgl_loader_ttf` imports the npm Three.js `TTFLoader`, whose own import of a CDN `opentype.js` module is unsupported by Node's ESM loader. |
| Native uniform argument | 1 | `webgl_postprocessing_ssr` passed a focused probe but failed this sweep when `uniform1f` received a non-number. |
| Timeout or unverified presentation | 4 | `webgl_lightprobes_sponza`, `webgl_loader_gltf_dispersion`, `webgl_test_memory2`, and `webgl_texture2darray_layerupdate` exceeded the 15-second child limit. The memory example is a continuing stress loop. |
| Postprocessing capture | 1 | `webgl_postprocessing_unreal_bloom_selective` performs renderer calls and loads assets but the host never captures a nonuniform default framebuffer. Its final presentation path is unverified. |

The 2D canvas and UltraHDR groups are the largest shared runtime gaps. A
future canvas/image adapter needs real pixels and texture-upload checks. The
pixel-pack overload belongs in the WebGL binding or a proven buffer bridge.
Timeouts and uniform framebuffers need narrower tracing before assigning a
single cause. The selective-bloom trace showed rapid host ticks after 51
renderer calls, so its timeout alone is not evidence of slow rendering.

## Working clusters from this expansion

- Generic resolution of installed `three/addons/*` imports removed the old
  per-addon allowlist. Many controls, shaders, modifiers, postprocessing passes,
  geometry utilities, and model loaders now pass without copying addon source.
- A shared asset adapter for default and custom loading managers let both
  Collada examples resolve their textures. The `linkedom` XML parser also
  carried the 3MF, AMF, KMZ, and SVG loader pages through framebuffer probes.
- The render-on-demand host and immediate readback admitted text shapes,
  text stroke, normal-map, and other one-shot pages whose pixels would be lost
  if sampled only after a GLFW swap.
- Inert mount elements, shader selectors, and no-op page chrome admitted 88
  additional scripts to the static screen. The focused probes passed 73 of
  these; the full 244-page sweep passed 215 overall. Three saved captures were
  visually checked for actual 3D content. See [DOM-AUDIT.md](DOM-AUDIT.md).
- The existing Worker bridge continues to run unmodified Draco and KTX2
  decoder addons; see [DECODER-WORKERS.md](DECODER-WORKERS.md).

## Next useful experiments

1. Add a research-only 2D canvas backend with real pixel buffers, then probe
   the five admitted canvas failures, sixteen excluded scene-data canvas pages,
   and the eight UltraHDR paths. Verify texture uploads, not merely method
   availability.
2. Test the WebGL2 pixel-pack buffer-offset readback against the two identified
   consumers and inspect the asynchronous result bytes.
3. Trace the four uniform-framebuffer cases and the selective-bloom final pass
   at framebuffer boundaries. The current probe cannot tell whether those
   scenes render elsewhere, fail to draw, or draw uniform pixels.
4. Investigate the remaining 50 static exclusions by role. The 2D content,
   video, multiple-view, CSS2D/ASCII, and external-library groups need separate
   decisions. Keep browser widgets outside the translation target.

This research changes the browser under `research/lil-gui` and one root
development dependency (`linkedom`). It does not change the public Node3D
package APIs or the standalone package contents.
