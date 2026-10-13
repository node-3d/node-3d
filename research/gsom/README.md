# GSOM vertical slice research

This root-repository research prototype tests a small FPS loop and the seams between
Node3D packages. It is not an npm workspace or a supported package example.

## Current playable loop

One subject starts in a corridor, clears two rooms, chooses one upgrade after
each clear, and either extracts or dies. The sidearm has unlimited ammunition;
the carbine has limited ammunition. Enemies move toward the nearest living
subject and fire dodgeable projectiles. Corridor panels, gates, crates,
characters, weapons, HUD font, and UI details use selected
[Kenney CC0 assets](assets/kenney/README.md). The remaining geometry and sounds
are original placeholders.

Run from the superproject root with its workspace dependencies built:

```powershell
node research/gsom/demo.ts
```

Controls: Enter starts/restarts; WASD moves; mouse aims; left mouse fires; 1/2
select a weapon during combat; 1/2/3 select an upgrade when offered; E leaves a
cleared room. The HUD is QML; the room, enemies, projectiles, and weapon are
Three.js. Three.js audio uses the Node3D WebAudio plugin. Bullet ray queries
block movement into the static room solids.

## Model and event contract

[model.ts](model.ts) has no Node3D, Three.js, QML, Bullet, audio, or networking
imports. It owns the run state, two possible subjects, enemies, projectiles,
weapons, upgrades, and legal phase transitions. [layout.ts](layout.ts) supplies
engine-independent room spawns, bounds, and static solids. Controllers submit typed
commands. The model accepts them or emits a `command-rejected` event, and emits
sequenced domain events for shots, hits, kills, damage, room transitions,
upgrades, and run completion. Its fixed 60 Hz step, recorded commands, event
journal, snapshots, and deterministic replay form the inspection surface.

The entry point in [demo.ts](demo.ts) handles startup, input, and the fixed-step
loop. [world.ts](world.ts) builds Three.js scenery and Bullet shapes from the
shared solids, and supplies collision resolution through a plain model callback.
[presentation.ts](presentation.ts) updates actors, QML HUD values, and sounds
from state and events. [capture.ts](capture.ts) holds scripted research runs and
framebuffer capture. Neither view owns game rules.

A second subject is supported by the model. [network.ts](network.ts) uses
Gabenet direct UDP for one guest. The host owns the model, validates guest
inputs, assigns them to player 2, and sends snapshots with sequenced events.
Pure packet checks are in [protocol.ts](protocol.ts). The guest rejects malformed
snapshots and counts event sequence gaps as `missedEvents`; a gap can still omit
a transient sound effect.
The guest renders its own first-person view from those snapshots. Disconnects
remove player 2 without ending the host run. The earlier
[co-op transport probe](coop-probe.ts) remains a small socket-pair check.

Run two instances on the same machine or LAN (allow the chosen UDP port through
the host firewall):

```powershell
node research/gsom/demo.ts --coop-host=39000
node research/gsom/demo.ts --coop-join=127.0.0.1:39000
```

Replace `127.0.0.1` with the host address for LAN play. Only the host starts
or restarts a run, chooses upgrades, and opens the next room. Both players can
move, aim, shoot, and select weapons. Both instances generate their own WebAudio
tones. Use `--no-audio` when isolating graphics or running without an audio device.

## Reproduce the checks

```powershell
node node_modules/typescript/bin/tsc --project research/gsom/tsconfig.json
node --test research/gsom/model.test.ts
node --test research/gsom/protocol.test.ts
node research/gsom/physics-probe.ts
node research/gsom/audio-probe.ts
node research/gsom/coop-probe.ts
node research/gsom/coop-harness.ts
node research/gsom/record.ts
node research/gsom/replay.ts research/gsom/records/victory.demo.json
node research/gsom/replay.ts research/gsom/records/loss.demo.json
```

Capture any state without playing it manually:

```powershell
node research/gsom/demo.ts --capture=research/gsom/captures/combat.png --capture-phase=combat
```

`--capture-phase` accepts `menu`, `combat`, `upgrade`, `exit`, `won`,
and `lost`. The capture writes a PNG plus a JSON summary containing the game
state, event journal, command record, ready sound count, and sampled
framebuffer color count. `--no-audio` isolates the graphics path.

`coop-harness.ts` launches two rendered processes with audio enabled, scripts guest movement and
shooting, and writes host/guest PNGs plus JSON telemetry to ignored
`captures/coop/`. It asserts the host remains stationary, player 2 moves and
fires, both views render, snapshots arrive, a second room starts, and the host
records the guest leaving. It needs no manual input.

`record.ts` writes `*.demo.json` command recordings with a final-state hash,
`*.events.jsonl` journals, and checkpoint snapshots. `replay.ts` verifies
the final state and hash by resimulating commands in the pure model. These
recordings do not replay Bullet-constrained movement from a live session;
capture snapshots and event journals are inspection output, not replay inputs.
The generated `records/` and `captures/` directories
are ignored by Git.

See [RESULTS.md](RESULTS.md) for observed results and remaining work.
