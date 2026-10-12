import * as THREE from 'three';
import { Screen, init } from '@node-3d/core';
import { GUI } from '../gui.ts';

const { doc, loop } = init({
	major: 3,
	minor: 3,
	vsync: true,
	title: 'Node3D lil-gui research: crate controls',
	autoEsc: true,
});

const scene = new THREE.Scene();
scene.background = new THREE.Color('#17253c');
const camera = new THREE.PerspectiveCamera(65, doc.width / doc.height, 0.1, 100);
camera.position.z = 4;
const material = new THREE.MeshNormalMaterial();
const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 1.8), material);
scene.add(mesh);
const screen = new Screen({ doc, scene, camera });

const params = {
	speed: 0.7,
	wireframe: false,
	background: '#17253c',
	reset: () => {
		mesh.rotation.set(0, 0, 0);
	},
};

const gui = new GUI(doc);
const appearance = gui.addFolder('Appearance');
gui.add(params, 'speed', 0, 3, 0.01).name('Rotation speed').listen();
appearance.add(params, 'wireframe').onChange((value) => {
	material.wireframe = value as boolean;
});
appearance.addColor(params, 'background').onChange((value) => {
	scene.background = new THREE.Color(value as string);
});
appearance
	.add(camera, 'fov', 30, 100)
	.name('Camera FOV')
	.onChange(() => {
		camera.updateProjectionMatrix();
	});
gui.add(params, 'reset').name('Reset rotation');

const capture = process.argv
	.find((arg) => arg.startsWith('--capture='))
	?.slice('--capture='.length);
let frames = 0;
let previous = 0;
const stop = loop((now) => {
	const seconds = previous === 0 ? 0 : Math.min(0.1, (now - previous) / 1000);
	previous = now;
	mesh.rotation.x += params.speed * seconds * 0.5;
	mesh.rotation.y += params.speed * seconds;
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
