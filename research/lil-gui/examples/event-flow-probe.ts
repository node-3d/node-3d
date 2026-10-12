/** Exercise modal routing, resize, and controlled GLFW context recreation. */
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { init, Screen } from '@node-3d/core';
import { GameUI, rgba } from '../game-ui.ts';

const { doc, loop } = init({
	major: 3,
	minor: 3,
	width: 640,
	height: 480,
	vsync: false,
	title: 'GameUI event flow probe',
});
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x192c3a);
const camera = new THREE.PerspectiveCamera(60, doc.width / doc.height, 0.1, 10);
camera.position.z = 3;
const screen = new Screen({ doc, scene, camera });
const originalHandle = doc.handle;
const ui = new GameUI(doc);
const image = await ui.loadImage(
	fileURLToPath(
		new URL('../../../packages/plugin-qml/examples/fps/qml/crosshair121.png', import.meta.url),
	),
);
const font = await ui.loadFont(
	fileURLToPath(
		new URL(
			'../../../packages/qml-themedui/examples/qml/fonts/OpenSans-Regular.ttf',
			import.meta.url,
		),
	),
	32,
);
ui.setInputMode('modal', { passthroughKeys: ['Escape'] });

let gameKeys = 0;
let gameClicks = 0;
doc.on('keydown', (event) => {
	if (!ui.routeEvent(event)) gameKeys++;
});
doc.on('mousedown', (event) => {
	if (!ui.routeEvent(event)) gameClicks++;
});
const keyEvent = {
	type: 'keydown',
	code: 'KeyW',
	key: 'w',
	which: 87,
	keyCode: 87,
	charCode: 119,
	repeat: false,
	altKey: false,
	ctrlKey: false,
	metaKey: false,
	shiftKey: false,
};
const mouseEvent = {
	type: 'mousedown',
	x: 100,
	y: 100,
	clientX: 100,
	clientY: 100,
	pageX: 100,
	pageY: 100,
	button: 0,
	buttons: 1,
	which: 1,
	movementX: 0,
	movementY: 0,
	altKey: false,
	ctrlKey: false,
	metaKey: false,
	shiftKey: false,
};
doc.emit('keydown', { ...keyEvent });
doc.emit('mousedown', { ...mouseEvent });
assert.equal(gameKeys, 0);
assert.equal(gameClicks, 0);

assert.equal(ui.routeEvent({ type: 'pointerdown' }), true);
assert.equal(ui.routeEvent({ type: 'keydown', code: 'KeyW' }), true);
assert.equal(ui.routeEvent({ type: 'keyup', code: 'Escape' }), false);
ui.setInputMode('passthrough');
assert.equal(ui.routeEvent({ type: 'pointerdown' }), false);
doc.emit('keydown', { ...keyEvent });
doc.emit('mousedown', { ...mouseEvent });
assert.equal(gameKeys, 1);
assert.equal(gameClicks, 1);
ui.setInputMode('modal', { passthroughKeys: ['Escape'] });

const capture = process.argv.find((arg) => arg.startsWith('--capture='))?.slice(10);
const alternateMode = process.argv.includes('--fullscreen') ? 'fullscreen' : 'borderless';
let frame = 0;
let resized = false;
let uiClicks = 0;
const stop = loop(() => {
	if (frame === 2) doc.wh = [800, 500];
	if (frame === 5 || frame === 11) {
		assert.equal(doc.width, 800);
		assert.equal(doc.height, 500);
		resized = true;
		ui.rebindWindow(() => {
			doc.mode = alternateMode;
		});
		assert.notEqual(doc.handle, originalHandle);
	}
	if (frame === 8 || frame === 14) {
		ui.rebindWindow(() => {
			doc.mode = 'windowed';
		});
		assert.equal(doc.handle, originalHandle);
	}
	if (frame === 16) {
		const atButton = {
			...mouseEvent,
			x: 100,
			y: 170,
			clientX: 100,
			clientY: 170,
			pageX: 100,
			pageY: 170,
		};
		doc.emit('mousemove', { ...atButton, type: 'mousemove' });
		doc.emit('mousedown', atButton);
	}
	if (frame === 17) {
		doc.emit('mouseup', {
			...mouseEvent,
			type: 'mouseup',
			x: 100,
			y: 170,
			clientX: 100,
			clientY: 170,
			pageX: 100,
			pageY: 170,
			buttons: 0,
		});
	}
	screen.draw();
	ui.begin();
	ui.rect(20, 20, 350, 100, rgba(18, 61, 77, 235));
	ui.text(35, 34, 'UI RESTORED', 32, rgba(235, 246, 245), font);
	ui.image(image, 300, 37, 54, 54);
	ui.button('probe', 'CLICK', 20, 140, 180, 60, () => uiClicks++);
	ui.draw();
	screen.renderer.resetState();
	if (++frame === 19) {
		assert.equal(resized, true);
		assert.equal(doc.mode, 'windowed');
		assert.equal(uiClicks, 1);
		if (capture) screen.snapshot(capture);
		stop();
		ui.destroy();
		doc.destroy();
		console.log('GameUI modal routing, resize, and window recreation passed');
	}
});
