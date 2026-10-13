import { resolve } from 'node:path';
import * as three from 'three';
import { addThreeHelpers, gl, init } from '@node-3d/core';
import { init as initQml } from '@node-3d/plugin-qml';
import { init as initWebaudio } from '@node-3d/plugin-webaudio';
import type { TKeyEvent, TMouseMoveEvent } from '@node-3d/glfw';
import { CaptureDriver } from './capture.ts';
import { Game, STEP, type Command, type GameState, type Player } from './model.ts';
import { CoopNetwork } from './network.ts';
import { createPresentation } from './presentation.ts';
import { createWorld } from './world.ts';

const captureArgument = process.argv.find((arg) => arg.startsWith('--capture='));
const capturePath = captureArgument ? resolve(captureArgument.slice('--capture='.length)) : null;
const capturePhase =
	process.argv
		.find((arg) => arg.startsWith('--capture-phase='))
		?.slice('--capture-phase='.length) ?? 'combat';
const noAudio = process.argv.includes('--no-audio');
const hostArg = process.argv.find((arg) => arg.startsWith('--coop-host='));
const joinArg = process.argv.find((arg) => arg.startsWith('--coop-join='));
if (hostArg && joinArg) throw new Error('Choose host or guest');
const autoCoop = process.argv.includes('--auto-coop');
const port = hostArg
	? Number(hostArg.slice('--coop-host='.length))
	: joinArg
		? Number(joinArg.slice(joinArg.lastIndexOf(':') + 1))
		: 0;
if ((hostArg || joinArg) && (!Number.isInteger(port) || port < 1024 || port > 65535))
	throw new Error('Invalid co-op port');
const network = hostArg
	? new CoopNetwork({ role: 'host', port })
	: joinArg
		? new CoopNetwork({
				role: 'guest',
				host: joinArg.slice('--coop-join='.length, joinArg.lastIndexOf(':')),
				port,
			})
		: null;
const isGuest = network?.role === 'guest';
const capture = new CaptureDriver(capturePath, capturePhase, autoCoop);

const { doc } = init({
	isGles3: true,
	isWebGL2: true,
	mode: 'windowed',
	width: 960,
	height: 540,
	vsync: true,
});
doc.title = 'GSOM research slice';
addThreeHelpers();
if (!noAudio) initWebaudio({ window: doc });
const qml = initQml({ doc, gl, cwd: import.meta.dirname, three });
const renderer = new three.WebGLRenderer({ antialias: true });
renderer.setSize(doc.w, doc.h);
renderer.setPixelRatio(1);
renderer.outputColorSpace = three.SRGBColorSpace;
renderer.toneMapping = three.ACESFilmicToneMapping;
const scene = new three.Scene();
scene.background = new three.Color(0x12232b);
scene.fog = new three.Fog(0x12232b, 12, 42);
const camera = new three.PerspectiveCamera(78, doc.w / doc.h, 0.1, 80);
camera.rotation.order = 'YXZ';
const listener = noAudio ? null : new three.AudioListener();
if (listener) camera.add(listener);
scene.add(camera);
const world = await createWorld(scene, camera);
const game = new Game(world.resolveCollision);
const presentation = createPresentation(scene, camera, qml, world, listener);
if (hostArg) console.log(`COOP_READY ${port}`);

const viewState = (): GameState => (isGuest ? (network?.state ?? game.state) : game.state);
const localPlayer = (state: GameState): Player =>
	(isGuest ? state.partner : state.player) ?? state.player;
function dispatch(command: Command): void {
	if (isGuest) {
		if (command.type === 'move' || command.type === 'fire' || command.type === 'select-weapon')
			network?.sendInput(command);
	} else game.dispatch(command);
}

const keys = new Set<string>();
let yaw = 0;
let pitch = 0;
let firing = false;
function input(): void {
	const state = viewState();
	if ((state.phase !== 'combat' && state.phase !== 'exit') || (isGuest && !state.partner)) return;
	const right = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
	const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
	dispatch({
		type: 'move',
		x: right * Math.cos(yaw) - forward * Math.sin(yaw),
		z: -forward * Math.cos(yaw) - right * Math.sin(yaw),
		yaw,
	});
	if (
		firing &&
		state.phase === 'combat' &&
		state.tick % (localPlayer(state).weapon === 'sidearm' ? 15 : 8) === 0
	)
		dispatch({ type: 'fire' });
}
doc.on('keydown', (event: TKeyEvent) => {
	qml.release();
	if (event.code) keys.add(event.code);
	if (event.code === 'Enter' && ['menu', 'won', 'lost'].includes(viewState().phase) && !isGuest) {
		dispatch({ type: 'start' });
		doc.setPointerCapture();
	}
	if (viewState().phase === 'upgrade' && !isGuest) {
		if (event.code === 'Digit1') dispatch({ type: 'choose-upgrade', choice: 'health' });
		if (event.code === 'Digit2') dispatch({ type: 'choose-upgrade', choice: 'damage' });
		if (event.code === 'Digit3') dispatch({ type: 'choose-upgrade', choice: 'speed' });
	} else {
		if (event.code === 'Digit1') dispatch({ type: 'select-weapon', weapon: 'sidearm' });
		if (event.code === 'Digit2') dispatch({ type: 'select-weapon', weapon: 'carbine' });
	}
	if (event.code === 'KeyE' && viewState().phase === 'exit' && !isGuest)
		dispatch({ type: 'enter-exit' });
});
doc.on('keyup', (event: TKeyEvent) => {
	qml.release();
	if (event.code) keys.delete(event.code);
});
doc.on('mousedown', () => {
	qml.release();
	firing = true;
});
doc.on('mouseup', () => {
	qml.release();
	firing = false;
});
doc.on('mousemove', (event: TMouseMoveEvent) => {
	qml.release();
	if (capturePath || viewState().phase !== 'combat') return;
	yaw -= event.movementX * 0.002;
	pitch = Math.max(-1.2, Math.min(1.2, pitch - event.movementY * 0.002));
});
doc.on('resize', () => {
	qml.release();
	renderer.setSize(doc.w, doc.h);
	camera.aspect = doc.w / doc.h;
	camera.updateProjectionMatrix();
});
if (capturePath && !network) presentation.skipEvents(capture.prepareSolo(game, keys));

let previous = performance.now();
let accumulator = 0;
qml.loop(() => {
	const now = performance.now();
	network?.poll(isGuest ? undefined : game);
	capture.startHost(game, network);
	accumulator = Math.min(accumulator + (now - previous) / 1000, 0.1);
	previous = now;
	while (accumulator >= STEP) {
		capture.guestStep(
			network,
			keys,
			(targetYaw) => {
				yaw = targetYaw;
			},
			dispatch,
		);
		input();
		if (!isGuest) capture.stepHost(game, network);
		accumulator -= STEP;
	}
	if (!isGuest) network?.publish(game, now);
	capture.beforeRender(game);
	const state = viewState();
	const local = localPlayer(state);
	if (state.phase === 'upgrade' || state.phase === 'won' || state.phase === 'lost')
		doc.releasePointerCapture();
	camera.position.set(local.position.x, 1.65, local.position.z);
	camera.rotation.set(pitch, local.yaw, 0);
	presentation.update(
		state,
		local,
		isGuest ? state.player : state.partner,
		isGuest ? (network?.events ?? []) : game.journal,
		!network
			? 'SOLO'
			: `${network.role.toUpperCase()} / ${network.metrics.connected ? 'CONNECTED' : 'WAITING'}`,
	);
	renderer.render(scene, camera);
	if (
		capture.afterRender({
			game,
			network,
			isGuest,
			state,
			width: doc.w,
			height: doc.h,
			readySounds: presentation.readySounds,
			loadedModels: world.loadedModels,
		})
	) {
		network?.close();
		process.exit(0);
	}
});
