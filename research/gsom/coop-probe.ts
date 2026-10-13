/** Local transport proof for a host-owned two-player model. */
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { init, runCallbacks, shutdown, sockets } from '@node-3d/gabenet';
import { Game, type Command, type GameState } from './model.ts';

type GuestInput = Extract<Command, { type: 'move' | 'fire' | 'select-weapon' }>;
type Packet =
	| { type: 'input'; command: GuestInput }
	| { type: 'snapshot'; state: GameState; eventSequence: number };
function parseGuestInput(value: unknown): GuestInput | null {
	if (!value || typeof value !== 'object') return null;
	const item = value as Record<string, unknown>;
	if (item.type === 'fire') return { type: 'fire' };
	if (item.type === 'select-weapon' && (item.weapon === 'sidearm' || item.weapon === 'carbine')) {
		return { type: 'select-weapon', weapon: item.weapon };
	}
	if (
		item.type === 'move' &&
		[item.x, item.z, item.yaw].every(
			(part) => typeof part === 'number' && Number.isFinite(part),
		)
	) {
		return { type: 'move', x: item.x as number, z: item.z as number, yaw: item.yaw as number };
	}
	return null;
}
const started = init();
if (!started.ok) throw new Error(started.errorMessage);
const pair = sockets.createSocketPair();
if (!pair) throw new Error('No local socket pair');
const [guest, host] = pair;
const game = new Game();
const trace: { tick: number; kind: string; value: unknown }[] = [];
let latest: GameState | null = null;
const send = (to: typeof guest, packet: Packet): void => {
	const result = sockets.sendMessageToConnection(to, Buffer.from(JSON.stringify(packet)));
	assert.ok(result.result >= 0, `Send failed: ${result.result}`);
};
const sleep = (milliseconds: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, milliseconds));
try {
	game.dispatch({ type: 'join' });
	game.dispatch({ type: 'start' });
	for (let tick = 0; tick < 40; tick++) {
		if (tick === 0)
			send(guest, {
				type: 'input',
				command: { type: 'move', playerId: 1, x: 0, z: -1, yaw: 0 },
			});
		if (tick === 15) send(guest, { type: 'input', command: { type: 'fire' } });
		for (let wait = 0; wait < 20; wait++) {
			runCallbacks();
			const messages = sockets.receiveMessagesOnConnection(host);
			if (messages.length) {
				for (const message of messages) {
					const packet = JSON.parse(message.data.toString()) as {
						type?: unknown;
						command?: unknown;
					};
					const command =
						packet.type === 'input' ? parseGuestInput(packet.command) : null;
					if (!command) continue;
					// The transport assigns identity; a guest cannot claim player 1.
					game.dispatch({ ...command, playerId: 2 });
					trace.push({ tick, kind: 'guest-input', value: command });
				}
				break;
			}
			await sleep(2);
		}
		game.step();
		if (tick % 5 === 0) {
			send(host, {
				type: 'snapshot',
				state: game.snapshot(),
				eventSequence: game.journal.length,
			});
			trace.push({
				tick,
				kind: 'host-snapshot',
				value: { room: game.state.room, partner: game.state.partner?.position },
			});
		}
		runCallbacks();
		for (const message of sockets.receiveMessagesOnConnection(guest)) {
			const packet = JSON.parse(message.data.toString()) as Packet;
			if (packet.type === 'snapshot') latest = packet.state;
		}
	}
	assert.ok(latest, 'Guest must receive a host snapshot');
	assert.ok(game.state.partner);
	assert.ok(game.state.partner.position.z < 5, 'Host should move the guest player');
	assert.equal(game.state.player.position.z, 5, 'Guest cannot move the host player');
	assert.ok(
		game.journal.some((entry) => entry.event.type === 'shot-fired' && entry.event.player === 2),
	);
	assert.equal(latest.room, 0);
	const output = fileURLToPath(new URL('./records/', import.meta.url));
	mkdirSync(output, { recursive: true });
	writeFileSync(
		`${output}/coop-local.json`,
		JSON.stringify({ trace, final: game.snapshot(), journal: game.journal }, null, 2),
	);
	console.log(
		`Co-op local transport: guest moved to z=${game.state.partner.position.z.toFixed(2)}, host events=${game.journal.length}, guest snapshot tick=${latest.tick}`,
	);
} finally {
	sockets.closeConnection(guest);
	sockets.closeConnection(host);
	shutdown();
}
