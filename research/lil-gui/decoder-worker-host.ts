// Minimal browser Worker surface used by unmodified Three.js decoder addons.
import { resolveObjectURL } from 'node:buffer';
import { Worker as NodeWorker, type Transferable as NodeTransferable } from 'node:worker_threads';

type MessageEvent = { data: unknown };
type Listener = (event: MessageEvent) => void;

export class DecoderWorker {
	private readonly thread: NodeWorker;
	private readonly listeners = new Set<Listener>();
	public onmessage: Listener | null = null;
	public onerror: ((error: Error) => void) | null = null;

	public constructor(url: string | URL) {
		const blob = resolveObjectURL(String(url));
		if (!blob) throw new Error(`Decoder Worker requires a Node Blob URL: ${url}`);
		this.thread = new NodeWorker(new URL('./decoder-worker.ts', import.meta.url), {
			workerData: blob,
			execArgv: [],
		});
		this.thread.on('message', (data: unknown) => {
			const event = { data };
			this.onmessage?.(event);
			for (const listener of this.listeners) listener(event);
		});
		this.thread.on('error', (error) => {
			if (this.onerror) this.onerror(error);
			else console.error('Decoder worker failed:', error);
		});
	}

	public postMessage(value: unknown, transfer?: readonly Transferable[]): void {
		this.thread.postMessage(value, transfer as readonly NodeTransferable[]);
	}

	public addEventListener(type: string, listener: Listener): void {
		if (type === 'message') this.listeners.add(listener);
	}

	public removeEventListener(type: string, listener: Listener): void {
		if (type === 'message') this.listeners.delete(listener);
	}

	public terminate(): Promise<number> {
		return this.thread.terminate();
	}
}
