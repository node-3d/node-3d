/** Pure wire-format checks; no socket or renderer dependencies. */
import type { Command, GameState, JournalEntry, Player, Vec2 } from './model.ts';

export type GuestInput = Extract<Command, { type: 'move' | 'fire' | 'select-weapon' }>;
export type InputPacket = { version: 1; type: 'input'; command: GuestInput };
export type StatePacket = {
	version: 1;
	type: 'snapshot';
	state: GameState;
	events: JournalEntry[];
};

const record = (value: unknown): Record<string, unknown> | null =>
	value !== null && typeof value === 'object' && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: null;
const finite = (value: unknown): value is number =>
	typeof value === 'number' && Number.isFinite(value);
const integer = (value: unknown): value is number => Number.isSafeInteger(value) && finite(value);
const vector = (value: unknown): value is Vec2 => {
	const item = record(value);
	return Boolean(item && finite(item.x) && finite(item.z));
};
const player = (value: unknown): value is Player => {
	const item = record(value);
	return Boolean(
		item &&
		integer(item.id) &&
		vector(item.position) &&
		finite(item.yaw) &&
		finite(item.health) &&
		finite(item.maxHealth) &&
		(item.weapon === 'sidearm' || item.weapon === 'carbine') &&
		finite(item.ammo) &&
		finite(item.damageBonus) &&
		finite(item.moveSpeed) &&
		finite(item.shots),
	);
};
const enemy = (value: unknown): boolean => {
	const item = record(value);
	return Boolean(
		item &&
		integer(item.id) &&
		vector(item.position) &&
		finite(item.health) &&
		finite(item.cooldown),
	);
};
const projectile = (value: unknown): boolean => {
	const item = record(value);
	return Boolean(
		item &&
		integer(item.id) &&
		vector(item.position) &&
		vector(item.velocity) &&
		finite(item.lifetime) &&
		finite(item.damage),
	);
};
const phases = ['menu', 'combat', 'upgrade', 'exit', 'won', 'lost'];
const eventTypes = [
	'command-rejected',
	'run-started',
	'player-joined',
	'player-left',
	'room-started',
	'shot-fired',
	'shot-hit',
	'enemy-killed',
	'enemy-fired',
	'player-hurt',
	'upgrade-offered',
	'upgrade-chosen',
	'exit-opened',
	'run-ended',
];

export function parseGuestInput(value: unknown): GuestInput | null {
	const item = record(value);
	if (!item) return null;
	if (item.type === 'fire') return { type: 'fire' };
	if (item.type === 'select-weapon' && (item.weapon === 'sidearm' || item.weapon === 'carbine'))
		return { type: 'select-weapon', weapon: item.weapon };
	if (item.type === 'move' && finite(item.x) && finite(item.z) && finite(item.yaw))
		return { type: 'move', x: item.x, z: item.z, yaw: item.yaw };
	return null;
}

export function parseInputPacket(value: unknown): InputPacket | null {
	const packet = record(value);
	if (!packet || packet.version !== 1 || packet.type !== 'input') return null;
	const command = parseGuestInput(packet.command);
	return command ? { version: 1, type: 'input', command } : null;
}

export function parseSnapshotPacket(value: unknown): StatePacket | null {
	const packet = record(value);
	if (!packet || packet.version !== 1 || packet.type !== 'snapshot') return null;
	const state = record(packet.state);
	if (
		!state ||
		!integer(state.tick) ||
		typeof state.phase !== 'string' ||
		!phases.includes(state.phase) ||
		!integer(state.run) ||
		!integer(state.room) ||
		!integer(state.kills) ||
		!player(state.player) ||
		(state.partner !== null && !player(state.partner)) ||
		!Array.isArray(state.enemies) ||
		!state.enemies.every(enemy) ||
		!Array.isArray(state.projectiles) ||
		!state.projectiles.every(projectile) ||
		!Array.isArray(packet.events)
	)
		return null;
	for (const value of packet.events) {
		const entry = record(value);
		const event = entry && record(entry.event);
		if (
			!entry ||
			!integer(entry.sequence) ||
			!integer(entry.tick) ||
			!event ||
			typeof event.type !== 'string' ||
			!eventTypes.includes(event.type) ||
			(event.type === 'shot-hit' && !integer(event.enemy))
		)
			return null;
	}
	return packet as StatePacket;
}

export function receiveEvents(
	events: readonly JournalEntry[],
	lastSequence: number,
): {
	accepted: JournalEntry[];
	lastSequence: number;
	gaps: number;
} {
	const accepted: JournalEntry[] = [];
	let gaps = 0;
	for (const entry of [...events].sort((a, b) => a.sequence - b.sequence)) {
		if (entry.sequence <= lastSequence) continue;
		if (entry.sequence > lastSequence + 1) gaps += entry.sequence - lastSequence - 1;
		accepted.push(entry);
		lastSequence = entry.sequence;
	}
	return { accepted, lastSequence, gaps };
}
