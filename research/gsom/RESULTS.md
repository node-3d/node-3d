# GSOM research results

## Refactor validation on this Windows x64 workspace (2026-10-13)

- `demo.ts` now composes the engine-independent layout, Three.js/Bullet world,
  QML/audio presentation, capture driver, and Gabenet adapter. Static collision
  shapes and their placeholder meshes come from the same layout data.
- TypeScript checking passed. Nine pure `node:test` cases passed: the existing
  six model cases and three new packet/event-sequence cases.
- All six capture phases completed with `--no-audio`, each with 136–172 sampled
  framebuffer colors. Combat and victory PNGs were visually inspected.
- The audio-enabled two-process co-op harness passed: 159 guest inputs and 27
  snapshots in the final run, movement/fire observed, second room reached, and guest
  departure recorded. Host and guest PNGs were visually inspected.
- No manual keyboard/mouse feel, audible speaker output, LAN transport, or
  packet-loss behavior was evaluated in this refactor pass.

## Observed on this Windows x64 workspace

- The pure model passed six `node:test` cases: victory and loss transitions,
  invalid command handling, deterministic replay, independent two-subject input,
  a collision adapter, and joining/leaving an active run.
- Scripted victory completed in 160 fixed ticks with five kills and 35 events.
  Scripted loss completed in 610 ticks with 22 events. Both command recordings
  replayed to matching final-state SHA-256 hashes.
- The QML plus Three.js renderer captured all six requested phases. The
  framebuffer check found 32 to 48 sampled colors across those captures, and
  the menu, combat, upgrade, and victory frames were visually inspected.
  Generated PNGs and JSON summaries are under ignored `captures/`.
- A visual pass added selected Kenney CC0 GLB models for corridor walls, the
  gate, crates, weapons, co-op partner, and enemy robots, plus a QML font,
  crosshair, and panel details. The updated solo combat capture sampled 172
  colors; the host and guest co-op frames were also visually inspected. Ten
  model files load in each rendered process. Asset sources and original license
  files are under `assets/kenney/`.
- With WebAudio 6.0.3 and deps-labsound 7.0.2, four tones were generated directly
  through `AudioContext.createBuffer()` and writable channel data. An audio-enabled
  combat capture recorded one shot and exited normally. `audio-probe.ts` also
  decoded an existing sample, played it, and stopped it. The WebAudio buffer
  tests passed four cases, including invalid arguments and source playback.
  These checks exercise native calls; they do not measure audible output quality.
- `physics-probe.ts` identified floor, wall, and crate bodies with Bullet ray
  hits. The visual demo uses Bullet ray queries to block player movement into
  room solids.
- `coop-probe.ts` sent guest movement and fire commands over a Gabenet local
  socket pair, updated player 2 on the host, and returned snapshots. A guest
  command claiming player 1 was mapped to player 2; the host player stayed put.
- `coop-harness.ts` ran two independent QML/Three.js/Bullet/WebAudio processes over
  direct loopback UDP. Recent runs delivered more than 160 guest inputs and
  about 20 snapshots; both captured detailed combat frames. Player 2 moved
  forward and fired while player 1 stayed at z=5.
  The host advanced to room 2 and recorded the guest disconnect. The exact
  counts vary with render timing. PNGs, event journals, commands, and network
  metrics are under ignored `captures/coop/`.
- TypeScript type checking and formatting checks passed. The separate WebAudio
  crash repro is excluded from the GSOM type-check project because it
  intentionally calls `createBuffer()` outside its declared signature. The root Oxlint
  configuration excludes `research/`; forcing that package-wide lint config
  onto the research folder reports style rules that are not a repository gate.

## Limits and next questions

- Co-op has been validated between two local processes. LAN connectivity,
  packet loss, latency, reconnects, and remote interpolation have not been
  measured. The guest camera follows the latest authoritative snapshot, so
  visible motion may step under delayed or irregular delivery. One guest is
  supported; the host controls shared upgrades and room transitions.
- Bullet collision uses a forward ray and blocks the step on contact. A swept
  capsule and sliding response are needed for polished FPS movement. Enemy
  movement and hits are still simple model geometry.
- The earlier no-argument `AudioContext.createBuffer()` crash now produces a
  `TypeError` and leaves Node intact. The demo uses valid arguments and direct
  channel writes. See the root `webaudio-crash.md` for the regression record.
- Screenshot captures verify native rendering and nonblank framebuffer output.
  Physical keyboard/mouse feel, sound heard from speakers, and gameplay balance
  were not manually evaluated in this session.
- The prototype has one corridor layout, two enemy groups, one shared upgrade
  choice per room, and no persistence or compute effect. The next gameplay
  milestone is a movement and combat feel pass with a proper player collider.
