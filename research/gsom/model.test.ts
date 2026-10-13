import assert from 'node:assert/strict';
import test from 'node:test';
import { Game, replay, STEP } from './model.ts';

function aimAt(game: Game, enemyId: number): void {
	const enemy = game.state.enemies.find((item) => item.id === enemyId);
	assert.ok(enemy);
	const player = game.state.player.position;
	const yaw = Math.atan2(-(enemy.position.x - player.x), -(enemy.position.z - player.z));
	game.dispatch({ type: 'move', x: 0, z: 0, yaw });
}

function clearRoom(game: Game): void {
	let attempts = 0;
	while (game.state.phase === 'combat') {
		assert.ok(attempts++ < 100, 'Combat should finish');
		const enemy = game.state.enemies[0];
		assert.ok(enemy);
		aimAt(game, enemy.id);
		game.dispatch({ type: 'fire' });
		for (let tick = 0; tick < Math.ceil(0.26 / STEP); tick++) game.step();
	}
}

test('complete run, typed events, rejected commands, and deterministic replay', () => {
	const game = new Game();
	game.dispatch({ type: 'fire' });
	assert.equal(game.journal.at(-1)?.event.type, 'command-rejected');
	game.dispatch({ type: 'start' });
	clearRoom(game);
	assert.equal(game.state.phase, 'upgrade');
	game.dispatch({ type: 'enter-exit' });
	assert.equal(game.journal.at(-1)?.event.type, 'command-rejected');
	game.dispatch({ type: 'choose-upgrade', choice: 'damage' });
	game.dispatch({ type: 'enter-exit' });
	clearRoom(game);
	game.dispatch({ type: 'choose-upgrade', choice: 'health' });
	game.dispatch({ type: 'enter-exit' });
	assert.equal(game.state.phase, 'won');
	assert.equal(game.state.kills, 5);
	assert.deepEqual(replay(game.commands, game.state.tick).snapshot(), game.snapshot());
	assert.deepEqual(replay(game.commands, game.state.tick).journal, game.journal);
	assert.deepEqual(
		game.journal.map((entry) => entry.sequence),
		game.journal.map((_, index) => index),
	);
});

test('enemy projectiles can end a run and restart resets state', () => {
	const game = new Game();
	game.dispatch({ type: 'start' });
	for (let tick = 0; tick < 60 * 90 && game.state.phase === 'combat'; tick++) game.step();
	assert.equal(game.state.phase, 'lost');
	assert.equal(game.state.player.health, 0);
	assert.ok(game.journal.some((entry) => entry.event.type === 'player-hurt'));
	game.dispatch({ type: 'restart' });
	assert.equal(game.state.phase, 'combat');
	assert.equal(game.state.player.health, 100);
	assert.equal(game.state.run, 2);
});

test('invalid movement cannot corrupt the model', () => {
	const game = new Game();
	game.dispatch({ type: 'start' });
	const before = game.snapshot();
	game.dispatch({ type: 'move', x: Number.NaN, z: 0, yaw: 0 });
	assert.deepEqual(game.snapshot(), before);
	assert.equal(game.journal.at(-1)?.event.type, 'command-rejected');
});

test('two subjects have independent input, damage, and shared room progression', () => {
	const game = new Game();
	game.dispatch({ type: 'join' });
	game.dispatch({ type: 'start' });
	assert.equal(game.state.partner?.id, 2);
	const before = game.state.partner.position.z;
	game.dispatch({ type: 'move', playerId: 2, x: 0, z: -1, yaw: 0 });
	for (let tick = 0; tick < 60; tick++) game.step();
	assert.ok(game.state.partner.position.z < before);
	assert.equal(game.state.player.position.z, 5);
	game.dispatch({ type: 'fire', playerId: 2 });
	assert.equal(game.journal.at(-1)?.event.type, 'shot-fired');
	assert.deepEqual(replay(game.commands, game.state.tick).snapshot(), game.snapshot());
});

test('the collision adapter can constrain movement without importing physics into the model', () => {
	const game = new Game((from, to) => (to.z < 4.5 ? from : to));
	game.dispatch({ type: 'start' });
	game.dispatch({ type: 'move', x: 0, z: -1, yaw: 0 });
	for (let tick = 0; tick < 60; tick++) game.step();
	assert.ok(game.state.player.position.z >= 4.5);
});

test('a guest can join an active run and leave without stopping the host', () => {
	const game = new Game();
	game.dispatch({ type: 'start' });
	game.dispatch({ type: 'join' });
	assert.equal(game.state.partner?.id, 2);
	assert.equal(game.state.phase, 'combat');
	game.dispatch({ type: 'leave' });
	assert.equal(game.state.partner, null);
	assert.equal(game.state.phase, 'combat');
	assert.deepEqual(replay(game.commands, game.state.tick).snapshot(), game.snapshot());
});
