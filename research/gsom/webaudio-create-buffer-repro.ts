/** Isolated native crash repro; run in a child process because it may terminate Node. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AudioContext } from '@node-3d/webaudio';

const context = new AudioContext();
console.log(`AudioContext ready; sampleRate=${context.sampleRate}`);
if (process.argv.includes('--decode')) {
	const sample = readFileSync(
		fileURLToPath(new URL('../../packages/webaudio/examples/samples/hit.wav', import.meta.url)),
	);
	context.decodeAudioData(sample, () => console.log('decodeAudioData callback reached'));
} else {
	console.log('Calling createBuffer() with no arguments');
	const buffer = context.createBuffer();
	console.log(`createBuffer returned; length=${buffer.length}`);
}
