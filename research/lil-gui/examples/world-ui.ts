/** Render GameUI into a Three.js texture and display it on an in-world panel. */
import * as THREE from 'three';
import { fileURLToPath } from 'node:url';
import { init, Screen } from '@node-3d/core';
import { GameUI, rgba } from '../game-ui.ts';

const { doc, loop } = init({
	major: 3,
	minor: 3,
	width: 960,
	height: 640,
	vsync: true,
	title: 'Node3D game UI research: world panel',
});
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10202c);
const camera = new THREE.PerspectiveCamera(55, doc.width / doc.height, 0.1, 100);
camera.position.set(0, 1.6, 5);
camera.lookAt(0, 1.4, 0);
const screen = new Screen({ doc, scene, camera });
const ui = new GameUI(doc);
const font = await ui.loadFont(
	fileURLToPath(
		new URL(
			'../../../packages/qml-themedui/examples/qml/fonts/OpenSans-Regular.ttf',
			import.meta.url,
		),
	),
	44,
);
const texture = new THREE.WebGLRenderTarget(640, 320, {
	depthBuffer: false,
	stencilBuffer: false,
	magFilter: THREE.LinearFilter,
	minFilter: THREE.LinearFilter,
});
const panel = new THREE.Mesh(
	new THREE.PlaneGeometry(3.2, 1.6),
	new THREE.MeshBasicMaterial({
		map: texture.texture,
		transparent: true,
		side: THREE.DoubleSide,
	}),
);
panel.position.y = 1.55;
panel.rotation.y = -0.24;
scene.add(panel);

const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(12, 12),
	new THREE.MeshBasicMaterial({ color: 0x2b414b }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.02;
scene.add(floor);
const pedestal = new THREE.Mesh(
	new THREE.CylinderGeometry(0.07, 0.1, 1.5),
	new THREE.MeshBasicMaterial({ color: 0x8195a2 }),
);
pedestal.position.set(0, 0.65, -0.05);
scene.add(pedestal);

const capture = process.argv.find((arg) => arg.startsWith('--capture='))?.slice(10);
const smokeWindow = process.argv.includes('--smoke-window');
let frame = 0;
const stop = loop((now) => {
	if (smokeWindow && (frame === 4 || frame === 10))
		ui.rebindWindow(() => {
			doc.mode = 'borderless';
		});
	if (smokeWindow && (frame === 7 || frame === 13))
		ui.rebindWindow(() => {
			doc.mode = 'windowed';
		});
	const value = capture ? 73 : Math.round(50 + 40 * Math.sin(now * 0.001));
	ui.begin();
	ui.rect(0, 0, 640, 320, rgba(6, 18, 28, 238));
	ui.rect(12, 12, 616, 296, rgba(16, 48, 60, 245));
	ui.text(42, 36, 'STATION 07', 44, rgba(229, 247, 242), font);
	ui.text(42, 109, 'POWER', 25, rgba(147, 205, 213), font);
	ui.text(460, 90, `${value}%`, 49, rgba(132, 236, 170), font);
	ui.bar(42, 171, 555, 34, value / 100, rgba(72, 211, 144));
	ui.text(42, 239, 'SYSTEM ONLINE', 25, rgba(229, 247, 242), font);
	ui.drawToTarget(screen.renderer, texture);
	screen.draw();
	if (capture && ++frame === (smokeWindow ? 19 : 12)) {
		screen.snapshot(capture);
		console.log(`World UI captured to ${capture}`);
		stop();
		ui.destroy();
		texture.dispose();
		doc.destroy();
	}
});
