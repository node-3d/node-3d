import * as three from 'three';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { init } from '@node-3d/core';
import { init as initWebaudio } from '@node-3d/plugin-webaudio';

const { doc } = init({ isGles3: true, isWebGL2: true, width: 320, height: 240 });
console.log('core ready');
initWebaudio({ window: doc });
console.log('plugin ready');
const listener = new three.AudioListener();
console.log('listener ready', listener.context.sampleRate);
listener.context.decodeAudioData(
	readFileSync(
		fileURLToPath(
			new URL('../../packages/plugin-webaudio/examples/sounds/hit.wav', import.meta.url),
		),
	) as unknown as ArrayBuffer,
	(buffer) => {
		console.log('loaded buffer', buffer.length);
		const audio = new three.Audio(listener);
		audio.setBuffer(buffer);
		console.log('audio ready');
		audio.play();
		console.log('play requested');
		setTimeout(() => {
			audio.stop();
			console.log('audio stopped');
			process.exit(0);
		}, 300);
	},
);
setTimeout(() => {
	console.error('Audio load timed out');
	process.exit(2);
}, 2000);
