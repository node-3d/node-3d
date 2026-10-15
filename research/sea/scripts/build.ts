import { execFileSync } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRsbuild } from '@rsbuild/core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const app = path.join(dist, 'app');
const temp = path.join(root, '.tmp');
const binary = path.join(dist, process.platform === 'win32' ? 'Node3D-SEA.exe' : 'Node3D-SEA');
const npmCli = process.env.npm_execpath;

if (!npmCli) {
	throw new Error('Run this build through npm run build.');
}

if (Number(process.versions.node.split('.')[0]) !== 24) {
	throw new Error('Build this experiment with Node.js 24 so its SEA and uv-loop binaries match.');
}

await rm(dist, { recursive: true, force: true });
await rm(temp, { recursive: true, force: true });
await mkdir(app, { recursive: true });
await mkdir(temp, { recursive: true });

const rsbuild = await createRsbuild({
	cwd: root,
	config: {
		source: { entry: { main: './src/main.ts' } },
		output: {
			target: 'node',
			module: true,
			autoExternal: true,
			minify: true,
			cleanDistPath: false,
			distPath: { root: app, js: './' },
			filename: { js: '[name].js' },
		},
	},
});
await rsbuild.build();
const entrySource = await readFile(path.join(root, 'src', 'entry.ts'), 'utf8');
await writeFile(path.join(app, 'entry.cjs'), stripTypeScriptTypes(entrySource));
const seaMain = path.join(temp, 'sea-main.cjs');
const seaSource = await readFile(path.join(root, 'src', 'sea-main.ts'), 'utf8');
await writeFile(seaMain, stripTypeScriptTypes(seaSource));

const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as Record<string, unknown>;
delete manifest.devDependencies;
delete manifest.scripts;
await writeFile(path.join(app, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await copyFile(path.join(root, 'package-lock.json'), path.join(app, 'package-lock.json'));
execFileSync(process.execPath, [npmCli, 'ci', '--omit=dev'], { cwd: app, stdio: 'inherit' });

const seaConfig = path.join(temp, 'sea-config.json');
const seaBlob = path.join(temp, 'sea-prep.blob');
await writeFile(seaConfig, JSON.stringify({ main: seaMain, output: seaBlob, useCodeCache: false }));
execFileSync(process.execPath, ['--experimental-sea-config', seaConfig], { stdio: 'inherit' });
await copyFile(process.execPath, binary);

if (process.platform === 'darwin') {
	execFileSync('codesign', ['--remove-signature', binary], { stdio: 'inherit' });
}

const args = [binary, 'NODE_SEA_BLOB', seaBlob,
	'--sentinel-fuse', 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2'];
if (process.platform === 'darwin') {
	args.push('--macho-segment-name', 'NODE_SEA');
}
execFileSync(process.execPath, [npmCli, 'exec', '--', 'postject', ...args], { cwd: root, stdio: 'inherit' });

if (process.platform === 'darwin') {
	execFileSync('codesign', ['--sign', '-', binary], { stdio: 'inherit' });
}

console.log(`Built ${binary}`);
