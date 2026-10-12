// Research preload for browser-script-style Three.js examples.
// Run with: node --import ./runtime-loader.ts examples/three-indexed-auto.ts --capture=...
import { registerHooks } from 'node:module';
import { init } from '@node-3d/core';
import { DefaultLoadingManager } from 'three';
import { DOMParser } from 'linkedom';
import { Controller, Folder, GUI } from './gui.ts';
import { renderers, renderState } from './runtime-state.ts';
import { saveSceneCapture, saveVerifiedCapture, scenePixelVariation } from './capture.ts';
import { DecoderWorker } from './decoder-worker-host.ts';
import { adaptLoadingManager, assets, resolveExampleUrl } from './asset-host.ts';

const { doc } = init({
	major: 3,
	minor: 3,
	vsync: true,
	autoEsc: true,
	isVisible: !process.argv.includes('--probe'),
	title: 'Node3D: automatic Three.js example bootstrap',
});
for (const dimension of ['innerWidth', 'innerHeight'] as const) {
	if (!(dimension in globalThis)) {
		Object.defineProperty(globalThis, dimension, {
			configurable: true,
			get: () => globalThis.window[dimension],
		});
	}
}
Object.assign(doc, {
	ownerDocument: doc,
	documentElement: { clientLeft: 0, clientTop: 0 },
	pageXOffset: 0,
	pageYOffset: 0,
});
// Page mounts, statistics rows, and download links do not supply scene pixels.
// Keep that page chrome inert while retaining the renderer's real Node3D canvas.
const createElement = doc.createElement.bind(doc);
const inertClassList = { add() {}, remove() {}, toggle() {} };
const inertGuiElement = { style: {}, classList: inertClassList, appendChild() {} };
Object.defineProperty(Folder.prototype, 'domElement', {
	configurable: true,
	get: () => inertGuiElement,
});
Object.defineProperty(Folder.prototype, '$children', {
	configurable: true,
	get: () => inertGuiElement,
});
Object.defineProperty(Controller.prototype, 'domElement', {
	configurable: true,
	get: () => inertGuiElement,
});
Object.assign(doc, {
	createElement(name: string) {
		if (!['div', 'li', 'a'].includes(name.toLowerCase())) return createElement(name);
		return {
			ownerDocument: doc,
			style: {},
			classList: inertClassList,
			appendChild() {},
			removeChild() {},
			click() {},
			addEventListener: doc.addEventListener.bind(doc),
			removeEventListener: doc.removeEventListener.bind(doc),
			getBoundingClientRect: doc.getBoundingClientRect.bind(doc),
			getRootNode: () => doc,
		};
	},
});
type ClearBufferMethod = (buffer: number, drawBuffer: number, values: readonly number[]) => void;
type ResearchGl = {
	getExtension: (name: string) => unknown;
	uniform1f: (location: unknown, value: number | boolean) => void;
	clearBufferfv: ClearBufferMethod;
	clearBufferiv: ClearBufferMethod;
	clearBufferuiv: ClearBufferMethod;
};
const webgl = doc.getContext('webgl') as unknown as ResearchGl;
const getExtension = webgl.getExtension.bind(webgl);
const uniform1f = webgl.uniform1f.bind(webgl);
webgl.uniform1f = (location, value) =>
	uniform1f(location, typeof value === 'boolean' ? Number(value) : value);
webgl.getExtension = (name) => {
	const extension = getExtension(name);
	if (name === 'WEBGL_compressed_texture_astc' && extension && typeof extension === 'object') {
		const astc = extension as { getSupportedProfiles?: () => string[] | undefined };
		return new Proxy(astc, {
			get(target, property) {
				if (property === 'getSupportedProfiles')
					return () => target.getSupportedProfiles?.() ?? [];
				return Reflect.get(target, property);
			},
		});
	}
	return extension ?? null;
};
for (const name of ['clearBufferfv', 'clearBufferiv', 'clearBufferuiv'] as const) {
	const clear = webgl[name].bind(webgl);
	webgl[name] = (buffer, drawBuffer, values) =>
		clear(buffer, drawBuffer, Array.isArray(values) ? values : Array.from(values));
}
if (!('ProgressEvent' in globalThis)) {
	class NodeProgressEvent extends Event {
		public readonly lengthComputable: boolean;
		public readonly loaded: number;
		public readonly total: number;

		public constructor(type: string, init: ProgressEventInit = {}) {
			super(type);
			this.lengthComputable = init.lengthComputable ?? false;
			this.loaded = init.loaded ?? 0;
			this.total = init.total ?? 0;
		}
	}
	Object.assign(globalThis, { ProgressEvent: NodeProgressEvent });
}
// Browser Image.onload is asynchronous even for data URIs. The Node3D image
// calls a late handler immediately; SMAAPass registers it before constructor
// fields exist. Keep the callback in the next microtask in this research host.
const imageOnload = Object.getOwnPropertyDescriptor(globalThis.Image.prototype, 'onload');
if (imageOnload?.set) {
	Object.defineProperty(globalThis.Image.prototype, 'onload', {
		configurable: true,
		get: imageOnload.get,
		set(this: { complete: boolean }, value: unknown) {
			if (this.complete && typeof value === 'function') {
				queueMicrotask(() => value.call(this));
			} else {
				imageOnload.set!.call(this, value);
			}
		},
	});
}

Object.assign(globalThis, { Worker: DecoderWorker });
Object.assign(globalThis, { DOMParser });
adaptLoadingManager(DefaultLoadingManager);
const hostFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
	hostFetch(typeof input === 'string' ? resolveExampleUrl(input) : input, init)) as typeof fetch;

registerHooks({
	resolve(specifier, context, nextResolve) {
		if (specifier === 'three' && !context.parentURL?.endsWith('/three-shim.ts')) {
			return { url: new URL('./three-shim.ts', import.meta.url).href, shortCircuit: true };
		}
		if (specifier === 'three/addons/libs/lil-gui.module.min.js') {
			return { url: new URL('./gui.ts', import.meta.url).href, shortCircuit: true };
		}
		if (specifier === 'three/addons/libs/stats.module.js') {
			return { url: new URL('./stats-shim.ts', import.meta.url).href, shortCircuit: true };
		}
		return nextResolve(specifier, context);
	},
});

const requestFrame = doc.requestAnimationFrame;
const capture = process.argv
	.find((arg) => arg.startsWith('--capture='))
	?.slice('--capture='.length);
const captureFrames = Number(
	process.argv.find((arg) => arg.startsWith('--frames='))?.slice(9) ?? '90',
);
if (!Number.isSafeInteger(captureFrames) || captureFrames < 1) {
	throw new Error('--frames must be a positive integer');
}
const trace = process.argv.includes('--trace');
let frames = 0;
let inAnimationFrame = false;
let oneShotPixels: Buffer | undefined;
renderState.afterRender = () => {
	if (!capture || inAnimationFrame || frames > 0) return;
	const gl = doc.getContext('webgl');
	if (!gl || !('readPixels' in gl)) return;
	const framebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING) as { _: number };
	if (framebuffer._ !== 0) return;
	GUI.drawAll();
	for (const renderer of renderers) renderer.resetState();
	const pixels = Buffer.allocUnsafeSlow(doc.width * doc.height * 4);
	gl.readPixels(0, 0, doc.width, doc.height, gl.RGBA, gl.UNSIGNED_BYTE, { data: pixels });
	if (scenePixelVariation(doc.width, doc.height, pixels) >= 8) oneShotPixels = pixels;
};
function writeCapture(frameCount: number, preservedPixels?: Buffer): void {
	if (!capture) return;
	if (assets.errors) throw new Error(`${assets.errors} example assets failed to load`);
	const pixels = { data: preservedPixels ?? Buffer.allocUnsafeSlow(doc.width * doc.height * 4) };
	const gl = doc.getContext('webgl');
	if (!gl || !('readPixels' in gl)) throw new Error('WebGL context missing');
	if (!preservedPixels)
		gl.readPixels(0, 0, doc.width, doc.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
	if (trace) console.log(`Frame ${frameCount} readPixels completed`);
	if (GUI.panelCount > 0 && process.argv.includes('--verify-panel'))
		saveVerifiedCapture(capture, doc.width, doc.height, pixels.data);
	else saveSceneCapture(capture, doc.width, doc.height, pixels.data);
	console.log(
		`Automatic runtime captured ${capture} after ${frameCount} frames; framebuffer verified; assets ${assets.finished}/${assets.started}`,
	);
	process.exit(0);
}
doc.requestAnimationFrame = (callback) =>
	requestFrame((time) => {
		try {
			inAnimationFrame = true;
			if (trace) console.log(`Frame ${frames + 1} begins; assets pending ${assets.pending}`);
			callback(time);
			if (trace) console.log(`Frame ${frames + 1} scene callback completed`);
			if (capture && !process.argv.includes('--no-click') && (frames === 5 || frames === 6)) {
				const down = frames === 5;
				for (const type of ['mousemove', down ? 'mousedown' : 'mouseup']) {
					doc.emit(type, {
						type,
						x: 32,
						y: 50,
						clientX: 32,
						clientY: 50,
						pageX: 32,
						pageY: 50,
						buttons: down ? 1 : 0,
						button: 0,
						which: 1,
						movementX: 0,
						movementY: 0,
						ctrlKey: false,
						shiftKey: false,
						altKey: false,
						metaKey: false,
					});
				}
			}
			GUI.drawAll();
			if (trace) console.log(`Frame ${frames + 1} GUI completed`);
			for (const renderer of renderers) renderer.resetState();
			if (trace) console.log(`Frame ${frames + 1} renderer state reset`);
			if (capture && ++frames >= captureFrames && assets.pending === 0) writeCapture(frames);
			inAnimationFrame = false;
		} catch (error) {
			console.error('Example frame failed:', error);
			process.exit(1);
		}
	});
globalThis.requestAnimationFrame = doc.requestAnimationFrame;

// One-shot and render-on-demand examples never request animation frames.
// Give them a host tick for GUI drawing and a bounded framebuffer probe.
let hostFrames = 0;
let readyFrames = 0;
const monitorOneShot = (): void => {
	if (frames > 0) return;
	try {
		hostFrames++;
		if (trace && (hostFrames <= captureFrames || hostFrames % 60 === 0))
			console.log(
				`Host frame ${hostFrames}; renders ${renderState.calls}; assets pending ${assets.pending}`,
			);
		if (renderState.calls > 0) {
			GUI.drawAll();
			for (const renderer of renderers) renderer.resetState();
			readyFrames = assets.pending === 0 ? readyFrames + 1 : 0;
			if (capture && readyFrames >= Math.max(captureFrames, 90) && oneShotPixels)
				writeCapture(hostFrames, oneShotPixels);
		}
		setTimeout(() => requestFrame(monitorOneShot), 16);
	} catch (error) {
		console.error('Example one-shot frame failed:', error);
		process.exit(1);
	}
};
requestFrame(monitorOneShot);
