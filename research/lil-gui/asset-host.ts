// Resolve example assets for both Three's default and example-created managers.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { LoadingManager } from 'three';

const assetBase = 'https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/';
const decoderUrls = new Map<string, string>();
export const assets = { started: 0, finished: 0, pending: 0, errors: 0 };

export function resolveExampleUrl(url: string): string {
	if (url.startsWith('file:')) {
		const path = fileURLToPath(url);
		if (
			/[\\/]node_modules[\\/]three[\\/]examples[\\/]jsm[\\/]libs[\\/](?:draco|basis)[\\/]/iu.test(
				path,
			)
		) {
			let dataUrl = decoderUrls.get(path);
			if (!dataUrl) {
				const mime = path.endsWith('.wasm') ? 'application/wasm' : 'text/javascript';
				dataUrl = `data:${mime};base64,${readFileSync(path).toString('base64')}`;
				decoderUrls.set(path, dataUrl);
			}
			return dataUrl;
		}
	}
	return /^(?:[a-z][a-z\d+.-]*:|\/\/)/iu.test(url) ? url : new URL(url, assetBase).href;
}

export function adaptLoadingManager(manager: LoadingManager): void {
	const resolveURL = manager.resolveURL.bind(manager);
	const itemStart = manager.itemStart.bind(manager);
	const itemEnd = manager.itemEnd.bind(manager);
	const itemError = manager.itemError.bind(manager);
	manager.resolveURL = (url) => resolveExampleUrl(resolveURL(url));
	manager.itemStart = (url) => {
		assets.started++;
		assets.pending++;
		itemStart(url);
	};
	manager.itemEnd = (url) => {
		assets.finished++;
		assets.pending--;
		itemEnd(url);
	};
	manager.itemError = (url) => {
		assets.errors++;
		itemError(url);
	};
}
