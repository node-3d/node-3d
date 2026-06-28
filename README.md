# Node3D

[![NPM](https://badge.fury.io/js/%40node-3d%2Fcore.svg)](https://badge.fury.io/js/@node-3d/core)
[![ESLint](https://github.com/node-3d/core/actions/workflows/eslint.yml/badge.svg)](https://github.com/node-3d/core/actions/workflows/eslint.yml)
[![Test](https://github.com/node-3d/core/actions/workflows/test.yml/badge.svg)](https://github.com/node-3d/core/actions/workflows/test.yml)

```console
npm i -s @node-3d/core
```

![Node3D](https://github.com/node-3d/node-3d/raw/master/logo/front/logo.png)


## Desktop 3D applications with **Node.js** and **OpenGL**.

* **WebGL**-like interface. Real OpenGL though.
* **Three.js** compatible environment.
* Use node modules and compiled addons: CUDA, OpenCL, etc.
* Window control. Multiwindow applications.
* Read/write files.
* Crossplatform: Linux x64, Linux ARM, MacOS x64, Windows x64.

![Example](https://github.com/node-3d/core/raw/4.1.0/examples/screenshot.png)

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
	npm i -s @node-3d/core three
	touch index.js
	```

1. Paste the code and see if it works:

	```javascript
	// Init Node3D environment
	const three = require('three');
	const { init, addThreeHelpers } = require('@node-3d/core');
	const { doc, gl, requestAnimationFrame } = init({ isGles3: true, isWebGL2: true, vsync: false });
	addThreeHelpers(three);
	
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

1. See docs and examples: [@node-3d/core](https://github.com/raub/node-3d-core).

1. Take a look at Three.js [examples](https://threejs.org/examples/).


## Node3D Modules

1. **Core** - key components to run WebGL code on Node.js.
	* [@node-3d/core](https://github.com/node-3d/core) -
	3D Core, this is just enough for Node3D to work.
	* [@node-3d/addon-tools](https://github.com/node-3d/addon-tools) -
	helpers for Node.js addons.
	* [@node-3d/glfw](https://github.com/node-3d/glfw) -
	native window control, can mimic web Document/Window/Canvas.
	* [@node-3d/image](https://github.com/node-3d/image) -
	image loading, can mimic web
	[Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image).
	* [@node-3d/segfault](https://github.com/node-3d/segfault) -
	catches and logs the C++ crash messages: segmentation fault, etc.
	* [@node-3d/webgl](https://github.com/node-3d/webgl) -
	a [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
	implementation.

1. **Dependency** - carries one or more precompiled binary and/or C++ headers.
	* [@node-3d/deps-bullet](https://github.com/node-3d/deps-bullet) -
	[Bullet Physics](https://pybullet.org/wordpress/) binaries and headers.
	* [@node-3d/deps-freeimage](https://github.com/node-3d/deps-freeimage) -
	[FreeImage](http://freeimage.sourceforge.net/) binaries and headers.
	* [@node-3d/deps-labsound](https://github.com/node-3d/deps-labsound) -
	[LabSound](https://github.com/LabSound/LabSound) binaries and headers.
	* [@node-3d/deps-opengl](https://github.com/node-3d/deps-opengl) -
	[OpenGL](https://www.opengl.org/), [GLFW](https://www.glfw.org/),
	[GLEW](http://glew.sourceforge.net/) binaries and headers.
	* [@node-3d/deps-qmlui](https://github.com/node-3d/deps-qmlui) -
	QmlUi binaries and headers.
	* [@node-3d/deps-qt-core](https://github.com/node-3d/deps-qt-core) -
	Qt binaries for console apps.
	* [@node-3d/deps-qt-gui](https://github.com/node-3d/deps-qt-gui) -
	Qt binaries for GUI apps.
	* [@node-3d/deps-qt-qml](https://github.com/node-3d/deps-qt-qml) -
	Qt binaries for QML apps.
	* [@node-3d/deps-uiohook](https://github.com/node-3d/deps-uiohook) -
	binaries and headers to use [libuiohook](https://github.com/kwhat/libuiohook) with NPM.

1. **Addon** - provides native bindings.
	* [@node-3d/bullet](https://github.com/node-3d/bullet) -
	rigid-body subset of Bullet Physics.
	* [@node-3d/cuda](https://github.com/node-3d/cuda) -
	addon for running NVidia CUDA programs on GPU.
	* [@node-3d/opencl](https://github.com/node-3d/opencl) -
	addon for running OpenCL programs on GPU.
	* [@node-3d/qml](https://github.com/node-3d/qml) -
	Node3D-QML interoperation.
	* [@node-3d/webaudio](https://github.com/node-3d/webaudio) -
	a [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
	implementation.

1. **Plugin** - a high-level **Node3D** module designed to seamlessly use the addons
together with 3d-core. A plugin uses 3d-core context and primitives to provide additional
features that combine **Node3D** envitonment and whatever addon(s) the plugin wraps.

	For example:

	```javascript
	import { dirname } from 'node:path';
	import { fileURLToPath } from 'node:url';
	import * as three from 'three';
	import { gl, init, addThreeHelpers } from '@node-3d/core';
	import { init as initQml } from '@node-3d/plugin-qml';

	const cwd = import.meta.dirname;
	const {
		doc, Image: Img,
	} = init({ isGles3: true, isWebGL2: true });
	addThreeHelpers(three);
	const { QmlOverlay, loop } = initQml({ doc, gl, cwd, three });
	
	// ...
	const overlay = new QmlOverlay({ file: `${cwd}/qml/gui.qml` });
	scene.add(overlay.mesh);
	```

	* [@node-3d/plugin-bullet](https://github.com/node-3d/plugin-bullet) -
	extends 3D Core with Bullet Physics.
	* [@node-3d/plugin-qml](https://github.com/node-3d/plugin-qml) -
	extends 3D Core with QML graphics.
	* [@node-3d/plugin-webaudio](https://github.com/node-3d/plugin-webaudio) -
	extends 3D Core with an audio interface.


## Contributing to Node3D

Bugs and enhancements are tracked as
[GitHub issues](https://github.com/node-3d/node-3d/issues).
You can also create an issue on a specific repository of
[Node3D]((https://github.com/node-3d)).


### Local Workspace

This repository is also a Git superproject for the Node3D package repositories.
Clone with packages, or initialize them after cloning:

```console
npm run packages:update
```

Install all npm workspace packages from this repository root:

```console
npm install
```

For metadata-only installs that should not run native package postinstall
scripts:

```console
npm install --ignore-scripts
```

Run a script across every package that defines it:

```console
npm run test:watch
npm run packages:test
npm run packages:lint
npm run build:all
```

Run a script in one package:

```console
npm --workspace @node-3d/core run test:watch
npm --workspace @node-3d/webgl run build:rebuild
```

Print the local dependency graph:

```console
npm run packages:graph
```

On PowerShell installations that block `npm.ps1`, use `npm.cmd` for the same
commands.


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
`@node-3d/deps-freeimage` carries the **FreeImage**
binaries and headers, and those are the property of their respective owners,
and are licensed under **FIPL** terms (but free to use anyway).

All such cases are explained in `README.md` per project in question.
