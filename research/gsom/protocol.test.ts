import assert from 'node:assert/strict';
import test from 'node:test';
import { Game } from './model.ts';
import { parseInputPacket, parseSnapshotPacket, receiveEvents } from './protocol.ts';

test('host input parsing removes claimed identity and rejects malformed movement', () => {
	assert.deepEqual(
		parseInputPacket({
			version: 1,
			type: 'input',
			command: {
				type: 'move',
				x: 1,
				z: 0,
				yaw: 0,
				playerId: 1,
			},
		}),
		{ version: 1, type: 'input', command: { type: 'move', x: 1, z: 0, yaw: 0 } },
	);
	assert.equal(
		parseInputPacket({
			version: 1,
			type: 'input',
			command: {
				type: 'move',
				x: Infinity,
				z: 0,
				yaw: 0,
			},
		}),
		null,
	);
});

test('guest accepts a complete snapshot and rejects fields used by presentation', () => {
	const game = new Game();
	game.dispatch({ type: 'start' });
	const packet = { version: 1, type: 'snapshot', state: game.snapshot(), events: game.journal };
	assert.ok(parseSnapshotPacket(packet));
	assert.equal(parseSnapshotPacket({ ...packet, state: { ...packet.state, partner: {} } }), null);
	assert.equal(
		parseSnapshotPacket({ ...packet, state: { ...packet.state, enemies: [{ id: 1 }] } }),
		null,
	);
	assert.equal(
		parseSnapshotPacket({ ...packet, events: [{ sequence: 0, tick: 0, event: null }] }),
		null,
	);
});

test('event delivery deduplicates and counts missing sequences', () => {
	const game = new Game();
	game.dispatch({ type: 'start' });
	game.dispatch({ type: 'fire' });
	const entries = game.journal;
	const result = receiveEvents([entries[1], entries[2], entries[1]], -1);
	assert.deepEqual(
		result.accepted.map((item) => item.sequence),
		[1, 2],
	);
	assert.equal(result.gaps, 1);
	assert.equal(receiveEvents(entries, result.lastSequence).accepted.length, 0);
});
