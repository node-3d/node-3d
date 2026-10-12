import assert from 'node:assert/strict';
import * as THREE from 'three';
import { Screen, init } from '@node-3d/core';
import { Controller, GUI } from '../gui.ts';
import type { TMouseEvent } from '@node-3d/glfw';

const { doc, loop } = init({ major: 3, minor: 3, isVisible: false, vsync: false });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, doc.width / doc.height, 0.1, 10);
camera.position.z = 3;
const screen = new Screen({ doc, scene, camera });

let clicks = 0;
let changes = 0;
const params = {
	increment: () => {
		clicks++;
	},
	enabled: false,
	count: 0,
	text: '',
};
const gui = new GUI(doc);
let openCloseEvents = 0;
gui.onOpenClose(() => openCloseEvents++);
const globalChanges: string[] = [];
const globalFinishes: string[] = [];
gui.onChange((event) => globalChanges.push(event.property));
gui.onFinishChange((event) => globalFinishes.push(event.property));
let buttonChanges = 0;
const button = gui.add(params, 'increment').name('Increment');
button.onChange(function (this: Controller) {
	assert.strictEqual(this, button);
	assert.equal(clicks, 1);
	buttonChanges++;
});
gui.add(params, 'enabled').onChange(() => {
	changes++;
});
let sliderChanges = 0;
let sliderFinishes = 0;
gui.add(params, 'count', 0, 10, 2)
	.onChange(() => sliderChanges++)
	.onFinishChange(() => sliderFinishes++);
let textChanges = 0;
let textFinishes = 0;
gui.add(params, 'text')
	.onChange(() => textChanges++)
	.onFinishChange(() => textFinishes++);

let frame = 0;
let capturedMouse = false;
let capturedKeyboard = false;
function emitMouse(
	type: 'mousemove' | 'mousedown' | 'mouseup',
	x: number,
	y: number,
	down: boolean,
): void {
	const event: TMouseEvent & {
		button?: number;
		which?: number;
		movementX?: number;
		movementY?: number;
	} = {
		type,
		x,
		y,
		clientX: x,
		clientY: y,
		pageX: x,
		pageY: y,
		buttons: down ? 1 : 0,
		shiftKey: false,
		ctrlKey: false,
		altKey: false,
		metaKey: false,
		button: 0,
		which: 1,
		movementX: 0,
		movementY: 0,
	};
	doc.emit(type, event);
}
const stop = loop(() => {
	screen.draw();
	const mouse =
		frame === 2
			? { x: 50, y: 50, down: true }
			: frame === 3
				? { x: 50, y: 50, down: false }
				: frame === 5
					? { x: 32, y: 74, down: true }
					: frame === 6
						? { x: 32, y: 74, down: false }
						: frame === 8
							? { x: 130, y: 100, down: true }
							: frame === 9
								? { x: 130, y: 100, down: false }
								: frame === 11
									? { x: 50, y: 126, down: true }
									: frame === 12
										? { x: 50, y: 126, down: false }
										: frame === 13
											? { x: 50, y: 126, down: false }
											: frame === 15
												? { x: 390, y: 190, down: true }
												: frame === 16
													? { x: 390, y: 190, down: false }
													: frame === 18
														? { x: 25, y: 25, down: true }
														: frame === 19
															? { x: 25, y: 25, down: false }
															: { x: -100, y: -100, down: false };
	emitMouse('mousemove', mouse.x, mouse.y, mouse.down);
	if ([2, 5, 8, 11, 15, 18].includes(frame)) emitMouse('mousedown', mouse.x, mouse.y, true);
	if ([3, 6, 9, 12, 16, 19].includes(frame)) emitMouse('mouseup', mouse.x, mouse.y, false);
	if (frame === 13) {
		for (const char of 'abc') {
			doc.emit('keydown', {
				type: 'keydown',
				which: char.toUpperCase().charCodeAt(0),
				charCode: char.charCodeAt(0),
				repeat: false,
				altKey: false,
				ctrlKey: false,
				metaKey: false,
				shiftKey: false,
				code: `Key${char.toUpperCase()}`,
				key: char,
				keyCode: char.toUpperCase().charCodeAt(0),
			});
		}
	}
	gui.draw();
	capturedMouse ||= gui.wantsCaptureMouse;
	capturedKeyboard ||= gui.wantsCaptureKeyboard;
	screen.renderer.resetState();
	frame++;
	if (frame === 23) {
		stop();
		gui.destroy();
		doc.destroy();
		assert.equal(clicks, 1);
		assert.equal(buttonChanges, 1);
		assert.equal(params.enabled, true);
		assert.equal(changes, 1);
		assert.ok(params.count > 0 && params.count % 2 === 0);
		assert.ok(sliderChanges >= 1);
		assert.equal(sliderFinishes, 1);
		assert.equal(params.text, 'abc');
		assert.ok(textChanges >= 1);
		assert.equal(textFinishes, 1);
		assert.ok(
			globalChanges.includes('enabled') &&
				globalChanges.includes('count') &&
				globalChanges.includes('text'),
		);
		assert.ok(globalFinishes.includes('count') && globalFinishes.includes('text'));
		assert.ok(capturedMouse && capturedKeyboard);
		assert.equal(openCloseEvents, 1);
		console.log(
			'Bridge probe: button, checkbox, snapped slider, text, and finish events reached JavaScript',
		);
	}
});
