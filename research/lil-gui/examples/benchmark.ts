import { performance } from 'node:perf_hooks';
import * as THREE from 'three';
import { Screen, init } from '@node-3d/core';
import { GUI } from '../gui.ts';

const count = Number(process.argv[2] ?? 10);
if (!Number.isInteger(count) || count < 0 || count > 1000)
	throw new Error('Expected 0-1000 controls');
const { doc, loop } = init({
	major: 3,
	minor: 3,
	vsync: true,
	title: `Node3D lil-gui benchmark: ${count} controls`,
});
const scene = new THREE.Scene();
scene.background = new THREE.Color('#17253c');
const camera = new THREE.PerspectiveCamera(65, doc.width / doc.height, 0.1, 100);
camera.position.z = 4;
const cube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), new THREE.MeshNormalMaterial());
scene.add(cube);
const screen = new Screen({ doc, scene, camera });
const gui = count > 0 ? new GUI(doc) : null;
if (gui) gui.measure = true;
const params: Record<string, number> = {};
for (let i = 0; i < count; i++) {
	const key = `value${i}`;
	params[key] = i / Math.max(1, count);
	gui?.add(params, key, 0, 1, 0.001).name(`Value ${i}`);
}

const sceneMs: number[] = [];
const guiMs: number[] = [];
const snapshotMs: number[] = [];
const nativeMs: number[] = [];
const applyMs: number[] = [];
let frame = 0;
const stop = loop(() => {
	cube.rotation.y += 0.01;
	const start = performance.now();
	screen.draw();
	const afterScene = performance.now();
	gui?.draw();
	if (gui) screen.renderer.resetState();
	const afterGui = performance.now();
	if (frame >= 60) {
		sceneMs.push(afterScene - start);
		guiMs.push(afterGui - afterScene);
		if (gui) {
			snapshotMs.push(gui.lastTiming.snapshotMs);
			nativeMs.push(gui.lastTiming.nativeMs);
			applyMs.push(gui.lastTiming.applyMs);
		}
	}
	frame++;
	if (frame === 240) {
		stop();
		gui?.destroy();
		doc.destroy();
		const summary = (samples: number[]) => {
			const ordered = [...samples].sort((a, b) => a - b);
			return {
				median: ordered[Math.floor(ordered.length / 2)],
				p95: ordered[Math.floor(ordered.length * 0.95)],
			};
		};
		console.log(
			JSON.stringify({
				controls: count,
				frames: sceneMs.length,
				sceneMs: summary(sceneMs),
				guiMs: summary(guiMs),
				snapshotMs: count ? summary(snapshotMs) : null,
				nativeMs: count ? summary(nativeMs) : null,
				applyMs: count ? summary(applyMs) : null,
			}),
		);
	}
});
