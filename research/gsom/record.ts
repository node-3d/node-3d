import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Game, replay, STEP } from './model.ts';

const game = new Game();
const checkpoints: unknown[] = [];
game.dispatch({ type: 'start' });
checkpoints.push(game.snapshot());
for (let room = 0; room < 2; room++) {
	while (game.state.phase === 'combat') {
		const enemy = game.state.enemies[0];
		assert.ok(enemy);
		const p = game.state.player.position;
		game.dispatch({
			type: 'move',
			x: 0,
			z: 0,
			yaw: Math.atan2(-(enemy.position.x - p.x), -(enemy.position.z - p.z)),
		});
		game.dispatch({ type: 'fire' });
		for (let tick = 0; tick < Math.ceil(0.26 / STEP); tick++) game.step();
	}
	checkpoints.push(game.snapshot());
	game.dispatch({ type: 'choose-upgrade', choice: room === 0 ? 'damage' : 'health' });
	game.dispatch({ type: 'enter-exit' });
}
assert.equal(game.state.phase, 'won');
assert.deepEqual(replay(game.commands, game.state.tick).snapshot(), game.snapshot());
const output = fileURLToPath(new URL('./records/', import.meta.url));
mkdirSync(output, { recursive: true });
function saveRecord(name: string, run: Game, states: unknown[]): void {
	const final = run.snapshot();
	const finalHash = createHash('sha256').update(JSON.stringify(final)).digest('hex');
	writeFileSync(
		`${output}/${name}.demo.json`,
		JSON.stringify(
			{
				format: 'gsom-demo-v1',
				tickRate: 60,
				ticks: run.state.tick,
				commands: run.commands,
				final,
				finalHash,
			},
			null,
			2,
		),
	);
	writeFileSync(
		`${output}/${name}.events.jsonl`,
		run.journal.map((entry) => JSON.stringify(entry)).join('\n') + '\n',
	);
	writeFileSync(`${output}/${name}.checkpoints.json`, JSON.stringify(states, null, 2));
	console.log(
		`${name}: ${run.state.kills} kills, ${run.state.tick} ticks, ${run.journal.length} events, hash ${finalHash.slice(0, 12)}`,
	);
}
saveRecord('victory', game, checkpoints);
const loss = new Game();
loss.dispatch({ type: 'start' });
const lossStates: unknown[] = [loss.snapshot()];
while (loss.state.phase === 'combat') {
	loss.step();
	if (loss.state.tick % 120 === 0) lossStates.push(loss.snapshot());
}
assert.equal(loss.state.phase, 'lost');
assert.deepEqual(replay(loss.commands, loss.state.tick).snapshot(), loss.snapshot());
lossStates.push(loss.snapshot());
saveRecord('loss', loss, lossStates);
