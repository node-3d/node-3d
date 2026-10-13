/** Launch two rendered GSOM processes and inspect their network telemetry. */
import assert from 'node:assert/strict';
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(import.meta.dirname, 'captures/coop');
mkdirSync(output, { recursive: true });
const port = 40_000 + Math.floor(Math.random() * 10_000);
const hostPath = resolve(output, 'host.png');
const guestPath = resolve(output, 'guest.png');
function launch(args: string[]): {
	child: ChildProcessWithoutNullStreams;
	lines: string[];
	done: Promise<number>;
} {
	const child = spawn(process.execPath, ['research/gsom/demo.ts', '--auto-coop', ...args], {
		cwd: root,
		env: process.env,
		stdio: 'pipe',
	});
	const lines: string[] = [];
	child.stdout.on('data', (data: Buffer) => lines.push(data.toString()));
	child.stderr.on('data', (data: Buffer) => lines.push(data.toString()));
	const done = new Promise<number>((res, rej) => {
		child.once('error', rej);
		child.once('exit', (code) => res(code ?? -1));
	});
	return { child, lines, done };
}
const sleep = (ms: number): Promise<void> => new Promise((res) => setTimeout(res, ms));
const host = launch([`--coop-host=${port}`, `--capture=${hostPath}`]);
let guest: ReturnType<typeof launch> | null = null;
let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
try {
	for (let i = 0; i < 200 && !host.lines.join('').includes('COOP_READY'); i++) await sleep(50);
	assert.match(host.lines.join(''), /COOP_READY/, `Host did not start: ${host.lines.join('')}`);
	guest = launch([`--coop-join=127.0.0.1:${port}`, `--capture=${guestPath}`]);
	const timeout = new Promise<never>((_, reject) => {
		timeoutHandle = setTimeout(
			() =>
				reject(
					new Error(
						`Co-op processes timed out. Host: ${host.lines.join('')} Guest: ${guest?.lines.join('')}`,
					),
				),
			30_000,
		);
	});
	const [guestCode, hostCode] = await Promise.race([
		Promise.all([guest.done, host.done]),
		timeout,
	]);
	assert.equal(guestCode, 0, `Guest failed: ${guest.lines.join('')}`);
	assert.equal(hostCode, 0, `Host failed: ${host.lines.join('')}`);
	const hostResult = JSON.parse(readFileSync(hostPath.replace('.png', '.json'), 'utf8'));
	const guestResult = JSON.parse(readFileSync(guestPath.replace('.png', '.json'), 'utf8'));
	assert.equal(hostResult.role, 'host');
	assert.equal(guestResult.role, 'guest');
	assert.equal(hostResult.loadedModels, 10, 'host loaded selected Kenney models');
	assert.equal(guestResult.loadedModels, 10, 'guest loaded selected Kenney models');
	assert.equal(hostResult.readySounds, 4, 'host created all WebAudio tones');
	assert.equal(guestResult.readySounds, 4, 'guest created all WebAudio tones');
	assert.ok(hostResult.network.joins >= 1, 'host saw guest join');
	assert.ok(hostResult.network.leaves >= 1, 'host saw guest leave');
	assert.ok(hostResult.network.inputsReceived >= 10, 'host received guest inputs');
	assert.ok(guestResult.network.snapshotsReceived >= 10, 'guest received snapshots');
	assert.ok(hostResult.partner, 'host rendered joined partner');
	assert.ok(guestResult.partner, 'guest rendered local partner');
	assert.ok(hostResult.partner.position.z < 5, 'guest moved in host state');
	assert.equal(hostResult.player.position.z, 5, 'guest did not move host');
	assert.ok(
		hostResult.finalEvents.some(
			(entry: { event: { type: string; player?: number } }) =>
				entry.event.type === 'shot-fired' && entry.event.player === 2,
		),
		'guest fired on host',
	);
	assert.ok(
		hostResult.finalEvents.some(
			(entry: { event: { type: string; player?: number } }) =>
				entry.event.type === 'player-left' && entry.event.player === 2,
		),
		'guest departure recorded',
	);
	assert.ok(
		hostResult.finalEvents.some(
			(entry: { event: { type: string; room?: number } }) =>
				entry.event.type === 'room-started' && entry.event.room === 1,
		),
		'host advanced to second room',
	);
	assert.ok(
		hostResult.sampledColors >= 12 && guestResult.sampledColors >= 12,
		'both renders have detail',
	);
	writeFileSync(
		resolve(output, 'validation.json'),
		JSON.stringify({ port, host: hostResult, guest: guestResult }, null, 2),
	);
	writeFileSync(resolve(output, 'host.log'), host.lines.join(''));
	writeFileSync(resolve(output, 'guest.log'), guest.lines.join(''));
	console.log(
		`Co-op validated: ${hostResult.network.inputsReceived} guest inputs, ${guestResult.network.snapshotsReceived} snapshots, guest z=${hostResult.partner.position.z.toFixed(2)}, host unchanged, departure recorded`,
	);
} finally {
	clearTimeout(timeoutHandle);
	host.child.kill();
	guest?.child.kill();
}
