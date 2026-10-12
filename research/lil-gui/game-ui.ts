/** Research game UI layer over the same batched ImGui bridge as GUI. */
import { Image } from '@node-3d/core';
import * as THREE from 'three';
import { readFile } from 'node:fs/promises';
import type { TEvent, TKeyEvent } from '@node-3d/glfw';
import { GUI, type GameCommand } from './gui.ts';

export function rgba(red: number, green: number, blue: number, alpha = 255): number {
	for (const channel of [red, green, blue, alpha]) {
		if (!Number.isInteger(channel) || channel < 0 || channel > 255)
			throw new RangeError('Color channels must be integers from 0 to 255');
	}
	return ((alpha << 24) | (blue << 16) | (green << 8) | red) >>> 0;
}

type Window = ConstructorParameters<typeof GUI>[0];

export class GameUI {
	private readonly gui: GUI;
	private readonly images = new Set<number>();
	private readonly fonts = new Set<number>();
	private readonly commands: GameCommand[] = [];
	private readonly actions = new Map<string, () => void>();
	private destroyed = false;
	private inputMode: 'passthrough' | 'modal' = 'passthrough';
	private passthroughKeys = new Set<string>();

	public constructor(window: Window) {
		this.gui = new GUI(window);
		this.gui.hide();
		this.gui.onOverlayAction = (id) => this.actions.get(id)?.();
		this.gui.inputFilter = (event) => this.routeEvent(event);
	}

	/** Select which window events the UI receives and which the game should skip. */
	public setInputMode(
		mode: 'passthrough' | 'modal',
		options: { passthroughKeys?: readonly string[] } = {},
	): void {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		if (this.inputMode !== mode) this.gui.resetInput();
		this.inputMode = mode;
		this.passthroughKeys = new Set(options.passthroughKeys ?? []);
	}

	/** Call in application input handlers before acting on an event. */
	public routeEvent(event: TEvent): boolean {
		if (this.inputMode !== 'modal') return false;
		if (event.type === 'keydown' || event.type === 'keyup') {
			const key = event as TKeyEvent;
			return !this.passthroughKeys.has(key.code ?? '');
		}
		return [
			'mousemove',
			'mousedown',
			'mouseup',
			'pointermove',
			'pointerdown',
			'pointerup',
			'wheel',
		].includes(event.type);
	}

	/** Start a new frame; positions are logical window pixels from the top left. */
	public begin(): void {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		this.commands.length = 0;
		this.actions.clear();
	}

	public rect(x: number, y: number, w: number, h: number, color: number): void {
		this.commands.push({ kind: 'rect', x, y, w, h, color });
	}

	public text(
		x: number,
		y: number,
		value: string,
		size: number,
		color: number,
		font?: number,
	): void {
		if (font !== undefined && !this.fonts.has(font))
			throw new Error(`Unknown game UI font ${font}`);
		this.commands.push({ kind: 'text', x, y, text: value, size, color, font });
	}

	public image(image: number, x: number, y: number, w: number, h: number): void {
		if (!this.images.has(image)) throw new Error(`Unknown game UI image ${image}`);
		this.commands.push({ kind: 'image', image, x, y, w, h });
	}

	public bar(x: number, y: number, w: number, h: number, fraction: number, color: number): void {
		this.rect(x, y, w, h, rgba(14, 19, 26, 220));
		this.rect(
			x + 3,
			y + 3,
			Math.max(0, w - 6) * Math.max(0, Math.min(1, fraction)),
			h - 6,
			color,
		);
	}

	public button(
		id: string,
		label: string,
		x: number,
		y: number,
		w: number,
		h: number,
		onClick: () => void,
	): void {
		if (this.actions.has(id)) throw new Error(`Duplicate game UI button ID: ${id}`);
		this.actions.set(id, onClick);
		this.commands.push({
			kind: 'button',
			id,
			text: label,
			x,
			y,
			w,
			h,
			size: 32,
			color: rgba(18, 32, 43, 210),
			hoverColor: rgba(45, 93, 110, 230),
			textColor: rgba(235, 246, 246),
		});
	}

	public async loadImage(path: string): Promise<number> {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		const image = await Image.loadAsync(path);
		if (!image.data) throw new Error(`Image has no pixels: ${path}`);
		const id = this.gui.createGameImage(image.width, image.height, image.data);
		this.images.add(id);
		return id;
	}

	public releaseImage(id: number): void {
		if (!this.images.delete(id)) return;
		this.gui.releaseGameImage(id);
	}

	/** Load a TTF/OTF face into the ImGui atlas. Its lifetime is the GUI context. */
	public async loadFont(path: string, size: number): Promise<number> {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		const id = this.gui.createGameFont(await readFile(path), size);
		this.fonts.add(id);
		return id;
	}

	/** Rebind the GLFW backend during a mode switch; shared GL resources stay alive. */
	public rebindWindow(changeWindow: () => void): void {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		this.gui.transitionWindow(changeWindow);
		this.commands.length = 0;
		this.actions.clear();
	}

	/** Compatibility alias for the earlier research API. */
	public recreateWindow(changeWindow: () => void): void {
		this.rebindWindow(changeWindow);
	}

	/** Flush all primitives and clicks in one native frame call. */
	public draw(): void {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		this.gui.overlayCommands = this.commands;
		this.gui.draw();
	}

	/** Draw into a Three.js render target for use on a mesh or sprite. */
	public drawToTarget(renderer: THREE.WebGLRenderer, target: THREE.WebGLRenderTarget): void {
		if (this.destroyed) throw new Error('GameUI is destroyed');
		const previousTarget = renderer.getRenderTarget();
		const previousColor = renderer.getClearColor(new THREE.Color()).clone();
		const previousAlpha = renderer.getClearAlpha();
		this.gui.surfaceSize = { width: target.width, height: target.height };
		try {
			renderer.setRenderTarget(target);
			renderer.setClearColor(0x000000, 0);
			renderer.clear(true, true, true);
			this.draw();
		} finally {
			this.gui.surfaceSize = undefined;
			renderer.setRenderTarget(previousTarget);
			renderer.setClearColor(previousColor, previousAlpha);
			// The ImGui backend binds GL state outside Three's state cache.
			renderer.resetState();
		}
	}

	public get wantsCaptureMouse(): boolean {
		return this.gui.wantsCaptureMouse;
	}

	public get wantsCaptureKeyboard(): boolean {
		return this.gui.wantsCaptureKeyboard;
	}

	public destroy(): void {
		if (this.destroyed) return;
		for (const id of this.images) this.gui.releaseGameImage(id);
		this.images.clear();
		this.fonts.clear();
		this.gui.destroy();
		this.destroyed = true;
	}
}
