import { resolve } from 'node:path';
import * as three from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { init as initBullet } from '@node-3d/plugin-bullet';
import { solids } from './layout.ts';
import { STEP, type CollisionResolver, type Weapon } from './model.ts';

type Pack = 'space' | 'blaster' | 'characters';
export type World = {
	asset(pack: Pack, name: string): three.Group;
	resolveCollision: CollisionResolver;
	setExitOpen(open: boolean): void;
	setWeapon(weapon: Weapon): void;
	loadedModels: number;
};

export async function createWorld(
	scene: three.Scene,
	camera: three.PerspectiveCamera,
): Promise<World> {
	const material = (color: number): three.MeshStandardMaterial =>
		new three.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.18 });
	const makeBox = (
		size: readonly number[],
		position: readonly number[],
		color: number,
	): three.Mesh => {
		const mesh = new three.Mesh(
			new three.BoxGeometry(size[0], size[1], size[2]),
			material(color),
		);
		mesh.position.set(position[0], position[1], position[2]);
		scene.add(mesh);
		return mesh;
	};

	const viewLight = new three.PointLight(0xddefff, 3, 4);
	viewLight.position.set(0.25, 0, -0.2);
	camera.add(viewLight);
	scene.add(new three.HemisphereLight(0x9bbdd0, 0x1d2626, 2.5));
	const lamp = new three.PointLight(0xffaa66, 45, 24);
	lamp.position.set(0, 5, -8);
	scene.add(lamp);

	const crates: three.Mesh[] = [];
	for (const solid of solids) {
		const mesh = makeBox(solid.size, solid.position, solid.color);
		if (solid.basic !== undefined)
			mesh.material = new three.MeshBasicMaterial({ color: solid.basic });
		if (solid.kind === 'crate') crates.push(mesh);
	}
	for (const z of [2, -5, -12]) {
		const strip = makeBox([8, 0.04, 0.18], [0, 4.82, z], 0x80baca);
		strip.material = new three.MeshBasicMaterial({ color: 0x83c4d4 });
	}
	const exit = makeBox([2.7, 3.3, 0.12], [0, 1.5, -19.72], 0xa44739);
	const exitClosedMaterial = exit.material;
	const exitOpenMaterial = material(0x4bba8d);
	const { scene: physics, Shape } = initBullet();
	for (const solid of solids)
		new Shape({
			sceneBullet: physics,
			type: 'box',
			size: solid.size,
			pos: solid.position,
			mass: 0,
		});
	physics.update(STEP);
	const resolveCollision: CollisionResolver = (from, to, radius) => {
		const dx = to.x - from.x;
		const dz = to.z - from.z;
		const length = Math.hypot(dx, dz);
		if (length === 0) return to;
		const reach = (length + radius) / length;
		const hit = physics.hit([from.x, 1, from.z], [from.x + dx * reach, 1, from.z + dz * reach]);
		return hit.body ? from : to;
	};

	const assetRoot = resolve(import.meta.dirname, 'assets/kenney');
	const assetLoaders = Object.fromEntries(
		(['space', 'blaster', 'characters'] as const).map((pack) => {
			const manager = new three.LoadingManager();
			manager.setURLModifier((url) =>
				pack === 'characters' && /Textures\/texture-[gh]\.png$/.test(url)
					? resolve(assetRoot, pack, url.slice(url.lastIndexOf('/') + 1))
					: url.endsWith('Textures/colormap.png')
						? resolve(
								assetRoot,
								pack,
								pack === 'space' ? 'variation-a.png' : 'colormap.png',
							)
						: url,
			);
			return [pack, new GLTFLoader(manager)];
		}),
	) as Record<Pack, GLTFLoader>;
	const assetNames = [
		['space', 'template-wall'],
		['space', 'template-wall-top'],
		['space', 'gate'],
		['space', 'gate-door'],
		['space', 'cables'],
		['blaster', 'blaster-a'],
		['blaster', 'blaster-p'],
		['blaster', 'crate-medium'],
		['characters', 'character-g'],
		['characters', 'character-h'],
	] as const;
	const loadedAssets = await Promise.all(
		assetNames.map(
			async ([pack, name]) =>
				(await assetLoaders[pack].loadAsync(resolve(assetRoot, pack, `${name}.glb`))).scene,
		),
	);
	const asset = (pack: Pack, name: string): three.Group => {
		const index = assetNames.findIndex(([p, n]) => p === pack && n === name);
		const model = loadedAssets[index];
		if (!model) throw new Error(`Missing loaded asset ${pack}/${name}`);
		return model.clone();
	};

	for (const z of [-18, -14, -10, -6, -2, 2, 6]) {
		const seam = makeBox([17.4, 0.012, 0.045], [0, -0.035, z], 0x6d8492);
		seam.material = new three.MeshBasicMaterial({ color: 0x6d8492 });
		for (const side of [-1, 1]) {
			const wall = asset(
				'space',
				z === -10 || z === 2 ? 'template-wall-top' : 'template-wall',
			);
			wall.position.set(side * 8.8, 0, z);
			wall.rotation.y = side === 1 ? Math.PI / 2 : -Math.PI / 2;
			scene.add(wall);
		}
	}
	for (const x of [-8, -4, 4, 8]) {
		const wall = asset('space', 'template-wall');
		wall.position.set(x, 0, -19.65);
		wall.rotation.y = Math.PI;
		scene.add(wall);
	}
	const closedGate = asset('space', 'gate-door');
	const openGate = asset('space', 'gate');
	closedGate.position.set(0, 0, -19.45);
	openGate.position.copy(closedGate.position);
	scene.add(closedGate, openGate);
	for (const z of [-14, -6, 2])
		for (const x of [-5.5, 5.5]) {
			const cables = asset('space', 'cables');
			cables.position.set(x, 4.72, z);
			cables.scale.setScalar(0.85);
			scene.add(cables);
		}
	for (const mesh of crates) {
		mesh.visible = false;
		for (let layer = 0; layer < 2; layer++) {
			const crate = asset('blaster', 'crate-medium');
			crate.position.set(mesh.position.x, layer * 0.8, mesh.position.z);
			crate.rotation.y = (layer + mesh.position.x) * 0.2;
			crate.scale.setScalar(1.5);
			scene.add(crate);
		}
	}
	const sidearmModel = asset('blaster', 'blaster-a');
	const carbineModel = asset('blaster', 'blaster-p');
	for (const model of [sidearmModel, carbineModel]) {
		model.position.set(0.32, -0.32, -0.72);
		model.rotation.set(-0.12, Math.PI - 0.2, -0.08);
		model.scale.setScalar(0.82);
		camera.add(model);
	}
	return {
		asset,
		resolveCollision,
		loadedModels: loadedAssets.length,
		setExitOpen(open) {
			exit.material = open ? exitOpenMaterial : exitClosedMaterial;
			closedGate.visible = !open;
			openGate.visible = open;
		},
		setWeapon(weapon) {
			sidearmModel.visible = weapon === 'sidearm';
			carbineModel.visible = weapon !== 'sidearm';
		},
	};
}
