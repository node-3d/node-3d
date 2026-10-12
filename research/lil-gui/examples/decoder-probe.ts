// Exercise the unmodified Three.js Draco and KTX2 loader addons in Node3D.
import '../runtime-loader.ts';
import { gl } from '@node-3d/core';
import {
	Color,
	Mesh,
	MeshBasicMaterial,
	OrthographicCamera,
	PlaneGeometry,
	Scene,
	WebGLRenderer,
} from 'three';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';

const renderer = new WebGLRenderer({
	canvas: document as unknown as HTMLCanvasElement,
	context: gl as unknown as WebGLRenderingContext,
});
const ktx2 = new KTX2Loader().detectSupport(renderer);
const base = 'https://raw.githubusercontent.com/mrdoob/three.js/r186/examples/';
const texture = await ktx2.loadAsync(`${base}textures/ktx2/2d_etc1s.ktx2`);
if (!texture.image || texture.image.width < 1 || texture.image.height < 1) {
	throw new Error('KTX2 transcode returned no image');
}
console.log(`KTX2 decoded ${texture.image.width}×${texture.image.height}`);
const uastc = await ktx2.loadAsync(`${base}textures/ktx2/2d_uastc.ktx2`);
if (!uastc.image || uastc.image.width < 1) throw new Error('UASTC transcode returned no image');
console.log(`KTX2 UASTC decoded ${uastc.image.width}×${uastc.image.height}`);
const scene = new Scene();
scene.background = new Color(0);
scene.add(new Mesh(new PlaneGeometry(2, 2), new MeshBasicMaterial({ map: texture })));
const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
camera.position.z = 2;
renderer.render(scene, camera);
const pixels = { data: Buffer.alloc(4 * 64 * 64) };
const surface = document as unknown as { width: number; height: number };
gl.readPixels(
	Math.floor(surface.width / 2) - 32,
	Math.floor(surface.height / 2) - 32,
	64,
	64,
	gl.RGBA,
	gl.UNSIGNED_BYTE,
	pixels,
);
const colors = new Set<number>();
for (let i = 0; i < pixels.data.length; i += 4) {
	colors.add((pixels.data[i] << 16) | (pixels.data[i + 1] << 8) | pixels.data[i + 2]);
}
if (colors.size < 2) throw new Error('KTX2 texture produced a uniform framebuffer');
console.log('KTX2 texture rendered into the framebuffer');
ktx2.dispose();

const draco = new DRACOLoader();
const geometry = await draco.loadAsync(`${base}models/draco/bunny.drc`);
if (!geometry.getAttribute('position')?.count) throw new Error('Draco returned no vertices');
console.log(`Draco decoded ${geometry.getAttribute('position').count} vertices`);
draco.dispose();
process.exit(0);
