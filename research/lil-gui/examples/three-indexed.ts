// Direct scene port of three.js r186 examples/webgl_buffergeometry_indexed.html.
// The geometry, material, camera, light, animation, and GUI binding follow upstream.
import * as THREE from 'three';
import { init } from '@node-3d/core';
import { GUI } from '../gui.ts';
import { saveVerifiedCapture } from '../capture.ts';

const { doc } = init({
	major: 3,
	minor: 3,
	vsync: true,
	autoEsc: true,
	title: 'Node3D: Three.js indexed geometry',
});

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let mesh: THREE.Mesh;
let gui: GUI;
let material: THREE.MeshPhongMaterial;
let frames = 0;
const capture = process.argv
	.find((arg) => arg.startsWith('--capture='))
	?.slice('--capture='.length);

initExample();

function initExample(): void {
	camera = new THREE.PerspectiveCamera(27, window.innerWidth / window.innerHeight, 1, 3500);
	camera.position.z = 64;

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x050505);

	const light = new THREE.HemisphereLight();
	light.intensity = 3;
	scene.add(light);

	const geometry = new THREE.BufferGeometry();
	const indices: number[] = [];
	const vertices: number[] = [];
	const normals: number[] = [];
	const colors: number[] = [];
	const size = 20;
	const segments = 10;
	const halfSize = size / 2;
	const segmentSize = size / segments;
	const _color = new THREE.Color();

	for (let i = 0; i <= segments; i++) {
		const y = i * segmentSize - halfSize;
		for (let j = 0; j <= segments; j++) {
			const x = j * segmentSize - halfSize;
			vertices.push(x, -y, 0);
			normals.push(0, 0, 1);
			const r = x / size + 0.5;
			const g = y / size + 0.5;
			_color.setRGB(r, g, 1, THREE.SRGBColorSpace);
			colors.push(_color.r, _color.g, _color.b);
		}
	}

	for (let i = 0; i < segments; i++) {
		for (let j = 0; j < segments; j++) {
			const a = i * (segments + 1) + (j + 1);
			const b = i * (segments + 1) + j;
			const c = (i + 1) * (segments + 1) + j;
			const d = (i + 1) * (segments + 1) + (j + 1);
			indices.push(a, b, d);
			indices.push(b, c, d);
		}
	}

	geometry.setIndex(indices);
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
	geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

	material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, vertexColors: true });
	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	gui = new GUI();
	gui.add(material, 'wireframe');
	window.addEventListener('resize', onWindowResize);
}

function onWindowResize(): void {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(): void {
	const time = Date.now() * 0.001;
	mesh.rotation.x = time * 0.25;
	mesh.rotation.y = time * 0.5;
	renderer.render(scene, camera);
	if (capture && (frames === 5 || frames === 6)) {
		const down = frames === 5;
		for (const type of ['mousemove', down ? 'mousedown' : 'mouseup']) {
			doc.emit(type, {
				type,
				x: 32,
				y: 50,
				clientX: 32,
				clientY: 50,
				pageX: 32,
				pageY: 50,
				buttons: down ? 1 : 0,
				button: 0,
				which: 1,
				movementX: 0,
				movementY: 0,
				ctrlKey: false,
				shiftKey: false,
				altKey: false,
				metaKey: false,
			});
		}
	}
	gui.draw();
	renderer.resetState();
	if (capture && ++frames === 90) {
		const pixels = { data: Buffer.allocUnsafeSlow(doc.width * doc.height * 4) };
		const gl = doc.getContext('webgl');
		if (!gl || !('readPixels' in gl)) throw new Error('WebGL context missing');
		gl.readPixels(0, 0, doc.width, doc.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		saveVerifiedCapture(capture, doc.width, doc.height, pixels.data);
		if (!material.wireframe) throw new Error('Node3D event did not toggle Three.js wireframe');
		if (gui.panel.closed) throw new Error('GUI panel unexpectedly collapsed');
		console.log(
			`Captured ${capture} after ${frames} frames; wireframe and panel pixels verified`,
		);
		renderer.setAnimationLoop(null);
		gui.destroy();
		doc.destroy();
	}
}
