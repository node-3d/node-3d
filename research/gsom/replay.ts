import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { replay, type GameState, type RecordedCommand } from './model.ts';

const path = resolve(process.argv[2] ?? 'research/gsom/records/victory.demo.json');
const record = JSON.parse(readFileSync(path, 'utf8')) as {
	format: string;
	tickRate: number;
	ticks: number;
	commands: RecordedCommand[];
	final: GameState;
	finalHash: string;
};
assert.equal(record.format, 'gsom-demo-v1');
assert.equal(record.tickRate, 60);
const game = replay(record.commands, record.ticks);
assert.deepEqual(game.snapshot(), record.final);
const hash = createHash('sha256').update(JSON.stringify(game.snapshot())).digest('hex');
assert.equal(hash, record.finalHash);
console.log(
	`Replay verified: ${game.state.phase}, ${game.state.kills} kills, ${game.state.tick} ticks, hash ${hash.slice(0, 12)}`,
);
