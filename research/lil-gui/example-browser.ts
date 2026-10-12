/** Experimental browser for compatible Three.js r186 WebGL examples. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const revision = 'r186';
const root = `https://raw.githubusercontent.com/mrdoob/three.js/${revision}/examples`;
const virtualPrefix = 'node3d-example:';
const optionalPageIds = new Set([
	'hideLines',
	'showAllLines',
	'title',
	'notSupported',
	'progressBar',
	'loader',
	'val_left',
	'val_right',
	'values',
]);
type Catalog = Record<string, string[]>;
type ProbeResult = { ok: boolean; reason?: string; evidence?: string };
const presentationNotice =
	'HTML/CSS presentation and DOM widgets are omitted. A passing framebuffer probe does not establish visual or interaction parity.';

export function explainScreen(reason: string): string {
	if (reason.startsWith('unsupported import '))
		return `This page imports ${reason.slice(19)}, which is unavailable to the current Node loader.`;
	if (reason.startsWith('HTML element #'))
		return `The script reads ${reason.slice(13)} from the HTML page; this element is not supplied by the host.`;
	switch (reason) {
		case 'source fetch failed':
			return 'The upstream source could not be fetched. This does not indicate a compatibility failure.';
		case 'non-mount DOM element':
			return 'The script creates a DOM element used beyond the supported mount and label stubs, possibly a 2D canvas.';
		case 'HTML widget or media element':
			return 'The page contains an HTML widget, canvas, or media element that the host does not display.';
		case 'HTML renderer addon':
			return 'The scene uses an HTML-based renderer or effect that needs page layout.';
		case 'HTML selector dependency':
			return 'The script queries page layout or an HTML element that the host does not supply.';
		case 'audio/video dependency':
			return 'The scene depends on browser audio or video facilities outside this host.';
		case 'platform dependency':
			return 'The script requests a WebGL2, WebGPU, or XR platform path outside this screen.';
		case 'no standard WebGL renderer':
			return 'The script does not construct a standard Three.js WebGLRenderer.';
		case 'no recognized render call':
			return 'The script has no render call recognized by the current host.';
		default:
			return `The current static screen stops at: ${reason}.`;
	}
}

export function explainProbeOutput(output: string, timedOut: boolean): ProbeResult {
	const patterns: [RegExp, string][] = [
		[
			/createImageBitmap/u,
			'The asset path needs createImageBitmap, which the host does not supply.',
		],
		[
			/getImageData|measureText|beginPath|createLinearGradient|fillRect/u,
			'The scene needs a 2D canvas drawing or pixel API that the host does not supply.',
		],
		[
			/readPixels[\s\S]*Argument 6 must be of type Object|Argument 6 must be of type Object/u,
			'The WebGL binding rejected the buffer-offset readPixels call.',
		],
		[
			/Unknown image format/u,
			'The image decoder could not read an asset format used by this scene.',
		],
		[
			/floatBitsToUint|uintBitsToFloat/u,
			'The current GLSL translation does not support a shader operation used by this scene.',
		],
		[
			/ERR_UNSUPPORTED_ESM_URL_SCHEME/u,
			'A transitive module import uses a URL scheme unsupported by the Node loader.',
		],
		[
			/uniform1f[\s\S]*(?:number|Number)/u,
			'A native uniform call received an argument the binding rejected.',
		],
		[
			/Scene capture looks empty|framebuffer[^\n]*uniform/iu,
			'The probe found no varied pixels in the default framebuffer; the underlying rendering cause is unverified.',
		],
		[
			/Failed to fetch|fetch failed|HTTP \d{3}/iu,
			'An asset or source request failed during this probe.',
		],
	];
	for (const [pattern, reason] of patterns) {
		if (pattern.test(output))
			return { ok: false, reason, evidence: output.match(pattern)?.[0] };
	}
	if (timedOut)
		return {
			ok: false,
			reason: 'The 15-second probe timed out; rendering may still work with more time.',
		};
	const failure = output.match(
		/(?:Example module failed:|Example frame failed:|Error:|TypeError:)[^\n]*/u,
	)?.[0];
	return {
		ok: false,
		reason: failure
			? `The host reported ${failure.trim()}`
			: 'The isolated process failed before framebuffer verification.',
	};
}

async function sourceAt(path: string): Promise<string> {
	const response = await fetch(`${root}/${path}`);
	if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
	return response.text();
}

async function catalog(): Promise<string[]> {
	const files = JSON.parse(await sourceAt('files.json')) as Catalog;
	return Object.entries(files)
		.filter(([category]) => category.startsWith('webgl') && category !== 'webgl / tsl')
		.flatMap(([, names]) => names)
		.filter((name) => /^webgl_[a-z0-9_]+$/u.test(name));
}

export function extractModule(html: string): {
	source?: string;
	shaderScripts?: Record<string, string>;
	reason?: string;
} {
	const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)];
	const modules = scripts.filter((match) => /\btype\s*=\s*["']module["']/iu.test(match[1]));
	if (modules.length !== 1)
		return { reason: `expected one inline module script, found ${modules.length}` };
	if (/\bsrc\s*=/iu.test(modules[0][1])) return { reason: 'external module script' };
	const source = modules[0][2];
	const imports = [
		...source.matchAll(/(?:^|\n)\s*import\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/gu),
	].map((match) => match[1]);
	if (
		imports.some((specifier) =>
			[
				'three/addons/effects/AsciiEffect.js',
				'three/addons/renderers/CSS2DRenderer.js',
				'three/addons/renderers/CSS3DRenderer.js',
			].includes(specifier),
		)
	) {
		return { reason: 'HTML renderer addon' };
	}
	const unsupportedImport = imports.find((specifier) => {
		if (specifier === 'three') return false;
		if (!specifier.startsWith('three/addons/')) return true;
		try {
			return !import.meta.resolve(specifier).startsWith('file:');
		} catch {
			return true;
		}
	});
	if (unsupportedImport) return { reason: `unsupported import ${unsupportedImport}` };
	const shaderScripts: Record<string, string> = {};
	for (const [, attributes, body] of scripts) {
		const id = /\bid\s*=\s*["']([^"']+)["']/iu.exec(attributes)?.[1];
		if (!id) continue;
		if (
			!/\btype\s*=\s*["'](?:x-shader\/|x-shader-|text\/glsl|text\/x-glsl)/iu.test(attributes)
		) {
			return { reason: `non-shader HTML script #${id}` };
		}
		shaderScripts[id] = body;
	}
	if (/<(?:video|audio|canvas|input|button|iframe)\b/iu.test(html)) {
		return { reason: 'HTML widget or media element' };
	}
	for (const match of source.matchAll(
		/\bdocument\.getElementById\s*\(\s*['"]([^'"]+)['"]\s*\)/gu,
	)) {
		if (
			match[1] !== 'container' &&
			!(match[1] in shaderScripts) &&
			!optionalPageIds.has(match[1])
		) {
			return { reason: `HTML element #${match[1]}` };
		}
	}
	const createdElements = [...source.matchAll(/\bdocument\.createElement\s*\(\s*([^)]*)\)/gu)];
	if (createdElements.some((match) => !/^['"](?:div|li|a)['"]$/u.test(match[1].trim()))) {
		return { reason: 'non-mount DOM element' };
	}
	const selectors = [...source.matchAll(/\bdocument\.querySelector\s*\(\s*([^)]*)\)/gu)];
	if (
		selectors.some((match) => {
			const id = /^['"]#([\w-]+)['"]$/u.exec(match[1].trim())?.[1];
			return !id || (id !== 'container' && !(id in shaderScripts));
		})
	) {
		return { reason: 'HTML selector dependency' };
	}
	if (/\bnew\s+(?:THREE\.)?AudioLoader\b|\bVideoTexture\b/u.test(source)) {
		return { reason: 'audio/video dependency' };
	}
	if (/\b(?:WebGL2|WebGPU)\b|\bnavigator\.xr\b/u.test(source)) {
		return { reason: 'platform dependency' };
	}
	if (!/new\s+THREE\.WebGLRenderer\s*\(/u.test(source))
		return { reason: 'no standard WebGL renderer' };
	if (
		!/(?:\.setAnimationLoop|\brequestAnimationFrame|\brenderer\.render|\bcomposer\.render|\bfinalComposer\.render)\s*\(/u.test(
			source,
		)
	) {
		return { reason: 'no recognized render call' };
	}
	return { source, shaderScripts };
}

export async function scan(limit: number): Promise<{
	found: { name: string; source: string }[];
	reasons: Map<string, number>;
	unsupportedImports: Map<string, number>;
	rejected: { name: string; reason: string }[];
	scanned: number;
}> {
	const names = (await catalog()).slice(0, limit);
	const found: { name: string; source: string }[] = [];
	const reasons = new Map<string, number>();
	const unsupportedImports = new Map<string, number>();
	const rejected: { name: string; reason: string }[] = [];
	let cursor = 0;
	await Promise.all(
		Array.from({ length: Math.min(12, names.length) }, async () => {
			while (cursor < names.length) {
				const name = names[cursor++];
				try {
					const result = extractModule(await sourceAt(`${name}.html`));
					if (result.source) found.push({ name, source: result.source });
					else {
						rejected.push({ name, reason: result.reason! });
						if (result.reason!.startsWith('unsupported import ')) {
							const specifier = result.reason!.slice('unsupported import '.length);
							unsupportedImports.set(
								specifier,
								(unsupportedImports.get(specifier) ?? 0) + 1,
							);
						}
						const reason = result.reason!.startsWith('unsupported import')
							? 'unsupported import'
							: result.reason!;
						reasons.set(reason, (reasons.get(reason) ?? 0) + 1);
					}
				} catch (error) {
					rejected.push({ name, reason: 'source fetch failed' });
					reasons.set(
						'source fetch failed',
						(reasons.get('source fetch failed') ?? 0) + 1,
					);
					console.error(`${name}: ${String(error)}`);
				}
			}
		}),
	);
	return {
		found: found.sort((a, b) => a.name.localeCompare(b.name)),
		reasons,
		unsupportedImports,
		rejected,
		scanned: names.length,
	};
}

async function run(name: string, source?: string): Promise<void> {
	const names = await catalog();
	if (!names.includes(name)) throw new Error(`Unknown r186 WebGL example: ${name}`);
	const result = extractModule(
		source ? `<script type="module">${source}</script>` : await sourceAt(`${name}.html`),
	);
	if (!result.source)
		throw new Error(`${name} is outside this research subset: ${result.reason}`);
	const browserDocument = globalThis.document as unknown as {
		getElementById: (id: string) => unknown;
		querySelector: (selector: string) => unknown;
	};
	const getElementById = browserDocument.getElementById.bind(browserDocument);
	const optionalElements = new Map<string, unknown>();
	const elementForId = (id: string) => {
		const shader = result.shaderScripts?.[id];
		if (shader !== undefined)
			return { textContent: shader, innerText: shader, innerHTML: shader };
		if (optionalPageIds.has(id)) {
			if (!optionalElements.has(id))
				optionalElements.set(id, {
					style: {},
					value: 0,
					innerHTML: '',
					addEventListener() {},
					removeEventListener() {},
					remove() {},
				});
			return optionalElements.get(id);
		}
		return getElementById(id);
	};
	browserDocument.getElementById = elementForId;
	const querySelector = browserDocument.querySelector.bind(browserDocument);
	browserDocument.querySelector = (selector) =>
		selector.startsWith('#') && result.shaderScripts?.[selector.slice(1)] !== undefined
			? elementForId(selector.slice(1))
			: querySelector(selector);
	const virtualUrl = new URL(`./virtual-${name}.ts`, import.meta.url).href;
	registerHooks({
		resolve(specifier, context, nextResolve) {
			if (specifier === `${virtualPrefix}${name}`)
				return { url: virtualUrl, shortCircuit: true };
			return nextResolve(specifier, context);
		},
		load(url, context, nextLoad) {
			if (url === virtualUrl) {
				return { format: 'module', source: result.source, shortCircuit: true };
			}
			return nextLoad(url, context);
		},
	});
	console.log(`Loading Three.js ${revision} ${name} from upstream HTML`);
	try {
		await import(`${virtualPrefix}${name}`);
	} catch (error) {
		console.error('Example module failed:', error);
		process.exit(1);
	}
}

function probe(name: string): ProbeResult {
	mkdirSync(fileURLToPath(new URL('./captures/', import.meta.url)), { recursive: true });
	const args = [
		'--import',
		new URL('./runtime-loader.ts', import.meta.url).href,
		fileURLToPath(import.meta.url),
		'run',
		name,
		`--capture=${fileURLToPath(new URL(`./captures/probe-${name}.png`, import.meta.url))}`,
		'--frames=12',
		'--no-click',
		'--probe',
	];
	const child = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 15000 });
	const ok = child.status === 0 && /framebuffer verified/u.test(child.stdout);
	if (ok) {
		console.log(`PASS ${name}`);
		return { ok: true };
	}
	const result = explainProbeOutput(
		`${child.stderr ?? ''}\n${child.stdout ?? ''}`,
		child.error?.message.includes('ETIMEDOUT') ?? false,
	);
	console.log(`FAIL ${name}: ${result.reason}`);
	return result;
}

async function inspect(name: string): Promise<{ source?: string; reason?: string }> {
	try {
		const result = extractModule(await sourceAt(`${name}.html`));
		return result.source
			? { source: result.source }
			: { reason: explainScreen(result.reason ?? 'unknown screen result') };
	} catch (error) {
		return { reason: `${explainScreen('source fetch failed')} ${String(error)}` };
	}
}

async function main(): Promise<void> {
	const [command = 'list', argument] = process.argv
		.slice(2)
		.filter((arg) => !arg.startsWith('--'));
	const limit = Number(
		process.argv.find((arg) => arg.startsWith('--limit='))?.slice(8) ?? '1000',
	);
	if (!Number.isSafeInteger(limit) || limit < 1)
		throw new Error('--limit must be a positive integer');
	if (command === 'run') {
		if (!argument) throw new Error('Usage: example-browser.ts run <example-id>');
		await run(argument);
		return;
	}
	if ((command === 'probe' || command === 'explain') && argument) {
		const names = await catalog();
		if (!names.includes(argument)) throw new Error(`Unknown r186 WebGL example: ${argument}`);
		console.log(presentationNotice);
		const screened = await inspect(argument);
		if (screened.reason) {
			console.log(`SCREENED OUT ${argument}: ${screened.reason}`);
			process.exitCode = 1;
			return;
		}
		console.log(`${argument}: static candidate; checking current-host framebuffer output.`);
		if (!probe(argument).ok) process.exitCode = 1;
		return;
	}
	if (command !== 'list' && command !== 'browse' && command !== 'probe' && command !== 'catalog')
		throw new Error(`Unknown command: ${command}`);
	const { found: examples, reasons, unsupportedImports, rejected, scanned } = await scan(limit);
	console.log(presentationNotice);
	console.log(
		`Three.js ${revision}: ${examples.length} static candidates in first ${scanned} WebGL entries`,
	);
	const entries = [
		...examples.map(({ name }) => ({ name, reason: undefined as string | undefined })),
		...rejected,
	].sort((a, b) => a.name.localeCompare(b.name));
	if (command === 'browse' || command === 'catalog') {
		entries.forEach(({ name, reason }, index) =>
			console.log(
				`${index + 1}. ${name} — ${reason ? `screened out: ${explainScreen(reason)}` : 'probe needed'}`,
			),
		);
	} else {
		examples.forEach(({ name }, index) => console.log(`${index + 1}. ${name}`));
	}
	console.log(
		'Excluded:',
		[...reasons.entries()]
			.sort((a, b) => b[1] - a[1])
			.map(([reason, count]) => `${count} ${reason}`)
			.join('; '),
	);
	console.log(
		'Top unsupported imports:',
		[...unsupportedImports.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, 8)
			.map(([specifier, count]) => `${count} ${specifier}`)
			.join('; '),
	);
	if (process.argv.includes('--rejections')) {
		for (const { name, reason } of rejected.sort((a, b) => a.name.localeCompare(b.name))) {
			console.log(`REJECT ${name}: ${reason}`);
		}
	}
	if (command === 'list' || command === 'catalog') return;
	if (command === 'probe') {
		const skipList = process.argv.find((arg) => arg.startsWith('--skip-list='))?.slice(12);
		const skipped = skipList
			? new Set(
					[
						...readFileSync(skipList, 'utf8').matchAll(/^\d+\. (webgl_[a-z0-9_]+)$/gmu),
					].map((match) => match[1]),
				)
			: new Set<string>();
		const targets = examples.filter(({ name }) => !skipped.has(name));
		let passed = 0;
		for (const example of targets) if (probe(example.name).ok) passed++;
		console.log(`${passed}/${targets.length} candidates passed isolated framebuffer probes`);
		if (passed !== targets.length) process.exitCode = 1;
		return;
	}
	const input = createInterface({ input: process.stdin, output: process.stdout });
	try {
		process.stdout.write('Example number or ID (Enter to quit): ');
		for await (const line of input) {
			const answer = line.trim();
			if (!answer) break;
			const choice = /^\d+$/u.test(answer)
				? entries[Number(answer) - 1]
				: entries.find((entry) => entry.name === answer);
			if (!choice) {
				console.log('Select a listed number or ID.');
				process.stdout.write('Example number or ID (Enter to quit): ');
				continue;
			}
			if (choice.reason) {
				console.log(`SCREENED OUT ${choice.name}: ${explainScreen(choice.reason)}`);
				process.stdout.write('Example number or ID (Enter to quit): ');
				continue;
			}
			if (!probe(choice.name).ok) {
				process.stdout.write('Example number or ID (Enter to quit): ');
				continue;
			}
			const args = [
				'--import',
				new URL('./runtime-loader.ts', import.meta.url).href,
				fileURLToPath(import.meta.url),
				'run',
				choice.name,
			];
			const previewFrames = process.argv.find((arg) => arg.startsWith('--frames='));
			if (previewFrames) {
				args.push(previewFrames);
				args.push(
					`--capture=${fileURLToPath(new URL(`./captures/browse-${choice.name}.png`, import.meta.url))}`,
				);
				args.push('--no-click');
			}
			const child = spawnSync(process.execPath, args, { stdio: 'inherit' });
			if (child.error) console.error(child.error);
			process.stdout.write('Example number or ID (Enter to quit): ');
		}
	} finally {
		input.close();
	}
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
