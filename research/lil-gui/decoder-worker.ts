// Run Three.js's generated decoder worker body in a Node worker thread.
// The decoder source and WASM remain the unmodified files shipped by three.
import { runInThisContext } from 'node:vm';
import { parentPort, workerData, type Transferable as NodeTransferable } from 'node:worker_threads';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

if (!parentPort) throw new Error('Decoder bridge requires a worker thread');
const port = parentPort;
const scope = globalThis as unknown as {
	self: unknown;
	onmessage?: (event: { data: unknown }) => void;
	postMessage: (value: unknown, transfer?: readonly Transferable[]) => void;
	addEventListener: (type: string, listener: (event: { data: unknown }) => void) => void;
};
const listeners = new Set<(event: { data: unknown }) => void>();
scope.self = scope;
scope.postMessage = (value, transfer) =>
	port.postMessage(value, transfer as readonly NodeTransferable[]);
scope.addEventListener = (type, listener) => {
	if (type === 'message') listeners.add(listener);
};
Object.assign(globalThis, {
	require: createRequire(import.meta.url),
	__dirname: dirname(fileURLToPath(import.meta.url)),
});

const source = await (workerData as Blob).text();
runInThisContext(source, { filename: 'three-decoder-worker.js' });
port.on('message', (data) => {
	const event = { data };
	scope.onmessage?.(event);
	for (const listener of listeners) listener(event);
});
