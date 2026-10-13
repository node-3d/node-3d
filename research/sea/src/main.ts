import * as THREE from 'three';
import { Screen, addThreeHelpers, init } from '@node-3d/core';

if (process.argv.includes('--smoke')) {
	if (typeof init !== 'function' || typeof Screen !== 'function') {
		throw new Error('Node3D public entry did not load');
	}
	console.log(`SEA loaded Node3D with Node.js ${process.versions.node}`);
} else {
	const { doc, loop } = init({
		isGles3: true,
		vsync: true,
		autoEsc: true,
		title: 'Node3D SEA research',
		mode: 'windowed',
	});
	addThreeHelpers();

	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x182238);
	const camera = new THREE.PerspectiveCamera(70, doc.w / doc.h, 0.1, 100);
	camera.position.z = 5;
	const screen = new Screen({ camera, scene });

	scene.add(new THREE.AmbientLight(0xffffff, 2));
	const cube = new THREE.Mesh(
		new THREE.BoxGeometry(2, 2, 2),
		new THREE.MeshNormalMaterial(),
	);
	scene.add(cube);

	loop((now) => {
		cube.rotation.x = now * 0.0005;
		cube.rotation.y = now * 0.001;
		screen.draw();
	});
}
