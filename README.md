# Node3D

[![NPM](https://badge.fury.io/js/3d-core-raub.svg)](https://badge.fury.io/js/3d-core-raub)
[![ESLint](https://github.com/node-3d/3d-core-raub/actions/workflows/eslint.yml/badge.svg)](https://github.com/node-3d/3d-core-raub/actions/workflows/eslint.yml)
[![Test](https://github.com/node-3d/3d-core-raub/actions/workflows/test.yml/badge.svg)](https://github.com/node-3d/3d-core-raub/actions/workflows/test.yml)

```console
npm i -s 3d-core-raub
```

![Node3D](https://github.com/node-3d/node-3d/raw/master/logo/front/logo.png)


## Desktop 3D applications with **Node.js** and **OpenGL**.

* **WebGL**-like interface. Real OpenGL though.
* **Three.js** compatible environment.
* Use node modules and compiled addons: CUDA, OpenCL, etc.
* Window control. Multiwindow applications.
* Read/write files.
* Crossplatform: Linux x64, Linux ARM, MacOS x64, Windows x64.

![Example](https://github.com/node-3d/3d-core-raub/raw/4.1.0/examples/screenshot.png)

Compatibility with **three.js** allows porting the existing JS code.
The real OpenGL backend is used (not ANGLE). So it is possible to use the GL resource IDs
to setup interoperation with CUDA or OpenCL. This is the most important feature of this
project and why it was created in the first place.

It is quite possible to create a fully-features apps and games using this framework.
For example, see
[Space Simulation Toolkit](https://store.steampowered.com/app/1196080/Space_Simulation_Toolkit/).


## Quick start

1. Setup the project directory:
	
	```console
	mkdir my-project
	cd my-project
	npm init -y
	npm i -s 3d-core-raub three
	touch index.js
	```
1. Paste the code and see if it works:
	
	```javascript
	// Init Node3D environment
	const three = require('three');
	const { init, addThreeHelpers } = require('3d-core-raub');
	const { doc, gl, requestAnimationFrame } = init({ isGles3: true, isWebGL2: true, vsync: false });
	addThreeHelpers(three, gl);
	
	// Three.js rendering setup
	const renderer = new three.WebGLRenderer();
	const scene = new three.Scene();
	const camera = new three.PerspectiveCamera(70, doc.w / doc.h, 0.2, 500);
	camera.position.z = 35;
	scene.background = new three.Color(0x333333);
	
	// Add scene lights
	scene.add(new three.AmbientLight(0xc1c1c1, 0.5));
	const sun = new three.DirectionalLight(0xffffff, 2);
	sun.position.set(-1, 0.5, 1);
	scene.add(sun);
	
	// Original knot mesh
	const knotGeometry = new three.TorusKnotGeometry(10, 1.85, 256, 20, 2, 7);
	const knotMaterial = new three.MeshToonMaterial({ color: 0x6cc24a });
	const knotMesh = new three.Mesh(knotGeometry, knotMaterial);
	scene.add(knotMesh);
	
	// A slightly larger knot mesh, inside-out black - for outline
	const outlineGeometry = new three.TorusKnotGeometry(10, 2, 256, 20, 2, 7);
	const outlineMaterial = new three.MeshBasicMaterial({ color: 0, side: three.BackSide });;
	const outlineMesh = new three.Mesh(outlineGeometry, outlineMaterial);
	knotMesh.add(outlineMesh);
	
	// Handle window resizing
	doc.addEventListener('resize', () => {
		camera.aspect = doc.w / doc.h;
		camera.updateProjectionMatrix();
		renderer.setSize(doc.w, doc.h);
	});
	
	// Called repeatedly to render new frames
	const animate = () => {
		requestAnimationFrame(animate);
		const time = Date.now();
		knotMesh.rotation.x = time * 0.0005;
		knotMesh.rotation.y = time * 0.001;
		renderer.render(scene, camera);
	};
	
	animate();
	```

1. See docs and examples: [3d-core-raub](https://github.com/raub/node-3d-core).

1. Take a look at Three.js [examples](https://threejs.org/examples/).


## Node3D Modules

1. **Core** - key components to run WebGL code on Node.js.
	* [3d-core-raub](https://github.com/node-3d/3d-core-raub) -
	3D Core, this is just enough for Node3D to work.
	* [addon-tools-raub](https://github.com/node-3d/addon-tools-raub) -
	helpers for Node.js addons.
	* [glfw-raub](https://github.com/node-3d/glfw-raub) -
	native window control, can mimic web Document/Window/Canvas.
	* [image-raub](https://github.com/node-3d/image-raub) -
	image loading, can mimic web
	[Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image).
	* [segfault-raub](https://github.com/node-3d/segfault-raub) -
	catches and logs the C++ crash messages: segmentation fault, etc.
	* [webgl-raub](https://github.com/node-3d/webgl-raub) -
	a [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
	implementation.

1. **Dependency** - carries one or more precompiled binary and/or C++ headers.
	* [deps-bullet-raub](https://github.com/node-3d/deps-bullet-raub) -
	[Bullet Physics](https://pybullet.org/wordpress/) binaries and headers.
	* [deps-freeimage-raub](https://github.com/node-3d/deps-freeimage-raub) -
	[FreeImage](http://freeimage.sourceforge.net/) binaries and headers.
	* [deps-labsound-raub](https://github.com/node-3d/deps-labsound-raub) -
	[LabSound](https://github.com/LabSound/LabSound) binaries and headers.
	* [deps-opengl-raub](https://github.com/node-3d/deps-opengl-raub) -
	[OpenGL](https://www.opengl.org/), [GLFW](https://www.glfw.org/),
	[GLEW](http://glew.sourceforge.net/) binaries and headers.
	* [deps-qmlui-raub](https://github.com/node-3d/deps-qmlui-raub) -
	QmlUi binaries and headers.
	* [deps-qt-core-raub](https://github.com/node-3d/deps-qt-core-raub) -
	Qt binaries for console apps.
	* [deps-qt-gui-raub](https://github.com/node-3d/deps-qt-gui-raub) -
	Qt binaries for GUI apps.
	* [deps-qt-qml-raub](https://github.com/node-3d/deps-qt-qml-raub) -
	Qt binaries for QML apps.
	* [deps-uiohook-raub](https://github.com/node-3d/deps-uiohook-raub) -
	binaries and headers to use [libuiohook](https://github.com/kwhat/libuiohook) with NPM.

1. **Addon** - provides native bindings.
	* [bullet-raub](https://github.com/node-3d/bullet-raub) -
	rigid-body subset of Bullet Physics.
	* [cuda-raub](https://github.com/node-3d/cuda-raub) -
	addon for running NVidia CUDA programs on GPU.
	* [opencl-raub](https://github.com/node-3d/opencl-raub) -
	addon for running OpenCL programs on GPU.
	* [qml-raub](https://github.com/node-3d/qml-raub) -
	Node3D-QML interoperation.
	* [webaudio-raub](https://github.com/node-3d/webaudio-raub) -
	a [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
	implementation.

1. **Plugin** - a high-level **Node3D** module designed to seamlessly use the addons
together with 3d-core. A plugin uses 3d-core context and primitives to provide additional
features that combine **Node3D** envitonment and whatever addon(s) the plugin wraps.

For example:
	
	```typescript
	import { dirname } from 'node:path';
	import { fileURLToPath } from 'node:url';
	import * as three from 'three';
	import { init, addThreeHelpers } from '3d-core-raub';
	import { init as initQml } from '3d-qml-raub';

	const __dirname = dirname(fileURLToPath(import.meta.url));
	const {
		doc, Image: Img, gl,
	} = init({ isGles3: true, isWebGL2: true });
	addThreeHelpers(three, gl);
	const { QmlOverlay, loop } = initQml({ doc, gl, cwd: __dirname, three });
	
	// ...
	const overlay = new QmlOverlay({ file: `${__dirname}/qml/gui.qml` });
	scene.add(overlay.mesh);
	```
	
	* [3d-bullet-raub](https://github.com/node-3d/3d-bullet-raub) -
	extends 3D Core with Bullet Physics.
	* [3d-qml-raub](https://github.com/node-3d/3d-qml-raub) -
	extends 3D Core with QML graphics.
	* [3d-webaudio-raub](https://github.com/node-3d/3d-webaudio-raub) -
	extends 3D Core with an audio interface.
	```


## Contributing to Node3D

Bugs and enhancements are tracked as
[GitHub issues](https://github.com/node-3d/node-3d/issues).
You can also create an issue on a specific repository of
[Node3D]((https://github.com/node-3d)).


### Issues

* Use a clear and descriptive title.
* Describe the desired enhancement / problem.
* Provide examples to demonstrate the issue.
* If the problem involves a crash, provide its trace log.


### Pull Requests

* Do not include issue numbers in the PR title.
* Commits use the present tense ("Add feature" not "Added feature").
* Commits use the imperative mood ("Move cursor to..." not "Moves cursor to...").
* File System
	* Only lowercase in file/directory names.
	* Words are separated with dashes.
	* If there is an empty directory to be kept, place an empty **.keep** file inside.


## License

**Node3D can be used commercially. You don't have to pay for Node3D or
any of its third-party libraries.**

**Node3D** modules have their own code licensed under **MIT**, meaning
"I've just put it here, do what you want, have fun". Some
modules have **separately licensed third-party software** in them. For instance,
`deps-freeimage-raub` carries the **FreeImage**
binaries and headers, and those are the property of their respective owners,
and are licensed under **FIPL** terms (but free to use anyway).

All such cases are explained in `README.md` per project in question.
