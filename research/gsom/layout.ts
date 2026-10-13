/** Engine-independent geometry and encounter data for the single corridor. */
export type Vec2 = { x: number; z: number };
export type Solid = {
	kind: 'floor' | 'wall' | 'crate';
	size: [number, number, number];
	position: [number, number, number];
	color: number;
	basic?: number;
};

export const bounds = { minX: -8, maxX: 8, minZ: -19, maxZ: 8 } as const;
export const playerSpawns = [
	{ x: 0, z: 5 },
	{ x: 2, z: 5 },
] as const;
export const roomSpawns: readonly (readonly Vec2[])[] = [
	[
		{ x: -3, z: -10 },
		{ x: 3, z: -13 },
	],
	[
		{ x: -4, z: -10 },
		{ x: 3, z: -12 },
		{ x: 0, z: -17 },
	],
];

export const solids: readonly Solid[] = [
	{
		kind: 'floor',
		size: [18, 0.3, 29],
		position: [0, -0.2, -5.5],
		color: 0x72909a,
		basic: 0x4d6670,
	},
	{
		kind: 'wall',
		size: [0.35, 5, 29],
		position: [-9, 2.4, -5.5],
		color: 0x6a8790,
		basic: 0x526d79,
	},
	{
		kind: 'wall',
		size: [0.35, 5, 29],
		position: [9, 2.4, -5.5],
		color: 0x6a8790,
		basic: 0x526d79,
	},
	{ kind: 'wall', size: [18, 5, 0.4], position: [0, 2.4, -20], color: 0x748e92, basic: 0x607982 },
	{
		kind: 'wall',
		size: [18, 0.25, 29],
		position: [0, 5, -5.5],
		color: 0x344b55,
		basic: 0x2c424c,
	},
	...[-5, 5].flatMap((x): Solid[] =>
		[0, -9, -16].map((z) => ({
			kind: 'crate',
			size: [1.3, 1.8, 1.3],
			position: [x, 0.9, z],
			color: 0x746f62,
		})),
	),
];
