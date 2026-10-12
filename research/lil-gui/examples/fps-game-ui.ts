/** QML FPS UI study: start, HUD, pause, and game-over through native GameUI. */
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { init, Screen } from '@node-3d/core';
import { glfw } from '@node-3d/glfw';
import type { TKeyEvent, TMouseMoveEvent } from '@node-3d/glfw';
import { GameUI, rgba } from '../game-ui.ts';

type Mode = 'start' | 'hud' | 'esc' | 'over';
const { doc, loop } = init({
	major: 3,
	minor: 3,
	width: 1280,
	height: 720,
	vsync: true,
	title: 'Node3D game UI research: FPS screens',
});
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x182631);
scene.fog = new THREE.Fog(0x182631, 18, 65);
const camera = new THREE.PerspectiveCamera(72, doc.width / doc.height, 0.1, 100);
camera.position.set(0, 2.2, 8);
const screen = new Screen({ doc, scene, camera });
scene.add(new THREE.HemisphereLight(0xb9d6e8, 0x253018, 2.0));
const sun = new THREE.DirectionalLight(0xffdfae, 2.2);
sun.position.set(-4, 8, 7);
scene.add(sun);
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	new THREE.MeshStandardMaterial({ color: 0x354b45, roughness: 1 }),
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);
for (let i = -5; i <= 5; i++) {
	const marker = new THREE.Mesh(
		new THREE.BoxGeometry(0.09, 0.04, 40),
		new THREE.MeshStandardMaterial({ color: 0x6c847c }),
	);
	marker.position.set(i * 4, 0.03, -10);
	scene.add(marker);
}
const targets: THREE.Mesh[] = [];
for (let i = 0; i < 9; i++) {
	const target = new THREE.Mesh(
		new THREE.IcosahedronGeometry(0.7, 1),
		new THREE.MeshStandardMaterial({
			color: i % 2 ? 0xd69863 : 0x63ccd6,
			metalness: 0.2,
			roughness: 0.4,
		}),
	);
	target.position.set(
		((i % 3) - 1) * 3.6,
		1.5 + Math.floor(i / 3) * 1.3,
		-6 - Math.floor(i / 3) * 5,
	);
	targets.push(target);
	scene.add(target);
}

const ui = new GameUI(doc);
const crosshair = await ui.loadImage(
	fileURLToPath(
		new URL('../../../packages/plugin-qml/examples/fps/qml/crosshair121.png', import.meta.url),
	),
);
let mode: Mode = 'start';
ui.setInputMode('modal', { passthroughKeys: ['Escape'] });
let health = 100;
let fuel = 1;
let charge = 0;
let score = 0;
let charging = false;
let flash = 0;
let flashColor = rgba(74, 190, 80, 100);
const keys = new Set<string>();
let yaw = 0;
let pitch = 0;

function enter(next: Mode): void {
	mode = next;
	charging = false;
	keys.clear();
	ui.setInputMode(next === 'hud' ? 'passthrough' : 'modal', {
		passthroughKeys: ['Escape'],
	});
	if (next === 'hud') doc.setPointerCapture();
	else doc.releasePointerCapture();
}

function restart(): void {
	health = 100;
	fuel = 1;
	charge = 0;
	score = 0;
	camera.position.set(0, 2.2, 8);
	yaw = 0;
	pitch = 0;
	enter('hud');
}

doc.on('keydown', (event: TKeyEvent) => {
	if (ui.routeEvent(event)) return;
	if (event.code) keys.add(event.code);
	if (event.code === 'KeyK' && mode === 'hud') {
		health = 0;
		enter('over');
	}
});
doc.on('keyup', (event: TKeyEvent) => {
	if (ui.routeEvent(event)) return;
	if (event.code) keys.delete(event.code);
	if (event.code === 'Escape') {
		if (mode === 'hud') enter('esc');
		else if (mode === 'esc') enter('hud');
	}
});
doc.on('mousemove', (event: TMouseMoveEvent) => {
	if (ui.routeEvent(event)) return;
	if (mode !== 'hud' || captureMode) return;
	if (Math.abs(event.movementX) > 80 || Math.abs(event.movementY) > 80) return;
	yaw -= event.movementX * 0.0015;
	pitch = Math.max(-1.2, Math.min(1.2, pitch - event.movementY * 0.0015));
});
doc.on('mousedown', (event) => {
	if (ui.routeEvent(event)) return;
	if (mode === 'hud' && !ui.wantsCaptureMouse) charging = true;
});
doc.on('mouseup', (event) => {
	if (ui.routeEvent(event)) return;
	if (mode !== 'hud' || !charging) return;
	charging = false;
	const target = targets[Math.floor(Math.random() * targets.length)];
	target.material = new THREE.MeshStandardMaterial({ color: 0x8de0a1, emissive: 0x1f6b37 });
	score += 10;
	charge = 0;
	flash = 0.35;
	flashColor = rgba(74, 190, 80, 90);
});
doc.on('resize', () => {
	camera.aspect = doc.width / doc.height;
	camera.updateProjectionMatrix();
	screen.renderer.setSize(doc.width, doc.height);
});

function drawMenu(title: string, buttons: [string, () => void][]): void {
	const w = doc.innerWidth;
	const h = doc.innerHeight;
	ui.rect(0, 0, w, h, rgba(4, 8, 13, 195));
	ui.text(w / 2 - title.length * 16, h / 2 - 150, title, 58, rgba(239, 240, 214));
	buttons.forEach(([label, action], index) => {
		ui.button(
			label.toLowerCase(),
			label,
			w / 2 - 190,
			h / 2 - 35 + index * 76,
			380,
			60,
			action,
		);
	});
}

function drawHud(): void {
	const w = doc.innerWidth;
	const h = doc.innerHeight;
	ui.rect(0, h - 142, w, 142, rgba(5, 12, 19, 145));
	ui.text(
		42,
		h - 121,
		String(Math.floor(health)),
		70,
		health > 35 ? rgba(100, 221, 132) : rgba(240, 93, 69),
	);
	ui.text(45, h - 47, 'HEALTH', 25, rgba(226, 238, 233));
	ui.text(w - 273, h - 111, 'FUEL', 25, rgba(226, 238, 233));
	ui.bar(w - 270, h - 74, 228, 22, fuel, rgba(81, 198, 104));
	ui.text(w - 273, h - 45, 'CHARGE', 22, rgba(226, 238, 233));
	ui.bar(w - 270, h - 18, 228, 14, charge, rgba(236, 162, 61));
	ui.text(w - 250, 24, `SCORE ${score}`, 34, rgba(244, 235, 191));
	ui.image(crosshair, w / 2 - 28, h / 2 - 28, 56, 56);
	if (flash > 0) ui.rect(0, 0, w, h, flashColor);
}

function drawUi(): void {
	ui.begin();
	if (mode === 'start')
		drawMenu('TARGET RANGE', [
			['START', restart],
			['QUIT', () => process.exit(0)],
		]);
	if (mode === 'hud') drawHud();
	if (mode === 'esc')
		drawMenu('PAUSED', [
			['RESUME', () => enter('hud')],
			['RESTART', restart],
			['LEAVE', () => enter('start')],
		]);
	if (mode === 'over') {
		drawMenu(`SCORE ${score}`, [
			['RESTART', restart],
			['QUIT', () => process.exit(0)],
		]);
	}
	ui.draw();
	// Three.js caches OpenGL state; the native overlay changes that state.
	screen.renderer.resetState();
}

const capture = process.argv.find((arg) => arg.startsWith('--capture='))?.slice(10);
const captureMode = process.argv.find((arg) => arg.startsWith('--capture-mode='))?.slice(15) as
	| Mode
	| undefined;
const smokePause = process.argv.includes('--smoke-pause');
const smokeOver = process.argv.includes('--smoke-over');
const smokeStart = process.argv.includes('--smoke-start') || smokePause || smokeOver;
if (captureMode && !['start', 'hud', 'esc', 'over'].includes(captureMode))
	throw new Error('Invalid capture mode');
if (captureMode) mode = captureMode;
let frame = 0;
let previous = 0;
function emitClick(type: 'mousemove' | 'mousedown' | 'mouseup', down: boolean): void {
	doc.emit(type, {
		type,
		x: doc.innerWidth / 2,
		y: doc.innerHeight / 2,
		clientX: doc.innerWidth / 2,
		clientY: doc.innerHeight / 2,
		pageX: doc.innerWidth / 2,
		pageY: doc.innerHeight / 2,
		button: 0,
		buttons: down ? 1 : 0,
		which: 1,
		movementX: 0,
		movementY: 0,
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		metaKey: false,
	});
}
function emitKey(type: 'keydown' | 'keyup', code: string, key: string): void {
	const keyCode = code === 'Escape' ? glfw.KEY_ESCAPE : key.toUpperCase().charCodeAt(0);
	doc.emit(type, {
		type,
		code,
		key,
		keyCode,
		which: keyCode,
		charCode: 0,
		repeat: false,
		ctrlKey: false,
		shiftKey: false,
		altKey: false,
		metaKey: false,
	});
}
const stop = loop((now) => {
	const dt = previous ? Math.min(0.05, (now - previous) / 1000) : 0;
	previous = now;
	for (const [index, target] of targets.entries()) {
		target.rotation.y += dt * 0.3;
		target.position.y += Math.sin(now * 0.001 + index) * dt * 0.12;
	}
	if (mode === 'hud') {
		camera.rotation.set(pitch, yaw, 0, 'YXZ');
		const speed = dt * 5;
		if (keys.has('KeyW')) camera.translateZ(-speed);
		if (keys.has('KeyS')) camera.translateZ(speed);
		if (keys.has('KeyA')) camera.translateX(-speed);
		if (keys.has('KeyD')) camera.translateX(speed);
		camera.position.y = 2.2;
		fuel = Math.min(1, fuel + dt * 0.3);
		if (charging) {
			const delta = Math.min(fuel, dt * 0.7);
			fuel -= delta;
			charge = Math.min(1, charge + delta);
		}
		health = Math.max(0, health - dt * 0.7);
		if (health === 0) enter('over');
	}
	flash = Math.max(0, flash - dt);
	screen.draw();
	if (smokeStart && frame === 4) {
		emitClick('mousemove', false);
		emitClick('mousedown', true);
	}
	if (smokeStart && frame === 5) emitClick('mouseup', false);
	if (smokePause && frame === 10) emitKey('keyup', 'Escape', 'Escape');
	if (smokeOver && frame === 10) emitKey('keydown', 'KeyK', 'k');
	drawUi();
	if (capture && ++frame === 20) {
		const expected: Mode | undefined = smokePause
			? 'esc'
			: smokeOver
				? 'over'
				: smokeStart
					? 'hud'
					: undefined;
		if (expected) console.log(`Game UI input state: expected ${expected}, observed ${mode}`);
		if (expected && mode !== expected)
			throw new Error(`Expected ${expected} after input, got ${mode}`);
		screen.snapshot(capture);
		console.log(`Game UI captured ${mode} to ${capture}`);
		stop();
		ui.destroy();
		doc.destroy();
	}
});
