// GUI block adapted from three.js r186 examples/webgl_lights_hemisphere.html.
// Geometry and animation are reduced to keep this Node3D compatibility run self-contained.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Screen, init } from '@node-3d/core';
import { GUI } from '../gui.ts';

const { doc, loop } = init({
	major: 3,
	minor: 3,
	vsync: true,
	title: 'Node3D: Three.js hemisphere GUI adaptation',
	autoEsc: true,
});
const scene = new THREE.Scene();
scene.background = new THREE.Color('#14263d');
const camera = new THREE.PerspectiveCamera(50, doc.width / doc.height, 0.1, 100);
camera.position.set(5, 3, 8);
camera.lookAt(0, 0.5, 0);
const screen = new Screen({ doc, scene, camera });
screen.renderer.shadowMap.enabled = true;
Object.assign(doc, { ownerDocument: doc });
const controls = new OrbitControls(camera, doc as unknown as HTMLElement);
controls.enableDamping = true;

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x304050, 2);
scene.add(hemiLight);
const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 0.4);
scene.add(hemiLightHelper);
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(4, 7, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(1024, 1024);
scene.add(dirLight);
const dirLightHelper = new THREE.DirectionalLightHelper(dirLight, 0.5);
scene.add(dirLightHelper);

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(20, 20),
	new THREE.MeshStandardMaterial({ color: '#40566d' }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const sphere = new THREE.Mesh(
	new THREE.SphereGeometry(1, 32, 20),
	new THREE.MeshStandardMaterial({ color: '#e7a44a' }),
);
sphere.position.y = 1.1;
sphere.castShadow = true;
scene.add(sphere);

const params = {
	toggleHemisphereLight: function () {
		hemiLight.visible = !hemiLight.visible;
		hemiLightHelper.visible = !hemiLightHelper.visible;
	},
	toggleDirectionalLight: function () {
		dirLight.visible = !dirLight.visible;
		dirLightHelper.visible = !dirLightHelper.visible;
	},
	shadowIntensity: 1,
};
const gui = new GUI(doc);
gui.add(params, 'toggleHemisphereLight').name('toggle hemisphere light');
gui.add(params, 'toggleDirectionalLight').name('toggle directional light');
gui.add(params, 'shadowIntensity', 0, 1)
	.name('shadow intensity')
	.onChange((value) => {
		dirLight.shadow.intensity = value as number;
	});
gui.open();

const capture = process.argv
	.find((arg) => arg.startsWith('--capture='))
	?.slice('--capture='.length);
let frames = 0;
const stop = loop(() => {
	sphere.rotation.y += 0.01;
	controls.update();
	screen.draw();
	gui.draw();
	controls.enabled = !gui.wantsCaptureMouse;
	screen.renderer.resetState();
	if (capture && ++frames === 90) {
		screen.snapshot(capture);
		console.log(`Captured ${capture} after ${frames} frames`);
		stop();
		controls.dispose();
		gui.destroy();
		doc.destroy();
	}
});
