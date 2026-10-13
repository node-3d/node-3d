import * as THREE from 'three';
import type { TGlfw } from '@node-3d/glfw';

const renderCheck = process.argv.includes('--render-check');
const macHeadless = renderCheck && process.platform === 'darwin';
const glesHeadless = renderCheck && (process.platform === 'darwin' || process.platform === 'linux');

if (macHeadless) {
	// GLFW normally initializes while importing Core. Select its Null platform first.
	const nodeGlobal = globalThis as typeof globalThis & { __isGlfwInited?: boolean };
	nodeGlobal.__isGlfwInited = true;
	const { glfw } = await import('@node-3d/glfw');
	glfw.initHint(glfw.PLATFORM, glfw.PLATFORM_NULL);
	if (!glfw.init()) {
		throw new Error('Failed to initialize headless GLFW');
	}
	glfw.defaultWindowHints();
	nodeGlobal.__isGlfwInited = true;
}

const { Screen, addThreeHelpers, init } = await import('@node-3d/core');

if (process.argv.includes('--smoke')) {
	console.log(`SEA loaded Node3D with Node.js ${process.versions.node}`);
} else {
	const { doc, loop } = init({
		width: renderCheck ? 256 : 800,
		height: renderCheck ? 256 : 600,
		isGles3: glesHeadless || !renderCheck,
		isWebGL2: glesHeadless,
		...(renderCheck && process.platform === 'win32' ? { major: 2, minor: 1 } : {}),
		vsync: !renderCheck,
		autoEsc: true,
		title: 'Node3D SEA research',
		mode: 'windowed',
		isVisible: !renderCheck,
		onBeforeWindow(_window, currentGlfw) {
			if (!glesHeadless) {
				return;
			}
			const glfw = currentGlfw as TGlfw;
			if (macHeadless) {
				glfw.windowHint(glfw.CONTEXT_CREATION_API, glfw.EGL_CONTEXT_API);
			}
			glfw.windowHint(glfw.VISIBLE, glfw.FALSE);
			glfw.windowHint(glfw.OPENGL_PROFILE, glfw.OPENGL_ANY_PROFILE);
			glfw.windowHint(glfw.CONTEXT_VERSION_MAJOR, 3);
			glfw.windowHint(glfw.CONTEXT_VERSION_MINOR, 2);
			glfw.windowHint(glfw.CLIENT_API, glfw.OPENGL_ES_API);
			glfw.windowHint(glfw.STENCIL_BITS, 0);
			glfw.windowHint(glfw.DEPTH_BITS, 0);
			glfw.windowHint(glfw.SAMPLES, 0);
		},
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

	if (renderCheck) {
		cube.rotation.x = 0.3;
		cube.rotation.y = 0.4;
		screen.draw();

		const pixel = (x: number, y: number): Buffer => {
			const storage = { data: Buffer.alloc(4) };
			doc.context.readPixels(x, y, 1, 1, doc.context.RGBA, doc.context.UNSIGNED_BYTE, storage);
			return storage.data;
		};
		const background = pixel(4, 4);
		const center = pixel(Math.floor(doc.w / 2), Math.floor(doc.h / 2));
		const difference = Math.abs(center[0]! - background[0]!)
			+ Math.abs(center[1]! - background[1]!)
			+ Math.abs(center[2]! - background[2]!);
		if (background[3] !== 255 || center[3] !== 255 || difference < 60) {
			throw new Error(`Rendered frame did not contain the cube: background=${background.toString('hex')} center=${center.toString('hex')}`);
		}
		console.log(`SEA rendered cube: background=${background.toString('hex')} center=${center.toString('hex')}`);
		doc.destroy();
	} else {
		loop((now) => {
			cube.rotation.x = now * 0.0005;
			cube.rotation.y = now * 0.001;
			screen.draw();
		});
	}
}
