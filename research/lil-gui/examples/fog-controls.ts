import * as THREE from 'three';
import { Screen, init } from '@node-3d/core';
import { GUI } from '../gui.ts';

const { doc, loop } = init({
	major: 3,
	minor: 3,
	vsync: true,
	title: 'Node3D lil-gui research: fog controls',
	autoEsc: true,
});

const scene = new THREE.Scene();
scene.background = new THREE.Color('#536d89');
scene.fog = new THREE.FogExp2('#536d89', 0.11);
const camera = new THREE.PerspectiveCamera(65, doc.width / doc.height, 0.1, 100);
camera.position.set(0, 2, 8);
camera.lookAt(0, 0, -8);
const geometry = new THREE.SphereGeometry(0.75, 32, 24);
const material = new THREE.MeshNormalMaterial();
for (let i = 0; i < 12; i++) {
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(((i % 3) - 1) * 2.2, 0, -Math.floor(i / 3) * 3);
	scene.add(mesh);
}
const screen = new Screen({ doc, scene, camera });

const params = {
	density: 0.11,
	fogColor: '#536d89',
	mode: 'Fog',
	spin: true,
};
const gui = new GUI(doc);
gui.add(params, 'density', 0, 0.3, 0.005).onChange((value) => {
	if (scene.fog instanceof THREE.FogExp2) scene.fog.density = value as number;
});
gui.addColor(params, 'fogColor')
	.name('Fog color')
	.onChange((value) => {
		const color = new THREE.Color(value as string);
		scene.background = color;
		if (scene.fog) scene.fog.color.copy(color);
	});
const motion = gui.addFolder('Motion');
motion.add(params, 'mode', ['Fog', 'Clear']).onChange((value) => {
	scene.fog = value === 'Fog' ? new THREE.FogExp2(params.fogColor, params.density) : null;
});
motion.add(params, 'spin');

const capture = process.argv
	.find((arg) => arg.startsWith('--capture='))
	?.slice('--capture='.length);
let frames = 0;
const stop = loop(() => {
	if (params.spin) scene.rotation.y += 0.002;
	screen.draw();
	gui.draw();
	screen.renderer.resetState();
	if (capture && ++frames === 90) {
		screen.snapshot(capture);
		console.log(`Captured ${capture} after ${frames} frames`);
		stop();
		gui.destroy();
		doc.destroy();
	}
});
