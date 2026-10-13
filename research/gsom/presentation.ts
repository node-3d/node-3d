import * as three from 'three';
import type { init as initQml } from '@node-3d/plugin-qml';
import type { GameState, JournalEntry, Player, Vec2 } from './model.ts';
import type { World } from './world.ts';

type QmlApi = ReturnType<typeof initQml>;
type SoundKind = 'shot' | 'hit' | 'hurt' | 'clear';

// Generated tones keep the prototype free of borrowed sound assets.
function toneBuffer(context: AudioContext, frequency: number, duration: number): AudioBuffer {
	const sampleRate = context.sampleRate;
	const samples = Math.ceil(sampleRate * duration);
	const buffer = context.createBuffer(1, samples, sampleRate);
	const channel = buffer.getChannelData(0);
	for (let i = 0; i < samples; i++) {
		const time = i / sampleRate;
		channel[i] = Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 24) * 0.25;
	}
	return buffer;
}

export function createPresentation(
	scene: three.Scene,
	camera: three.PerspectiveCamera,
	qml: QmlApi,
	world: World,
	listener: three.AudioListener | null,
) {
	const partnerModel = world.asset('characters', 'character-h');
	partnerModel.scale.setScalar(1);
	scene.add(partnerModel);
	const enemies = new Map<number, three.Group>();
	const projectiles = new Map<number, three.Mesh>();
	const projectileGeometry = new three.SphereGeometry(0.13, 8, 8);
	const overlay = new qml.QmlOverlay({ file: `${import.meta.dirname}/Hud.qml` });
	scene.add(overlay.mesh);
	const hud = {
		phase: new qml.Property<string>({ view: overlay, name: 'hud', key: 'phase' }),
		hp: new qml.Property<number>({ view: overlay, name: 'hud', key: 'hp' }),
		ammo: new qml.Property<number>({ view: overlay, name: 'hud', key: 'ammo' }),
		kills: new qml.Property<number>({ view: overlay, name: 'hud', key: 'kills' }),
		room: new qml.Property<number>({ view: overlay, name: 'hud', key: 'room' }),
		weapon: new qml.Property<string>({ view: overlay, name: 'hud', key: 'weapon' }),
		session: new qml.Property<string>({ view: overlay, name: 'hud', key: 'session' }),
	};
	const soundBuffers = new Map<SoundKind, AudioBuffer>();
	if (listener)
		for (const [kind, frequency, duration] of [
			['shot', 190, 0.16],
			['hit', 360, 0.12],
			['hurt', 80, 0.3],
			['clear', 620, 0.25],
		] as const)
			soundBuffers.set(kind, toneBuffer(listener.context, frequency, duration));
	let consumedEvents = 0;
	function sound(kind: SoundKind, position?: Vec2): void {
		const buffer = soundBuffers.get(kind);
		if (!listener || !buffer) return;
		const audio = position ? new three.PositionalAudio(listener) : new three.Audio(listener);
		audio.setBuffer(buffer);
		audio.setVolume(0.5);
		if (position) {
			audio.position.set(position.x, 1.3, position.z);
			scene.add(audio);
		} else camera.add(audio);
		audio.play();
		setTimeout(() => {
			audio.stop();
			audio.parent?.remove(audio);
		}, 500);
	}
	function syncActors(state: GameState, local: Player, other: Player | null): void {
		partnerModel.visible = Boolean(other);
		if (other) {
			partnerModel.position.set(other.position.x, 0.1, other.position.z);
			partnerModel.rotation.y = other.yaw + Math.PI;
		}
		const currentEnemies = new Set(state.enemies.map((enemy) => enemy.id));
		for (const enemy of state.enemies) {
			let group = enemies.get(enemy.id);
			if (!group) {
				group = new three.Group();
				const body = world.asset('characters', 'character-g');
				body.scale.setScalar(1);
				body.position.y = 0.1;
				group.add(body);
				scene.add(group);
				enemies.set(enemy.id, group);
			}
			group.position.set(enemy.position.x, 0, enemy.position.z);
			group.lookAt(local.position.x, 0, local.position.z);
		}
		for (const [id, group] of enemies)
			if (!currentEnemies.has(id)) {
				scene.remove(group);
				enemies.delete(id);
			}
		const currentProjectiles = new Set(state.projectiles.map((item) => item.id));
		for (const projectile of state.projectiles) {
			let mesh = projectiles.get(projectile.id);
			if (!mesh) {
				mesh = new three.Mesh(
					projectileGeometry,
					new three.MeshBasicMaterial({ color: 0xff7151 }),
				);
				scene.add(mesh);
				projectiles.set(projectile.id, mesh);
			}
			mesh.position.set(projectile.position.x, 1.4, projectile.position.z);
		}
		for (const [id, mesh] of projectiles)
			if (!currentProjectiles.has(id)) {
				scene.remove(mesh);
				projectiles.delete(id);
			}
	}
	return {
		readySounds: soundBuffers.size,
		skipEvents(count: number) {
			consumedEvents = count;
		},
		update(
			state: GameState,
			local: Player,
			other: Player | null,
			journal: readonly JournalEntry[],
			session: string,
		) {
			world.setExitOpen(state.phase === 'exit');
			world.setWeapon(local.weapon);
			syncActors(state, local, other);
			for (const { event } of journal.slice(consumedEvents)) {
				if (event.type === 'shot-fired') sound('shot');
				if (event.type === 'shot-hit') {
					const enemy = state.enemies.find((item) => item.id === event.enemy);
					if (enemy) sound('hit', enemy.position);
				}
				if (event.type === 'player-hurt') sound('hurt');
				if (event.type === 'upgrade-offered' || event.type === 'run-ended') sound('clear');
			}
			consumedEvents = journal.length;
			hud.phase.value = state.phase;
			hud.hp.value = local.health;
			hud.ammo.value = local.ammo;
			hud.kills.value = state.kills;
			hud.room.value = state.room;
			hud.weapon.value = local.weapon;
			hud.session.value = session;
		},
	};
}
