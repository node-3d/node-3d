/** Research-only scripted play and framebuffer capture. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { gl, Image } from '@node-3d/core';
import { STEP, type Command, type Game, type GameState } from './model.ts';
import type { CoopNetwork } from './network.ts';

export type CapturePhase = GameState['phase'];
const phases: readonly string[] = ['menu', 'combat', 'upgrade', 'exit', 'won', 'lost'];

function clearRoom(game: Game): void {
	while (game.state.phase === 'combat') {
		const enemy = game.state.enemies[0];
		if (!enemy) throw new Error('No enemy in active combat');
		const player = game.state.player.position;
		const yaw = Math.atan2(-(enemy.position.x - player.x), -(enemy.position.z - player.z));
		game.dispatch({ type: 'move', x: 0, z: 0, yaw });
		game.dispatch({ type: 'fire' });
		for (let tick = 0; tick < Math.ceil(0.26 / STEP); tick++) game.step();
	}
}

export class CaptureDriver {
	private frames = 0;
	private saved = false;
	private lastAutoFireTick = -100;
	readonly path: string | null;
	readonly phase: string;
	readonly autoCoop: boolean;
	constructor(path: string | null, phase: string, autoCoop: boolean) {
		this.path = path;
		this.phase = phase;
		this.autoCoop = autoCoop;
		if (path && !phases.includes(phase)) throw new Error(`Unknown capture phase: ${phase}`);
	}

	prepareSolo(game: Game, keys: Set<string>): number {
		if (!this.path) return 0;
		if (this.phase !== 'menu') game.dispatch({ type: 'start' });
		if (this.phase === 'combat') keys.add('KeyW');
		if (this.phase === 'upgrade' || this.phase === 'exit' || this.phase === 'won')
			clearRoom(game);
		if (this.phase === 'exit' || this.phase === 'won')
			game.dispatch({ type: 'choose-upgrade', choice: 'damage' });
		if (this.phase === 'won') {
			game.dispatch({ type: 'enter-exit' });
			clearRoom(game);
			game.dispatch({ type: 'choose-upgrade', choice: 'health' });
			game.dispatch({ type: 'enter-exit' });
		}
		if (this.phase === 'lost') while (game.state.phase === 'combat') game.step();
		return game.journal.length;
	}

	startHost(game: Game, network: CoopNetwork | null): void {
		if (
			this.autoCoop &&
			network?.role === 'host' &&
			network.metrics.connected &&
			game.state.phase === 'menu'
		)
			game.dispatch({ type: 'start' });
	}

	guestStep(
		network: CoopNetwork | null,
		keys: Set<string>,
		setYaw: (yaw: number) => void,
		dispatch: (command: Command) => void,
	): void {
		if (!this.autoCoop || network?.role !== 'guest' || !network.state?.partner) return;
		const { state } = network;
		const player = state.partner;
		if (!player) return;
		const target = state.enemies[0];
		if (target)
			setYaw(
				Math.atan2(
					-(target.position.x - player.position.x),
					-(target.position.z - player.position.z),
				),
			);
		keys[state.tick < 80 ? 'add' : 'delete']('KeyW');
		if (state.tick >= this.lastAutoFireTick + 20 && state.phase === 'combat') {
			dispatch({ type: 'fire' });
			this.lastAutoFireTick = state.tick;
		}
	}

	stepHost(game: Game, network: CoopNetwork | null): void {
		if (!this.autoCoop || network?.metrics.connected || game.state.run > 0) {
			game.step();
			if (this.autoCoop && game.state.tick > 200) {
				if (game.state.phase === 'upgrade')
					game.dispatch({ type: 'choose-upgrade', choice: 'damage' });
				if (game.state.phase === 'exit') game.dispatch({ type: 'enter-exit' });
			}
		}
	}

	beforeRender(game: Game): void {
		if (this.path && this.phase === 'combat' && this.frames === 10)
			game.dispatch({ type: 'fire' });
	}

	afterRender(args: {
		game: Game;
		network: CoopNetwork | null;
		isGuest: boolean;
		state: GameState;
		width: number;
		height: number;
		readySounds: number;
		loadedModels: number;
	}): boolean {
		this.frames++;
		if (!this.path) return false;
		if (!this.saved && (this.autoCoop ? args.state.tick >= 95 : this.frames >= 45)) {
			this.save(args);
			this.saved = true;
			if (!this.autoCoop) return true;
		}
		if (this.autoCoop && args.state.tick >= (args.isGuest ? 220 : 280)) {
			if (!args.isGuest) {
				const jsonPath = this.path.replace(/\.png$/i, '.json');
				const summary = JSON.parse(readFileSync(jsonPath, 'utf8'));
				summary.network = args.network?.metrics;
				summary.finalState = args.game.snapshot();
				summary.finalCommands = args.game.commands;
				summary.finalEvents = args.game.journal;
				writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
			}
			return true;
		}
		return false;
	}

	private save({
		game,
		network,
		isGuest,
		state,
		width,
		height,
		readySounds,
		loadedModels,
	}: {
		game: Game;
		network: CoopNetwork | null;
		isGuest: boolean;
		state: GameState;
		width: number;
		height: number;
		readySounds: number;
		loadedModels: number;
	}): void {
		const path = this.path;
		if (!path) return;
		mkdirSync(dirname(path), { recursive: true });
		const pixels = { data: Buffer.alloc(width * height * 4) };
		gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		const colors = new Set<string>();
		for (let index = 0; index < pixels.data.length; index += 997 * 4)
			colors.add(pixels.data.subarray(index, index + 3).toString('hex'));
		if (colors.size < 12) throw new Error(`Capture looks blank: ${colors.size} sampled colors`);
		Image.fromPixels(width, height, 32, pixels.data).save(path);
		writeFileSync(
			path.replace(/\.png$/i, '.json'),
			JSON.stringify(
				{
					role: network?.role ?? 'solo',
					phase: state.phase,
					tick: state.tick,
					player: state.player,
					partner: state.partner,
					kills: state.kills,
					enemies: state.enemies.length,
					events: isGuest ? network?.events : game.journal,
					commands: isGuest ? undefined : game.commands,
					network: network?.metrics,
					readySounds,
					loadedModels,
					sampledColors: colors.size,
				},
				null,
				2,
			),
		);
		console.log(`Captured ${path}; phase=${state.phase}; sampledColors=${colors.size}`);
	}
}
