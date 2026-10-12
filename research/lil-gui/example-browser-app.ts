/** Clickable Node3D window for the pinned Three.js WebGL catalog. */
import { spawn, type ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Image, init, type TWebgl } from '@node-3d/core';
import { GUI, type Controller, type Folder } from './gui.ts';
import { explainProbeOutput, explainScreen, scan } from './example-browser.ts';

type Entry = { name: string; reason?: string };
type Item = { entry: Entry; controller: Controller; folder: Folder };

const { doc, loop } = init({
	major: 3,
	minor: 3,
	width: 1050,
	height: 760,
	vsync: true,
	autoEsc: true,
	title: 'Node3D · Three.js example browser',
});
const gl = doc.getContext('webgl') as TWebgl | null;
if (!gl) throw new Error('The example browser needs a WebGL context');

const gui = new GUI(doc, { title: 'Three.js examples · r186', width: 1010, height: 700 });
const view = {
	notice: 'HTML/CSS presentation and DOM widgets are omitted. Scenes open in a separate window.',
	status: 'Loading the official Three.js catalog…',
	search: '',
};
gui.addLabel(view, 'notice');
gui.addLabel(view, 'status');
const items: Item[] = [];
const folders = new Map<string, Folder>();
let checking = false;
let catalogReady = false;
const running = new Set<ChildProcess>();

function readProcess(
	child: ChildProcess,
	timeoutMs: number,
): Promise<{
	code: number | null;
	output: string;
	timedOut: boolean;
}> {
	return new Promise((resolve) => {
		let output = '';
		let timedOut = false;
		let settled = false;
		const append = (chunk: Buffer | string) => {
			output = (output + String(chunk)).slice(-24_000);
		};
		child.stdout?.on('data', append);
		child.stderr?.on('data', append);
		const timer = setTimeout(() => {
			timedOut = true;
			child.kill();
		}, timeoutMs);
		const finish = (code: number | null) => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve({ code, output, timedOut });
		};
		child.on('error', (error) => {
			append(error.message);
			finish(null);
		});
		child.on('close', finish);
	});
}

function childArgs(name: string, probe: boolean): string[] {
	const args = [
		'--import',
		new URL('./runtime-loader.ts', import.meta.url).href,
		fileURLToPath(new URL('./example-browser.ts', import.meta.url)),
		'run',
		name,
	];
	if (probe) {
		args.push(
			`--capture=${fileURLToPath(new URL(`./captures/probe-${name}.png`, import.meta.url))}`,
			'--frames=12',
			'--no-click',
			'--probe',
		);
	}
	return args;
}

async function openExample(entry: Entry): Promise<void> {
	if (checking) {
		view.status = 'Please wait while the current example opens.';
		return;
	}
	if (entry.reason) {
		view.status = `Sorry, I can't open ${entry.name} here. ${explainScreen(entry.reason)}`;
		return;
	}
	checking = true;
	view.status = `Opening ${entry.name}…`;
	try {
		const probe = spawn(process.execPath, childArgs(entry.name, true), {
			cwd: fileURLToPath(new URL('./', import.meta.url)),
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		const result = await readProcess(probe, 15_000);
		if (result.code !== 0 || !/framebuffer verified/u.test(result.output)) {
			const failure = explainProbeOutput(result.output, result.timedOut);
			view.status = `Sorry, I can't open ${entry.name} here. ${failure.reason}`;
			return;
		}
		const scene = spawn(process.execPath, childArgs(entry.name, false), {
			cwd: fileURLToPath(new URL('./', import.meta.url)),
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		running.add(scene);
		view.status = `Opening ${entry.name} in a separate window. HTML page content is omitted.`;
		void readProcess(scene, 0x7fffffff).then((result) => {
			running.delete(scene);
			if (result.code && result.code !== 0) {
				view.status = `${entry.name} stopped: ${explainProbeOutput(result.output, false).reason}`;
			} else if (view.status.startsWith(`Opening ${entry.name}`)) {
				view.status = `${entry.name} closed. Choose another example.`;
			}
		});
	} catch (error) {
		view.status = `Sorry, I can't open ${entry.name} here. ${String(error)}`;
	} finally {
		checking = false;
	}
}

function updateSearch(): void {
	const query = view.search.trim().toLowerCase();
	const counts = new Map<Folder, number>();
	for (const item of items) {
		const visible = item.entry.name.toLowerCase().includes(query);
		item.controller.show(visible);
		if (visible) counts.set(item.folder, (counts.get(item.folder) ?? 0) + 1);
	}
	for (const folder of folders.values()) {
		const count = counts.get(folder) ?? 0;
		folder.show(count > 0);
		if (query && count > 0) folder.open();
	}
	const count = [...counts.values()].reduce((sum, value) => sum + value, 0);
	view.status = `${count} matching examples. Click one to open it.`;
}

gui.add(view, 'search').name('Search examples').onChange(updateSearch);

void scan(1000)
	.then(({ found, rejected, scanned }) => {
		const entries: Entry[] = [...found.map(({ name }) => ({ name })), ...rejected].sort(
			(a, b) => a.name.localeCompare(b.name),
		);
		for (const entry of entries) {
			const group = entry.name.split('_')[1] ?? 'other';
			let folder = folders.get(group);
			if (!folder) {
				folder = gui.addFolder(group);
				folders.set(group, folder);
			}
			const action = { open: () => void openExample(entry) };
			const controller = folder.add(action, 'open').name(entry.name);
			items.push({ entry, controller, folder });
		}
		catalogReady = true;
		view.status = `${entries.length}/${scanned} examples. Click one to open it.`;
	})
	.catch((error) => {
		view.status = `Could not load the catalog: ${String(error)}. Check the network and restart.`;
	});

let captured = false;
const capturePath = process.argv.find((arg) => arg.startsWith('--capture='))?.slice(10);
const smokeSelection = process.argv.find((arg) => arg.startsWith('--smoke-selection='))?.slice(18);
let smokeFrame = 0;
function emitSmokeMouse(type: 'mousemove' | 'mousedown' | 'mouseup', down: boolean): void {
	doc.emit(type, {
		type,
		x: 130,
		y: 130,
		clientX: 130,
		clientY: 130,
		pageX: 130,
		pageY: 130,
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
const stop = loop(() => {
	gl.viewport(0, 0, doc.width, doc.height);
	gl.clearColor(0.08, 0.09, 0.12, 1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	if (catalogReady && smokeSelection) {
		if (smokeFrame === 0) {
			view.search = smokeSelection;
			updateSearch();
		}
		if (smokeFrame === 2) {
			emitSmokeMouse('mousemove', false);
			emitSmokeMouse('mousedown', true);
		}
		if (smokeFrame === 3) emitSmokeMouse('mouseup', false);
		smokeFrame++;
	}
	gui.draw();
	const selectionDone =
		!smokeSelection ||
		(smokeFrame > 5 &&
			(view.status.startsWith('Sorry,') ||
				(view.status.startsWith('Opening ') && view.status.includes('separate window'))));
	if (capturePath && catalogReady && selectionDone && !captured) {
		captured = true;
		const pixels = Buffer.allocUnsafeSlow(doc.width * doc.height * 4);
		gl.readPixels(0, 0, doc.width, doc.height, gl.RGBA, gl.UNSIGNED_BYTE, { data: pixels });
		Image.fromPixels(doc.width, doc.height, 32, pixels).save(capturePath);
		console.log(`Browser UI captured ${capturePath}`);
		if (smokeSelection) console.log(`Browser selection: ${view.status}`);
		stop();
		gui.destroy();
		for (const child of running) child.kill();
	}
});

process.on('exit', () => {
	for (const child of running) child.kill();
});
