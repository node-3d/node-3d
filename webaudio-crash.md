# WebAudio `createBuffer()` crash regression

## Original symptom

The GSOM research demo previously terminated Node with a native access violation
when calling `AudioContext.createBuffer()` without arguments. Decoding generated
WAV data through `decodeAudioData()` worked, so the demo used that path while the
addon was investigated. The isolated historical repro is
`research/gsom/webaudio-create-buffer-repro.ts`.

The no-argument call is outside the declared API: `createBuffer()` requires
`numberOfChannels`, `length`, and `sampleRate`. It should reject the call without
terminating the process.

## Verification after package update (Windows x64, Node 24.13.0)

The checked out workspaces are `@node-3d/webaudio` 6.0.3,
`@node-3d/deps-labsound` 7.0.2, and `@node-3d/plugin-webaudio` 4.0.2.
`npm install` completed without tracked file changes. The following checks then
passed:

- `node research/gsom/webaudio-create-buffer-repro.ts` now exits with a JavaScript
  `TypeError` stating that three arguments are required. Node remains intact.
- `node --test packages/webaudio/ts/audio-buffer.test.ts` passed all four tests,
  covering valid buffer creation, writable channels, invalid arguments, decoding,
  and source playback.
- `node research/gsom/audio-probe.ts` decoded, played, and stopped a sample.
- An audio-enabled GSOM combat capture created four tone buffers, recorded a shot,
  rendered a nonblank frame, and exited normally.
- The two-process co-op harness completed with WebAudio enabled in both processes.

GSOM now writes tone samples directly into valid `AudioBuffer` instances. These
runtime checks establish that the original crash path no longer terminates Node
and that the demo's audio calls run. Speaker output and sound quality were not
measured. The standalone buffer tests emitted two RtAudio "a stream is already
open" diagnostics while all assertions passed; the two-process GSOM logs did
not contain that diagnostic.
