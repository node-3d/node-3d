/** Download official r186 WebGL pages for a repeatable source audit. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sourceBase = 'https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/';
const output = fileURLToPath(new URL('./captures/dom-audit/', import.meta.url));
const catalogResponse = await fetch(`${sourceBase}files.json`);
if (!catalogResponse.ok) throw new Error(`catalog: HTTP ${catalogResponse.status}`);
const catalog = (await catalogResponse.json()) as Record<string, string[]>;
const names = Object.entries(catalog)
	.filter(([category]) => category.startsWith('webgl') && category !== 'webgl / tsl')
	.flatMap(([, entries]) => entries)
	.filter((name) => /^webgl_[a-z0-9_]+$/u.test(name));
mkdirSync(output, { recursive: true });
let cursor = 0;
await Promise.all(
	Array.from({ length: 12 }, async () => {
		while (cursor < names.length) {
			const name = names[cursor++];
			const response = await fetch(`${sourceBase}${name}.html`);
			if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
			writeFileSync(`${output}/${name}.html`, await response.text());
		}
	}),
);
writeFileSync(`${output}/catalog.json`, JSON.stringify(names, null, 2));
console.log(`Downloaded ${names.length} r186 WebGL pages to ${output}`);
