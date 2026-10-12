import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Screen, init } from '@node-3d/core';
import { GUI } from '../gui.ts';

const { doc, loop } = init({ major: 3, minor: 3, isVisible: false, vsync: false });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, doc.width / doc.height, 0.1, 10);
camera.position.z = 3;
const screen = new Screen({ doc, scene, camera });

const color = new THREE.Color('#224466');
const params = {
	label: 'initial',
	count: 3,
	mode: 'one',
	active: true,
	color,
	shortColor: '#abc',
	rgbColor: 'rgb(10, 20, 30)',
	byteColor: { r: 128, g: 64, b: 32 },
};
const gui = new GUI(doc, { title: 'Parity probe', width: 420 });
const secondGui = new GUI({ title: 'Second panel' });
assert.equal(secondGui.panel.title, 'Second panel');
secondGui.add({ secondary: true }, 'secondary');
const events: string[] = [];
gui.onChange((event) => events.push(`${event.property}:${String(event.value)}`));
const folder = gui.addFolder('Settings');
let openCloseEvents = 0;
let bubbledOpenClose = 0;
gui.onOpenClose((changed) => {
	assert.strictEqual(changed, folder);
	bubbledOpenClose++;
});
folder
	.onOpenClose(() => openCloseEvents++)
	.close()
	.open();
assert.equal(openCloseEvents, 2);
assert.equal(bubbledOpenClose, 2);
folder.onChange((event) => events.push(`folder:${event.property}`));
const label = folder.add(params, 'label').name('Label');
const count = folder.add(params, 'count', 0, 10, 1).decimals(0).listen();
const mode = folder.add(params, 'mode').options(['one', 'two']);
const replaced = folder.add({ choice: 'a' }, 'choice');
const newChoice = replaced.options(['a', 'b']);
assert.notStrictEqual(replaced, newChoice);
assert.throws(() => replaced.getValue(), /destroyed/);
newChoice.destroy();
const active = folder.add(params, 'active').disable().enable().hide().show();
const selectedColor = folder.addColor(params, 'color');
const shortColor = folder.addColor(params, 'shortColor');
const rgbColor = folder.addColor(params, 'rgbColor');
const byteColor = folder.addColor(params, 'byteColor', 255);

assert.equal(folder.children.length, 8);
assert.equal(gui.controllersRecursive().length, 8);
assert.equal(gui.foldersRecursive().length, 1);
assert.equal(count.initialValue, 3);
label.setValue('edited');
count.setValue(7);
mode.setValue('two');
selectedColor.setValue('#abcdef');
shortColor.setValue('#123');
rgbColor.setValue('rgb(50, 60, 70)');
byteColor.setValue('#804020');
assert.strictEqual(params.color, color);
assert.ok(Math.abs(color.r - 171 / 255) < 1e-6);
assert.equal(params.shortColor, '#112233');
assert.equal(params.rgbColor, '#323c46');
assert.deepEqual(params.byteColor, { r: 128, g: 64, b: 32 });
count.setValue(8.7);
assert.equal(params.count, 9);
assert.deepEqual(events.slice(0, 4), ['folder:label', 'label:edited', 'folder:count', 'count:7']);

const saved = gui.save();
assert.equal(
	(saved.folders.Settings as { controllers: Record<string, unknown> }).controllers.Label,
	'edited',
);
label.setValue('again');
gui.load(saved);
assert.equal(params.label, 'edited');
gui.reset();
assert.equal(params.label, 'initial');
assert.equal(params.count, 3);
assert.equal(params.mode, 'one');
assert.strictEqual(params.color, color);
assert.equal(color.getHexString(), '224466');

const temporary = gui.add({ temp: 1 }, 'temp');
temporary.destroy();
assert.equal(gui.children.length, 1);
assert.throws(() => temporary.getValue(), /destroyed/);

let frames = 0;
const capture = process.argv
	.find((arg) => arg.startsWith('--capture='))
	?.slice('--capture='.length);
const stop = loop(() => {
	screen.draw();
	gui.draw();
	secondGui.draw();
	screen.renderer.resetState();
	if (++frames === 5) {
		if (capture) screen.snapshot(capture);
		stop();
		gui.destroy();
		secondGui.destroy();
		doc.destroy();
		assert.equal(params.shortColor, '#aabbcc');
		console.log(
			'Parity probe: state, events, save/load, colors, lifecycle, and native draw passed',
		);
	}
});
