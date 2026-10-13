/** Deterministic game rules. This module has no renderer, audio, or native imports. */
import { bounds, playerSpawns, roomSpawns, type Vec2 } from './layout.ts';
export type { Vec2 } from './layout.ts';
export const STEP = 1 / 60;
export type Phase = 'menu' | 'combat' | 'upgrade' | 'exit' | 'won' | 'lost';
export type Weapon = 'sidearm' | 'carbine';
export type Player = {
	id: number;
	position: Vec2;
	yaw: number;
	health: number;
	maxHealth: number;
	weapon: Weapon;
	ammo: number;
	damageBonus: number;
	moveSpeed: number;
	shots: number;
};
export type Enemy = { id: number; position: Vec2; health: number; cooldown: number };
export type Projectile = {
	id: number;
	position: Vec2;
	velocity: Vec2;
	lifetime: number;
	damage: number;
};
export type GameState = {
	tick: number;
	phase: Phase;
	run: number;
	room: number;
	player: Player;
	partner: Player | null;
	enemies: Enemy[];
	projectiles: Projectile[];
	kills: number;
};
export type Command =
	| { type: 'start' }
	| { type: 'join' }
	| { type: 'leave' }
	| { type: 'move'; x: number; z: number; yaw: number; playerId?: number }
	| { type: 'fire'; playerId?: number }
	| { type: 'select-weapon'; weapon: Weapon; playerId?: number }
	| { type: 'choose-upgrade'; choice: 'health' | 'damage' | 'speed' }
	| { type: 'enter-exit' }
	| { type: 'restart' };
export type GameEvent =
	| { type: 'command-rejected'; command: Command['type']; reason: string }
	| { type: 'run-started'; run: number }
	| { type: 'player-joined'; player: number }
	| { type: 'player-left'; player: number }
	| { type: 'room-started'; room: number; enemies: number }
	| { type: 'shot-fired'; player: number; weapon: Weapon; ammo: number }
	| { type: 'shot-hit'; player: number; enemy: number; damage: number }
	| { type: 'enemy-killed'; enemy: number }
	| { type: 'enemy-fired'; enemy: number }
	| { type: 'player-hurt'; player: number; damage: number; health: number }
	| { type: 'upgrade-offered' }
	| { type: 'upgrade-chosen'; choice: 'health' | 'damage' | 'speed' }
	| { type: 'exit-opened' }
	| { type: 'run-ended'; result: 'won' | 'lost'; kills: number };
export type JournalEntry = { sequence: number; tick: number; event: GameEvent };
export type RecordedCommand = { tick: number; command: Command };
export type CollisionResolver = (from: Vec2, to: Vec2, radius: number) => Vec2;

const startPlayer = (id = 1): Player => ({
	id,
	position: { ...playerSpawns[id === 1 ? 0 : 1] },
	yaw: 0,
	health: 100,
	maxHealth: 100,
	weapon: 'sidearm',
	ammo: 18,
	damageBonus: 0,
	moveSpeed: 5,
	shots: 0,
});
const finite = (value: number): boolean => Number.isFinite(value);
const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.z - b.z);

export class Game {
	private readonly resolveCollision: CollisionResolver | undefined;
	constructor(resolveCollision?: CollisionResolver) {
		this.resolveCollision = resolveCollision;
	}
	readonly state: GameState = {
		tick: 0,
		phase: 'menu',
		run: 0,
		room: 0,
		player: startPlayer(),
		partner: null,
		enemies: [],
		projectiles: [],
		kills: 0,
	};
	readonly journal: JournalEntry[] = [];
	readonly commands: RecordedCommand[] = [];
	private nextId = 2;
	private movement = new Map<number, Vec2>([[1, { x: 0, z: 0 }]]);
	private fireCooldown = new Map<number, number>();
	private actor(id = 1): Player | null {
		return id === 1 ? this.state.player : id === 2 ? this.state.partner : null;
	}
	private players(): Player[] {
		return this.state.partner ? [this.state.player, this.state.partner] : [this.state.player];
	}

	private emit(event: GameEvent): void {
		this.journal.push({ sequence: this.journal.length, tick: this.state.tick, event });
	}

	private reject(command: Command, reason: string): void {
		this.emit({ type: 'command-rejected', command: command.type, reason });
	}

	private spawnRoom(room: number): void {
		const positions = roomSpawns[room];
		if (!positions) throw new Error(`Unknown room ${room}`);
		this.state.room = room;
		this.state.phase = 'combat';
		this.state.player.position = { ...playerSpawns[0] };
		if (this.state.partner) this.state.partner.position = { ...playerSpawns[1] };
		this.state.enemies = positions.map((position) => ({
			id: this.nextId++,
			position: { ...position },
			health: (room === 0 ? 60 : 80) + (this.state.partner ? 20 : 0),
			cooldown: 1.5,
		}));
		this.state.projectiles = [];
		this.emit({ type: 'room-started', room, enemies: positions.length });
	}

	private start(): void {
		this.state.run++;
		this.state.room = 0;
		this.state.kills = 0;
		this.state.player = startPlayer();
		if (this.state.partner) this.state.partner = startPlayer(2);
		this.movement = new Map([
			[1, { x: 0, z: 0 }],
			[2, { x: 0, z: 0 }],
		]);
		this.fireCooldown.clear();
		this.emit({ type: 'run-started', run: this.state.run });
		this.spawnRoom(0);
	}

	dispatch(command: Command): void {
		this.commands.push({ tick: this.state.tick, command: structuredClone(command) });
		const s = this.state;
		switch (command.type) {
			case 'join':
				if (s.partner) {
					this.reject(command, 'Join is unavailable');
					return;
				}
				s.partner = startPlayer(2);
				if (s.phase !== 'menu') {
					s.partner.position = {
						x: Math.min(8, s.player.position.x + 2),
						z: s.player.position.z,
					};
				}
				this.movement.set(2, { x: 0, z: 0 });
				this.emit({ type: 'player-joined', player: 2 });
				return;
			case 'leave':
				if (!s.partner) {
					this.reject(command, 'No partner is present');
					return;
				}
				s.partner = null;
				this.movement.delete(2);
				this.fireCooldown.delete(2);
				this.emit({ type: 'player-left', player: 2 });
				return;
			case 'start':
			case 'restart':
				if (s.phase !== 'menu' && s.phase !== 'won' && s.phase !== 'lost') {
					this.reject(command, 'A run is active');
					return;
				}
				this.start();
				return;
			case 'move': {
				if (s.phase !== 'combat' && s.phase !== 'exit') {
					this.reject(command, 'Movement is unavailable');
					return;
				}
				if (![command.x, command.z, command.yaw].every(finite)) {
					this.reject(command, 'Nonfinite movement');
					return;
				}
				const actor = this.actor(command.playerId);
				if (!actor || actor.health === 0) {
					this.reject(command, 'Player is unavailable');
					return;
				}
				const magnitude = Math.hypot(command.x, command.z);
				this.movement.set(
					actor.id,
					magnitude > 1
						? { x: command.x / magnitude, z: command.z / magnitude }
						: { x: command.x, z: command.z },
				);
				actor.yaw = command.yaw;
				return;
			}
			case 'select-weapon': {
				if (s.phase !== 'combat' && s.phase !== 'exit') {
					this.reject(command, 'Weapon selection is unavailable');
					return;
				}
				if (command.weapon !== 'sidearm' && command.weapon !== 'carbine') {
					this.reject(command, 'Unknown weapon');
					return;
				}
				const actor = this.actor(command.playerId);
				if (!actor || actor.health === 0) {
					this.reject(command, 'Player is unavailable');
					return;
				}
				actor.weapon = command.weapon;
				return;
			}
			case 'fire': {
				if (s.phase !== 'combat') {
					this.reject(command, 'Combat is inactive');
					return;
				}
				const actor = this.actor(command.playerId);
				if (!actor || actor.health === 0) {
					this.reject(command, 'Player is unavailable');
					return;
				}
				if ((this.fireCooldown.get(actor.id) ?? 0) > 0) {
					this.reject(command, 'Weapon cooling down');
					return;
				}
				if (actor.weapon === 'carbine' && actor.ammo <= 0) {
					this.reject(command, 'Out of ammo');
					return;
				}
				this.fireCooldown.set(actor.id, actor.weapon === 'sidearm' ? 0.25 : 0.12);
				actor.shots++;
				if (actor.weapon === 'carbine') actor.ammo--;
				this.emit({
					type: 'shot-fired',
					player: actor.id,
					weapon: actor.weapon,
					ammo: actor.ammo,
				});
				this.resolveShot(actor);
				return;
			}
			case 'choose-upgrade':
				if (s.phase !== 'upgrade') {
					this.reject(command, 'No upgrade is offered');
					return;
				}
				if (!['health', 'damage', 'speed'].includes(command.choice)) {
					this.reject(command, 'Unknown upgrade');
					return;
				}
				for (const player of this.players()) {
					if (command.choice === 'health') {
						player.maxHealth += 25;
						player.health = Math.min(player.maxHealth, player.health + 40);
					}
					if (command.choice === 'damage') player.damageBonus += 15;
					if (command.choice === 'speed') player.moveSpeed += 1;
				}
				this.emit({ type: 'upgrade-chosen', choice: command.choice });
				s.phase = 'exit';
				this.emit({ type: 'exit-opened' });
				return;
			case 'enter-exit':
				if (s.phase !== 'exit') {
					this.reject(command, 'Exit is closed');
					return;
				}
				if (s.room + 1 < roomSpawns.length) this.spawnRoom(s.room + 1);
				else {
					s.phase = 'won';
					this.emit({ type: 'run-ended', result: 'won', kills: s.kills });
				}
				return;
		}
	}

	private resolveShot(player: Player): void {
		const forward = { x: -Math.sin(player.yaw), z: -Math.cos(player.yaw) };
		const target = this.state.enemies
			.map((enemy) => {
				const dx = enemy.position.x - player.position.x;
				const dz = enemy.position.z - player.position.z;
				return {
					enemy,
					along: dx * forward.x + dz * forward.z,
					across: Math.abs(dx * forward.z - dz * forward.x),
				};
			})
			.filter(({ along, across }) => along > 0 && along < 40 && across < 0.75)
			.sort((a, b) => a.along - b.along)[0]?.enemy;
		if (!target) return;
		const damage = (player.weapon === 'sidearm' ? 34 : 22) + player.damageBonus;
		target.health -= damage;
		this.emit({ type: 'shot-hit', player: player.id, enemy: target.id, damage });
		if (target.health > 0) return;
		this.state.enemies = this.state.enemies.filter((enemy) => enemy.id !== target.id);
		this.state.kills++;
		this.emit({ type: 'enemy-killed', enemy: target.id });
		if (this.state.enemies.length === 0) {
			this.state.phase = 'upgrade';
			this.state.projectiles = [];
			this.emit({ type: 'upgrade-offered' });
		}
	}

	step(): void {
		const s = this.state;
		s.tick++;
		for (const [id, cooldown] of this.fireCooldown)
			this.fireCooldown.set(id, Math.max(0, cooldown - STEP));
		if (s.phase !== 'combat' && s.phase !== 'exit') return;
		for (const player of this.players()) {
			if (player.health === 0) continue;
			const movement = this.movement.get(player.id) ?? { x: 0, z: 0 };
			const next = {
				x: Math.max(
					bounds.minX,
					Math.min(bounds.maxX, player.position.x + movement.x * player.moveSpeed * STEP),
				),
				z: Math.max(
					bounds.minZ,
					Math.min(bounds.maxZ, player.position.z + movement.z * player.moveSpeed * STEP),
				),
			};
			const resolved = this.resolveCollision?.(player.position, next, 0.4) ?? next;
			if (!finite(resolved.x) || !finite(resolved.z))
				throw new Error('Collision resolver returned a nonfinite position');
			player.position = { ...resolved };
		}
		if (s.phase !== 'combat') return;
		for (const enemy of s.enemies) {
			const target = this.players()
				.filter((player) => player.health > 0)
				.sort(
					(a, b) =>
						distance(a.position, enemy.position) - distance(b.position, enemy.position),
				)[0];
			if (!target) break;
			const dx = target.position.x - enemy.position.x;
			const dz = target.position.z - enemy.position.z;
			const range = Math.hypot(dx, dz);
			if (range > 4) {
				enemy.position.x += (dx / range) * STEP * 0.6;
				enemy.position.z += (dz / range) * STEP * 0.6;
			}
			enemy.cooldown -= STEP;
			if (enemy.cooldown > 0 || range < 0.01) continue;
			enemy.cooldown = 1.7 + (enemy.id % 3) * 0.3;
			s.projectiles.push({
				id: this.nextId++,
				position: { ...enemy.position },
				velocity: { x: (dx / range) * 7, z: (dz / range) * 7 },
				lifetime: 5,
				damage: 12,
			});
			this.emit({ type: 'enemy-fired', enemy: enemy.id });
		}
		for (const projectile of s.projectiles) {
			projectile.position.x += projectile.velocity.x * STEP;
			projectile.position.z += projectile.velocity.z * STEP;
			projectile.lifetime -= STEP;
			const target = this.players().find(
				(player) =>
					player.health > 0 && distance(projectile.position, player.position) < 0.65,
			);
			if (target) {
				projectile.lifetime = 0;
				target.health = Math.max(0, target.health - projectile.damage);
				this.emit({
					type: 'player-hurt',
					player: target.id,
					damage: projectile.damage,
					health: target.health,
				});
			}
		}
		s.projectiles = s.projectiles.filter((projectile) => projectile.lifetime > 0);
		if (this.players().every((player) => player.health === 0)) {
			s.phase = 'lost';
			this.emit({ type: 'run-ended', result: 'lost', kills: s.kills });
		}
	}

	snapshot(): GameState {
		return structuredClone(this.state);
	}
}

export function replay(commands: readonly RecordedCommand[], ticks: number): Game {
	const game = new Game();
	let commandIndex = 0;
	for (let tick = 0; tick <= ticks; tick++) {
		while (commands[commandIndex]?.tick === tick) {
			game.dispatch(commands[commandIndex].command);
			commandIndex++;
		}
		if (tick < ticks) game.step();
	}
	if (commandIndex !== commands.length)
		throw new Error('Commands are unsorted or outside the recording');
	return game;
}
