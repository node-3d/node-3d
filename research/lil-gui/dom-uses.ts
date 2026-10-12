/** Summarize browser/DOM references in downloaded r186 page scripts. */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('./captures/dom-audit/', import.meta.url));
const names = JSON.parse(readFileSync(`${base}/catalog.json`, 'utf8')) as string[];
const reports = names.map((name) => {
	const html = readFileSync(`${base}/${name}.html`, 'utf8');
	const source = /<script\b[^>]*\btype\s*=\s*['"]module['"][^>]*>([\s\S]*?)<\/script>/iu.exec(
		html,
	)?.[1];
	if (source === undefined) throw new Error(`${name}: inline module script missing`);
	const lines = source.split(/\r?\n/u);
	const uses = lines
		.map((line, index) => ({ line: index + 1, text: line.trim() }))
		.filter(({ text }) =>
			/\bdocument\b|\bwindow\b|\.domElement\b|\.dom\b|\.innerHTML\b|\.textContent\b|\.innerText\b|\.classList\b|\.style\b|\bHTMLElement\b|\bFileReader\b|\bcreateImageBitmap\b|\.getContext\s*\(/u.test(
				text,
			),
		)
		.filter(({ text }) => !text.startsWith('//') && !text.startsWith('*'));
	return {
		name,
		htmlTags: [...html.matchAll(/<(canvas|input|button|video|audio|iframe)\b/giu)].map(
			(match) => match[1].toLowerCase(),
		),
		uses,
	};
});
writeFileSync(`${base}/uses.json`, JSON.stringify(reports, null, 2));
writeFileSync(
	`${base}/uses.txt`,
	reports
		.map((report) =>
			[
				`${report.name}${report.htmlTags.length ? ` tags:${report.htmlTags.join(',')}` : ''}`,
				...report.uses.map(({ line, text }) => `  ${line}: ${text}`),
			].join('\n'),
		)
		.join('\n\n'),
);
console.log(`Analyzed ${reports.length} pages; see ${base}/uses.txt`);
