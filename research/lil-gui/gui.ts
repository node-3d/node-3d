import '@node-3d/deps-opengl';
import { createRequire } from 'node:module';
import type {
	TEvent,
	TKeyEvent,
	TMouseButtonEvent,
	TMouseEvent,
	TMouseScrollEvent,
	TWindowHandle,
} from '@node-3d/glfw';

type Target = object;
type ColorObject = { r: number; g: number; b: number };
type Window = {
	handle: TWindowHandle;
	makeCurrent(): void;
	on(type: string, listener: (event: TEvent) => void): unknown;
	off(type: string, listener: (event: TEvent) => void): unknown;
};
type InputEvent =
	| { type: 'mousemove'; x: number; y: number }
	| { type: 'mousedown' | 'mouseup'; x: number; y: number; button: number }
	| { type: 'wheel'; x: number; y: number; deltaX: number; deltaY: number }
	| {
			type: 'keydown' | 'keyup';
			code: string;
			charCode: number;
			ctrlKey: boolean;
			shiftKey: boolean;
			altKey: boolean;
			metaKey: boolean;
	  };
export type GameCommand =
	| { kind: 'rect'; x: number; y: number; w: number; h: number; color: number }
	| {
			kind: 'text';
			x: number;
			y: number;
			text: string;
			size: number;
			color: number;
			font?: number;
	  }
	| { kind: 'image'; x: number; y: number; w: number; h: number; image: number }
	| {
			kind: 'button';
			id: string;
			x: number;
			y: number;
			w: number;
			h: number;
			text: string;
			size: number;
			color: number;
			hoverColor: number;
			textColor: number;
	  };
type Kind =
	| 'folder'
	| 'number'
	| 'boolean'
	| 'button'
	| 'select'
	| 'color'
	| 'string'
	| 'label'
	| 'deleted';
type Options = unknown[] | Record<string, unknown>;
type ChangeHandler = (value: unknown) => void;
export type GUIChangeEvent = {
	object: Target;
	property: string;
	value: unknown;
	controller: Controller;
};
type GUIChangeHandler = (event: GUIChangeEvent) => void;

type Descriptor = {
	kind: Kind;
	label: string;
	parent: number;
	min?: number;
	max?: number;
	step?: number;
	decimals?: number;
	options?: string[];
	hidden?: boolean;
	disabled?: boolean;
	closed?: boolean;
};

type NativeChange = {
	id: number;
	value: number | string | [number, number, number];
	changed: boolean;
	finished: boolean;
	folderToggle: boolean;
};
type Native = {
	init(handle: TWindowHandle): void;
	define(
		controls: Descriptor[],
		panel: {
			id: number;
			title: string;
			hidden: boolean;
			closed: boolean;
			width: number;
			height?: number;
			x: number;
		},
	): void;
	render(
		values: unknown[],
		events: InputEvent[],
		commands?: GameCommand[],
		surface?: { width: number; height: number },
	): {
		changes: NativeChange[];
		actions: string[];
		captureMouse: boolean;
		captureKeyboard: boolean;
	};
	createGameImage(width: number, height: number, pixels: Buffer): number;
	releaseGameImage(id: number): void;
	createGameFont(data: Buffer, size: number): number;
	resetInput(): void;
	suspendWindow(): void;
	resumeWindow(handle: TWindowHandle): void;
	shutdown(): void;
};

const require = createRequire(import.meta.url);
const native = require('./build/Release/node3d_lil_gui_research.node') as Native;

type Entry = {
	descriptor: Descriptor;
	owner: Folder;
	target?: Target;
	property?: string;
	values?: unknown[];
	initialValue?: unknown;
	colorRange?: number;
	controller?: Controller;
	folder?: Folder;
	onChange?: ChangeHandler;
	onFinishChange?: ChangeHandler;
};

function read(target: Target, property: string): unknown {
	return (target as Record<string, unknown>)[property];
}

function write(target: Target, property: string, value: unknown): void {
	(target as Record<string, unknown>)[property] = value;
}

function copyValue(value: unknown): unknown {
	if (Array.isArray(value)) return [...value];
	if (value && typeof value === 'object') return { ...value };
	return value;
}

function colorChannels(value: unknown, range = 1): [number, number, number] {
	if (typeof value === 'number' && Number.isFinite(value)) {
		return [((value >>> 16) & 255) / 255, ((value >>> 8) & 255) / 255, (value & 255) / 255];
	}
	if (typeof value === 'string') {
		const hex = value.startsWith('#') ? value.slice(1) : value;
		if (/^[\da-f]{3}$/i.test(hex)) {
			return colorChannels(
				Number.parseInt([...hex].map((digit) => digit + digit).join(''), 16),
			);
		}
		if (/^[\da-f]{6}$/i.test(hex)) return colorChannels(Number.parseInt(hex, 16));
		const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(value);
		if (rgb) {
			const channels = rgb.slice(1).map(Number);
			if (channels.every((channel) => channel <= 255)) {
				return [channels[0] / 255, channels[1] / 255, channels[2] / 255];
			}
		}
	}
	if (Array.isArray(value) && value.length >= 3) {
		const channels = value.slice(0, 3).map(Number);
		if (channels.every(Number.isFinite))
			return [channels[0] / range, channels[1] / range, channels[2] / range];
	}
	if (value && typeof value === 'object') {
		const color = value as ColorObject;
		if ([color.r, color.g, color.b].every(Number.isFinite)) {
			return [color.r / range, color.g / range, color.b / range];
		}
	}
	throw new Error('Unsupported color value');
}

function writeColor(previous: unknown, channels: [number, number, number], range = 1): unknown {
	if (Array.isArray(previous)) {
		for (let i = 0; i < 3; i++) previous[i] = channels[i] * range;
		return previous;
	}
	if (previous && typeof previous === 'object') {
		const color = previous as ColorObject;
		[color.r, color.g, color.b] = channels.map((channel) => channel * range);
		return previous;
	}
	const packed =
		(Math.round(channels[0] * 255) << 16) |
		(Math.round(channels[1] * 255) << 8) |
		Math.round(channels[2] * 255);
	return typeof previous === 'string' ? `#${packed.toString(16).padStart(6, '0')}` : packed;
}

function optionParts(options: Options): { labels: string[]; values: unknown[] } {
	return Array.isArray(options)
		? { labels: options.map(String), values: [...options] }
		: { labels: Object.keys(options), values: Object.values(options) };
}

export class Controller {
	private readonly gui: GUI;
	private readonly id: number;
	public constructor(gui: GUI, id: number) {
		this.gui = gui;
		this.id = id;
	}

	private get item(): Entry {
		const entry = this.gui.entry(this.id);
		if (entry.descriptor.kind === 'deleted' || entry.controller !== this)
			throw new Error('Controller is destroyed');
		return entry;
	}

	public get object(): Target {
		return this.item.target!;
	}

	public get property(): string {
		return this.item.property!;
	}

	public get parent(): Folder {
		return this.item.owner;
	}

	public get initialValue(): unknown {
		return copyValue(this.item.initialValue);
	}

	public name(label: string): this {
		this.item.descriptor.label = label;
		this.gui.markDirty();
		return this;
	}

	public onChange(callback: ChangeHandler): this {
		this.item.onChange = callback;
		return this;
	}

	public onFinishChange(callback: ChangeHandler): this {
		this.item.onFinishChange = callback;
		return this;
	}

	public options(options: Options): Controller {
		const parts = optionParts(options);
		const previous = this.item;
		this.gui.remove(this.id);
		const entry: Entry = {
			...previous,
			descriptor: { ...previous.descriptor, kind: 'select', options: parts.labels },
			values: parts.values,
			controller: undefined,
			onChange: undefined,
			onFinishChange: undefined,
		};
		const id = this.gui.register(entry);
		entry.controller = new Controller(this.gui, id);
		return entry.controller;
	}

	public min(value: number): this {
		this.item.descriptor.min = value;
		this.gui.markDirty();
		return this;
	}

	public max(value: number): this {
		this.item.descriptor.max = value;
		this.gui.markDirty();
		return this;
	}

	public step(value: number): this {
		if (!(value > 0)) throw new RangeError('step must be positive');
		this.item.descriptor.step = value;
		this.gui.markDirty();
		return this;
	}

	public decimals(value: number): this {
		if (!Number.isInteger(value) || value < 0 || value > 15)
			throw new RangeError('decimals must be 0–15');
		this.item.descriptor.decimals = value;
		this.gui.markDirty();
		return this;
	}

	public enable(): this {
		this.item.descriptor.disabled = false;
		this.gui.markDirty();
		return this;
	}

	public disable(disabled = true): this {
		this.item.descriptor.disabled = disabled;
		this.gui.markDirty();
		return this;
	}

	public show(show = true): this {
		this.item.descriptor.hidden = !show;
		this.gui.markDirty();
		return this;
	}

	public hide(): this {
		this.item.descriptor.hidden = true;
		this.gui.markDirty();
		return this;
	}

	public listen(_listen = true): this {
		// The batched bridge samples every property on every draw.
		return this;
	}

	public updateDisplay(): this {
		return this;
	}

	public getValue(): unknown {
		return read(this.object, this.property);
	}

	public setValue(value: unknown): this {
		const entry = this.item;
		if (entry.descriptor.kind === 'number') {
			if (typeof value !== 'number' || !Number.isFinite(value))
				throw new TypeError('Expected a finite number');
			const { min, max, step } = entry.descriptor;
			if (step) value = Math.round(value / step) * step;
			if (min !== undefined) value = Math.max(value as number, min);
			if (max !== undefined) value = Math.min(value as number, max);
		}
		if (entry.descriptor.kind === 'color') {
			value = writeColor(
				read(entry.target!, entry.property!),
				colorChannels(value, entry.colorRange),
				entry.colorRange,
			);
		}
		write(entry.target!, entry.property!, value);
		this.gui.emit(entry, value, false);
		return this;
	}

	public reset(): this {
		return this.setValue(copyValue(this.item.initialValue));
	}

	public destroy(): void {
		this.gui.remove(this.id);
	}
}

export class Folder {
	private readonly rootRef: GUI | null;
	public readonly id: number;
	private changeHandler?: GUIChangeHandler;
	private finishHandler?: GUIChangeHandler;
	private openCloseHandler?: (folder: Folder) => void;

	public constructor(root: GUI | null, id: number) {
		this.rootRef = root;
		this.id = id;
	}

	public get root(): GUI {
		if (this.rootRef) return this.rootRef;
		if (this instanceof GUI) return this;
		throw new Error('Folder has no GUI root');
	}

	public get parent(): Folder | undefined {
		return this.id < 0 ? undefined : this.root.entry(this.id).owner;
	}

	public get children(): (Controller | Folder)[] {
		return this.root.entries
			.filter(
				(entry) =>
					entry.descriptor.parent === this.id && entry.descriptor.kind !== 'deleted',
			)
			.map((entry) => entry.folder ?? entry.controller!);
	}

	public get controllers(): Controller[] {
		return this.children.filter((child): child is Controller => child instanceof Controller);
	}

	public get folders(): Folder[] {
		return this.children.filter((child): child is Folder => child instanceof Folder);
	}

	public controllersRecursive(): Controller[] {
		return [
			...this.controllers,
			...this.folders.flatMap((folder) => folder.controllersRecursive()),
		];
	}

	public foldersRecursive(): Folder[] {
		return this.folders.flatMap((folder) => [folder, ...folder.foldersRecursive()]);
	}

	public add(
		target: Target,
		property: string,
		minOrOptions?: number | Options,
		max?: number,
		step?: number,
	): Controller {
		if (!(property in target)) throw new Error(`Unknown GUI property: ${property}`);
		if (step !== undefined && !(step > 0)) throw new RangeError('step must be positive');
		const value = read(target, property);
		let kind: Kind;
		let options: string[] | undefined;
		let values: unknown[] | undefined;
		if (Array.isArray(minOrOptions) || (minOrOptions && typeof minOrOptions === 'object')) {
			kind = 'select';
			const parts = optionParts(minOrOptions);
			options = parts.labels;
			values = parts.values;
		} else if (typeof value === 'number') kind = 'number';
		else if (typeof value === 'boolean') kind = 'boolean';
		else if (typeof value === 'function') kind = 'button';
		else if (typeof value === 'string') kind = 'string';
		else throw new Error(`Unsupported GUI property type for ${property}`);
		const entry: Entry = {
			descriptor: {
				kind,
				label: property,
				parent: this.id,
				min: typeof minOrOptions === 'number' ? minOrOptions : undefined,
				max,
				step,
				options,
			},
			owner: this,
			target,
			property,
			values,
			initialValue: copyValue(value),
		};
		const id = this.root.register(entry);
		entry.controller = new Controller(this.root, id);
		return entry.controller;
	}

	public addColor(target: Target, property: string, range = 1): Controller {
		if (!(property in target)) throw new Error(`Unknown GUI property: ${property}`);
		if (!(range > 0)) throw new RangeError('color range must be positive');
		const value = read(target, property);
		colorChannels(value, range);
		const entry: Entry = {
			descriptor: { kind: 'color', label: property, parent: this.id },
			owner: this,
			target,
			property,
			initialValue: copyValue(value),
			colorRange: range,
		};
		const id = this.root.register(entry);
		entry.controller = new Controller(this.root, id);
		return entry.controller;
	}

	/** Read-only wrapped text for native applications built with this bridge. */
	public addLabel(target: Target, property: string): Controller {
		if (typeof read(target, property) !== 'string')
			throw new TypeError('Label value must be a string');
		const entry: Entry = {
			descriptor: { kind: 'label', label: property, parent: this.id },
			owner: this,
			target,
			property,
			initialValue: read(target, property),
		};
		const id = this.root.register(entry);
		entry.controller = new Controller(this.root, id);
		return entry.controller;
	}

	public addFolder(title: string): Folder {
		const entry: Entry = {
			descriptor: { kind: 'folder', label: title, parent: this.id },
			owner: this,
		};
		const id = this.root.register(entry);
		entry.folder = new Folder(this.root, id);
		return entry.folder;
	}

	public title(title: string): this {
		if (this.id < 0) this.root.panel.title = title;
		else this.root.entry(this.id).descriptor.label = title;
		this.root.markDirty();
		return this;
	}

	public open(open = true): this {
		this.setClosed(!open);
		return this;
	}

	public close(): this {
		this.setClosed(true);
		return this;
	}

	private setClosed(closed: boolean): void {
		const previous =
			this.id < 0 ? this.root.panel.closed : !!this.root.entry(this.id).descriptor.closed;
		if (previous === closed) return;
		if (this.id < 0) this.root.panel.closed = closed;
		else this.root.entry(this.id).descriptor.closed = closed;
		this.root.markDirty();
		this.dispatchOpenClose(this);
	}

	private dispatchOpenClose(changed: Folder): void {
		this.openCloseHandler?.(changed);
		this.parent?.dispatchOpenClose(changed);
	}

	public toggleFromNative(open: boolean): void {
		this.setClosed(!open);
	}

	public show(show = true): this {
		if (this.id < 0) this.root.panel.hidden = !show;
		else this.root.entry(this.id).descriptor.hidden = !show;
		this.root.markDirty();
		return this;
	}

	public hide(): this {
		if (this.id < 0) this.root.panel.hidden = true;
		else this.root.entry(this.id).descriptor.hidden = true;
		this.root.markDirty();
		return this;
	}

	public onChange(callback: GUIChangeHandler): this {
		this.changeHandler = callback;
		return this;
	}

	public onFinishChange(callback: GUIChangeHandler): this {
		this.finishHandler = callback;
		return this;
	}

	public onOpenClose(callback: (folder: Folder) => void): this {
		this.openCloseHandler = callback;
		return this;
	}

	public dispatch(event: GUIChangeEvent, finished: boolean): void {
		if (finished) this.finishHandler?.(event);
		else this.changeHandler?.(event);
		this.parent?.dispatch(event, finished);
	}

	public reset(recursive = true): this {
		for (const controller of this.controllers) controller.reset();
		if (recursive) for (const folder of this.folders) folder.reset(true);
		return this;
	}

	public save(recursive = true): {
		controllers: Record<string, unknown>;
		folders: Record<string, unknown>;
	} {
		const data: { controllers: Record<string, unknown>; folders: Record<string, unknown> } = {
			controllers: {},
			folders: {},
		};
		for (const child of this.children) {
			const entry =
				child instanceof Controller
					? this.root.entry(this.root.idOf(child))
					: this.root.entry(child.id);
			const name = entry.descriptor.label;
			if (child instanceof Controller) {
				if (Object.hasOwn(data.controllers, name))
					throw new Error(`Duplicate controller name: ${name}`);
				if (entry.descriptor.kind !== 'button')
					data.controllers[name] = copyValue(child.getValue());
			} else if (recursive) {
				if (Object.hasOwn(data.folders, name))
					throw new Error(`Duplicate folder name: ${name}`);
				data.folders[name] = child.save(true);
			}
		}
		return data;
	}

	public load(
		data: { controllers?: Record<string, unknown>; folders?: Record<string, unknown> },
		recursive = true,
	): this {
		for (const child of this.children) {
			const entry =
				child instanceof Controller
					? this.root.entry(this.root.idOf(child))
					: this.root.entry(child.id);
			const name = entry.descriptor.label;
			if (child instanceof Controller) {
				if (data.controllers && Object.hasOwn(data.controllers, name)) {
					child.setValue(copyValue(data.controllers[name]));
				}
			} else if (recursive && data.folders && Object.hasOwn(data.folders, name)) {
				child.load(
					data.folders[name] as {
						controllers?: Record<string, unknown>;
						folders?: Record<string, unknown>;
					},
				);
			}
		}
		return this;
	}

	public destroy(): void {
		if (this.id < 0) {
			this.root.destroy();
			return;
		}
		for (const child of this.children) child.destroy();
		this.root.remove(this.id);
	}
}

export class GUI extends Folder {
	private static activeWindow: Window | null = null;
	private static activeHandle: TWindowHandle | null = null;
	private static instances = 0;
	private static lastDefined: GUI | null = null;
	private static nextId = 0;
	private static nextX = 15;
	private static live = new Set<GUI>();
	private static inputQueue: InputEvent[] = [];
	private static inputListeners: [string, (event: TEvent) => void][] = [];
	private readonly window: Window;
	public readonly entries: Entry[] = [];
	public readonly panel = {
		id: GUI.nextId++,
		title: 'Controls',
		hidden: false,
		closed: false,
		width: 400,
		height: 0,
		x: 15,
	};
	private dirty = true;
	private disposed = false;
	public measure = false;
	public wantsCaptureMouse = false;
	public wantsCaptureKeyboard = false;
	public overlayCommands: GameCommand[] = [];
	public surfaceSize?: { width: number; height: number };
	public inputFilter?: (event: TEvent) => boolean;
	public onOverlayAction?: (id: string) => void;
	public lastTiming = { snapshotMs: 0, nativeMs: 0, applyMs: 0 };

	public constructor(
		windowOrOptions:
			| Window
			| {
					title?: string;
					width?: number;
					height?: number;
					closed?: boolean;
			  } = globalThis.document as unknown as Window,
		options: { title?: string; width?: number; height?: number; closed?: boolean } = {},
	) {
		super(null, -1);
		const isWindow =
			windowOrOptions && typeof (windowOrOptions as Window).makeCurrent === 'function';
		const window = (isWindow ? windowOrOptions : globalThis.document) as Window;
		const guiOptions = isWindow
			? options
			: (windowOrOptions as {
					title?: string;
					width?: number;
					height?: number;
					closed?: boolean;
				});
		if (!window || typeof window.makeCurrent !== 'function')
			throw new Error('Initialize Node3D before constructing GUI');
		this.window = window;
		if (guiOptions.title) this.panel.title = guiOptions.title;
		if (guiOptions.width) this.panel.width = guiOptions.width;
		if (guiOptions.height) this.panel.height = guiOptions.height;
		if (guiOptions.closed) this.panel.closed = true;
		this.panel.x = GUI.nextX;
		if (GUI.activeHandle && GUI.activeHandle !== window.handle) {
			throw new Error('All live GUI instances must use the same GLFW window');
		}
		window.makeCurrent();
		if (!GUI.activeWindow) {
			native.init(window.handle);
			GUI.activeWindow = window;
			GUI.activeHandle = window.handle;
			const listen = (type: string, translate: (event: TEvent) => InputEvent): void => {
				const handler = (event: TEvent): void => {
					if ([...GUI.live].some((panel) => panel.inputFilter?.(event) ?? true))
						GUI.inputQueue.push(translate(event));
				};
				window.on(type, handler);
				GUI.inputListeners.push([type, handler]);
			};
			listen('mousemove', (event) => {
				const mouse = event as TMouseEvent;
				return { type: 'mousemove', x: mouse.clientX, y: mouse.clientY };
			});
			for (const type of ['mousedown', 'mouseup'] as const) {
				listen(type, (event) => {
					const mouse = event as TMouseButtonEvent;
					return { type, x: mouse.clientX, y: mouse.clientY, button: mouse.button };
				});
			}
			listen('wheel', (event) => {
				const mouse = event as TMouseScrollEvent;
				return {
					type: 'wheel',
					x: mouse.clientX,
					y: mouse.clientY,
					deltaX: mouse.deltaX,
					deltaY: mouse.deltaY,
				};
			});
			for (const type of ['keydown', 'keyup'] as const) {
				listen(type, (event) => {
					const key = event as TKeyEvent;
					return {
						type,
						code: key.code ?? '',
						charCode: key.charCode,
						ctrlKey: key.ctrlKey,
						shiftKey: key.shiftKey,
						altKey: key.altKey,
						metaKey: key.metaKey,
					};
				});
			}
		}
		GUI.instances++;
		GUI.live.add(this);
		GUI.nextX += this.panel.width + 15;
	}

	/** Draw every panel attached to the current Node3D window once. */
	public static drawAll(): void {
		for (const panel of GUI.live) panel.draw();
	}

	/** Number of native panels currently attached to this process. */
	public static get panelCount(): number {
		return GUI.live.size;
	}

	public register(entry: Entry): number {
		if (this.disposed) throw new Error('GUI is disposed');
		const id = this.entries.length;
		this.entries.push(entry);
		this.dirty = true;
		return id;
	}

	public entry(id: number): Entry {
		const entry = this.entries[id];
		if (!entry) throw new Error(`Unknown controller ${id}`);
		return entry;
	}

	public idOf(controller: Controller): number {
		const id = this.entries.findIndex((entry) => entry.controller === controller);
		if (id < 0) throw new Error('Controller does not belong to GUI');
		return id;
	}

	public remove(id: number): void {
		this.entry(id).descriptor.kind = 'deleted';
		this.markDirty();
	}

	public markDirty(): void {
		this.dirty = true;
	}

	/** Upload an RGBA image owned by this GUI's current GL context. */
	public createGameImage(width: number, height: number, pixels: Buffer): number {
		if (this.disposed) throw new Error('GUI is disposed');
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed; recreate GUI');
		this.window.makeCurrent();
		return native.createGameImage(width, height, pixels);
	}

	public releaseGameImage(id: number): void {
		if (this.disposed) throw new Error('GUI is disposed');
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed; recreate GUI');
		this.window.makeCurrent();
		native.releaseGameImage(id);
	}

	public createGameFont(data: Buffer, size: number): number {
		if (this.disposed) throw new Error('GUI is disposed');
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed; recreate GUI');
		this.window.makeCurrent();
		return native.createGameFont(data, size);
	}

	public resetInput(): void {
		if (this.disposed) throw new Error('GUI is disposed');
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed; recreate GUI');
		GUI.inputQueue = [];
		this.window.makeCurrent();
		native.resetInput();
	}

	/** Rebind ImGui's window backend while retaining its shared GL resources. */
	public transitionWindow(changeWindow: () => void): void {
		if (this.disposed) throw new Error('GUI is disposed');
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed before GUI could detach from it');
		if (GUI.live.size !== 1)
			throw new Error('Close other GUI panels before changing this window');
		this.window.makeCurrent();
		native.suspendWindow();
		try {
			changeWindow();
		} finally {
			this.window.makeCurrent();
			native.resumeWindow(this.window.handle);
			GUI.activeHandle = this.window.handle;
			GUI.inputQueue = [];
			GUI.lastDefined = null;
		}
	}

	public emit(entry: Entry, value: unknown, finished: boolean): void {
		if (!entry.target || !entry.property || !entry.controller) return;
		if (finished) entry.onFinishChange?.call(entry.controller, value);
		else entry.onChange?.call(entry.controller, value);
		entry.owner.dispatch(
			{ object: entry.target, property: entry.property, value, controller: entry.controller },
			finished,
		);
	}

	public draw(): void {
		if (this.disposed) throw new Error('GUI is disposed');
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed; recreate GUI for the new context');
		this.window.makeCurrent();
		const started = this.measure ? performance.now() : 0;
		if (this.dirty || GUI.lastDefined !== this) {
			native.define(
				this.entries.map((entry) => entry.descriptor),
				this.panel,
			);
			this.dirty = false;
			GUI.lastDefined = this;
		}
		const values = this.entries.map((entry) => {
			if (!entry.target || !entry.property || entry.descriptor.kind === 'deleted')
				return null;
			const value = read(entry.target, entry.property);
			if (entry.descriptor.kind === 'select') return entry.values?.indexOf(value) ?? -1;
			if (entry.descriptor.kind === 'color') return colorChannels(value, entry.colorRange);
			return typeof value === 'function' ? null : value;
		});
		const snapshotted = this.measure ? performance.now() : 0;
		const frame = native.render(
			values,
			GUI.inputQueue.splice(0),
			this.overlayCommands,
			this.surfaceSize,
		);
		this.wantsCaptureMouse = frame.captureMouse;
		this.wantsCaptureKeyboard = frame.captureKeyboard;
		const rendered = this.measure ? performance.now() : 0;
		for (const change of frame.changes) {
			if (change.folderToggle) {
				const folder = change.id < 0 ? this : this.entry(change.id).folder;
				folder?.toggleFromNative(change.value !== 0);
				continue;
			}
			const entry = this.entry(change.id);
			if (entry.descriptor.kind === 'deleted' || !entry.target || !entry.property) continue;
			if (entry.descriptor.kind === 'button') {
				const action = read(entry.target, entry.property);
				if (typeof action === 'function') action.call(entry.target);
				this.emit(entry, action, false);
				continue;
			}
			const value =
				entry.descriptor.kind === 'boolean'
					? change.value !== 0
					: entry.descriptor.kind === 'color' && Array.isArray(change.value)
						? writeColor(
								read(entry.target, entry.property),
								change.value,
								entry.colorRange,
							)
						: entry.descriptor.kind === 'select' && typeof change.value === 'number'
							? entry.values?.[change.value]
							: change.value;
			if (value === undefined) continue;
			if (change.changed) {
				write(entry.target, entry.property, value);
				this.emit(entry, value, false);
			}
			if (change.finished) this.emit(entry, value, true);
		}
		for (const action of frame.actions) this.onOverlayAction?.(action);
		if (this.measure) {
			this.lastTiming = {
				snapshotMs: snapshotted - started,
				nativeMs: rendered - snapshotted,
				applyMs: performance.now() - rendered,
			};
		}
	}

	public override destroy(): void {
		if (this.disposed) return;
		if (GUI.activeHandle !== this.window.handle)
			throw new Error('GLFW window changed before GUI shutdown; use GameUI.rebindWindow');
		GUI.live.delete(this);
		this.window.makeCurrent();
		if (GUI.lastDefined === this) GUI.lastDefined = null;
		if (--GUI.instances === 0) {
			for (const [type, listener] of GUI.inputListeners) this.window.off(type, listener);
			GUI.inputListeners = [];
			GUI.inputQueue = [];
			native.shutdown();
			GUI.activeWindow = null;
			GUI.activeHandle = null;
			GUI.nextX = 15;
		}
		this.disposed = true;
	}
}
