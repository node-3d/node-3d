# Kenney assets in GSOM

These files were copied unchanged from free Kenney archives on 2026-10-12.
Only the models and UI files used by the research demo are included. Each
archive's original `License.txt` is kept beside its selected files. All four
packs are released under Creative Commons Zero (CC0).

| Directory | Source pack | Version | Files used |
| --- | --- | --- | --- |
| `space/` | [Modular Space Kit](https://kenney.nl/assets/modular-space-kit) | 1.0 | Wall, wall top, gate, gate door, cables, variation A texture |
| `blaster/` | [Blaster Kit](https://kenney.nl/assets/blaster-kit) | 2.1 | Sidearm, carbine, crate, colormap texture |
| `characters/` | [Blocky Characters](https://kenney.nl/assets/blocky-characters) | 2.0 | Two robot characters and their textures |
| `ui/` | [UI Pack - Sci-Fi](https://kenney.nl/assets/ui-pack-sci-fi) | 2.0 | Kenney Future Narrow font, crosshair, glass panels |

The GLB files came from each archive's `Models/GLB format/` directory. The
space texture came from `Models/Textures/variation-a.png`; the blaster texture
came from `Models/GLB format/Textures/colormap.png`. The character textures
came from their archive's `Models/GLB format/Textures/` directory. The QML
assets came from the UI archive's `Font/` and `PNG/` directories. `demo.ts`
maps GLB texture references to those local paths at load time.
