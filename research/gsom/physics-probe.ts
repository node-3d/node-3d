/** Focused Bullet runtime probe for room collision queries. */
import assert from 'node:assert/strict';
import { init as initBullet } from '@node-3d/plugin-bullet';

const { scene, Shape } = initBullet();
const floor = new Shape({
	sceneBullet: scene,
	type: 'box',
	size: [18, 0.4, 29],
	pos: [0, -0.2, -5.5],
	mass: 0,
});
const wall = new Shape({
	sceneBullet: scene,
	type: 'box',
	size: [18, 5, 0.4],
	pos: [0, 2.5, -20],
	mass: 0,
});
const crate = new Shape({
	sceneBullet: scene,
	type: 'box',
	size: [1.3, 1.8, 1.3],
	pos: [0, 0.9, -5],
	mass: 0,
});
try {
	scene.update(1 / 60);
	const floorHit = scene.hit([0, 2, 0], [0, -2, 0]);
	const wallHit = scene.hit([0, 1, -17], [0, 1, -22]);
	const crateHit = scene.hit([0, 1, 0], [0, 1, -10]);
	assert.equal(floorHit.body, floor);
	assert.equal(wallHit.body, wall);
	assert.equal(crateHit.body, crate);
	console.log('Bullet collision probe: floor, wall, and crate ray hits matched their bodies');
} finally {
	crate.destroy();
	wall.destroy();
	floor.destroy();
	scene.destroy();
}
