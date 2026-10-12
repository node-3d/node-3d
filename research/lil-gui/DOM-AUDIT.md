# DOM use in Three.js r186 WebGL examples

## Scope and method

The browser started this audit with 156 static candidates among 294 entries
in the official [r186 WebGL catalog](https://github.com/mrdoob/three.js/blob/r186/examples/files.json). It first rejected 138: 102 for a broad
DOM-expression check, 14 for external imports, 12 for HTML widget or media
tags, and 10 for named elements or an HTML renderer. Those are ordered
first-rejection counts, not independent feature totals.

`dom-audit.ts` downloads the pinned upstream pages to ignored
`captures/dom-audit/`; `dom-uses.ts` extracts the module scripts' browser
references for inspection. We then replaced the broad DOM check with narrow
rules and probed every newly admitted script in its own Node3D process.
The original HTML, CSS, and module scripts were not edited for the probes.

## What the broad DOM rejection concealed

A source audit of those original 102 DOM-first pages found:

| Source pattern | Pages | Can the DOM role be omitted? |
| --- | ---: | --- |
| Mount-like `div` creation | 70 | Usually. The page appends the WebGL canvas or Stats badge; one page also uses CSS2D labels and was excluded after a probe. |
| JavaScript-created 2D canvas | 17 | Sixteen feed textures, image data, or picking. The VOX loader's canvas draws a separate palette overlay; omission looks feasible from source but was not probed. |
| Other created elements | 2 | Yes in the tested default scenes: a GUI statistics row and a download link. |
| Shader selectors, GUI styling, page text, or other selectors | 12 | Mixed. Shader text and cosmetic styles can be supplied or ignored; slider layouts are part of the comparison view. |
| A later direct-`fetch` gate | 1 | This is an asset-loading requirement, not a DOM requirement. |

The 70-page group was a *syntactic* screen: a successful `div` match did not
prove that the div was merely a mount. The PDB loader constructs CSS2D labels,
for example. After excluding it, 58 of the remaining 69 mount candidates
passed framebuffer probes. Their failures were mostly exposed loader, image,
or capture issues rather than errors from the inert mount element.

The other 36 original rejections also mix concerns:

- Four video pages require video frames as scene textures or data.
- Five pages contain HTML `<canvas>` tags. Their roles vary from the main
  WebGL canvas, which could be mapped, to drawing and multiple-view canvases.
- Three pages include buttons or inputs. Some only choose settings; the
  glitch example uses a start button to initiate its scene.
- Fourteen first require imports outside the installed `three` package.
  They include rendering libraries, format loaders, and HTML or webcam
  integrations; installing an import would not automatically solve its
  runtime contract.
- The remaining named-element and HTML-renderer pages include status labels
  that can be omitted, plus split-screen layouts, selection controls,
  ASCII output, and CSS2D labels that affect what the example displays.

## What ran with the DOM omitted

The research host now returns inert page elements for mount divs, optional
statistics rows and download links. It treats HTML-only lil-gui styling and
class changes as no-ops, exposes shader `<script>` text through selectors, and
lets identified status labels/buttons exist without a browser layout. A
relative-`fetch` adapter handles the separate asset URL issue. The
Three.js module script still runs unchanged.

| Newly admitted group | Static pages | Focused probe passes | What was omitted or supplied |
| --- | ---: | ---: | --- |
| Mount-like divs, excluding CSS2D PDB | 69 | 58 | Container creation, canvas/Stats append; one control target needed `getRootNode` |
| Shader or `#container` selectors | 6 | 6 | Shader text is data; the container is Node3D's document |
| GUI styling and statistics text | 4 | 4 | CSS/class changes and HTML stats row have no visual effect on the native GUI |
| Download link / separate statistics row | 2 | 2 | Optional page chrome |
| Named buttons, labels, and progress fields | 5 | 3 | Default scene can render without their HTML presentation |
| Direct `fetch` previously screened out | 2 | 0 | URL resolution works, but one page hits UltraHDR and one has no verified scene pixels |

The current static screen admits 244 of 294 WebGL scripts. A complete sweep
passed **215/244**; `webgl_postprocessing_ssr` passed its focused probe but
failed during the full sweep on a native `uniform1f` argument. The complete
results are recorded in [COMPATIBILITY-CLUSTERS.md](COMPATIBILITY-CLUSTERS.md).
A pass means nonuniform default-framebuffer pixels after tracked loader assets
finish; it does not establish complete interaction or visual parity. Omitting
a control preserves the default scene, not its ability to change settings
through that control.
Saved captures of `webgl_animation_skinning_morph`, `webgl_gpgpu_water`, and
`webgl_mesh_batch` were also visually inspected and showed their 3D scenes,
not just the native GUI panel.

## Still outside the static screen

| First remaining reason | Pages | Interpretation |
| --- | ---: | --- |
| JavaScript-created 2D canvas | 17 | Sixteen feed scene content or data and need a 2D backend or deliberate substitute; the VOX palette overlay is optional |
| External import | 14 | Additional package/CDN contracts; unrelated to simply mounting HTML |
| HTML widget/media tag | 12 | Video, canvas layout/drawing, and button/input pages need individual treatment |
| HTML renderers | 2 | ASCII and CSS2D output are themselves DOM-based |
| Layout selectors | 2 | Sliders and multiple scenes are coupled to page layout |
| Named layout/selection elements | 3 | Split renderers, renderer border, or selection control |

These categories sum to the 50 scripts that the current static screen still
rejects. The 2D canvas group is the clearest counterexample to a blanket
“drop the HTML” rule: its canvas pixels are part of the 3D content. The
mounting and cosmetic groups support the user's hypothesis; they need only a
small host facade. Pages with multiple viewports, HTML-rendered labels,
video textures, or browser workers need behavior-specific adapters rather
than silent omission.

All measurements here are from Windows x64, Node.js 24.13.0, Three.js
0.186.1, and the local Node3D research build. No package public API changed.
