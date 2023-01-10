# Node3D


## Desktop 3D applications with **Node.js** and **OpenGL**.

* **WebGL**-like interface. Real OpenGL though.
* **Three.js** compatible environment.
* Use node modules and compiled addons: CUDA, OpenCL, etc.
* Window control. Multiwindow applications.
* Read/write files.
* Crossplatform: Linux x64, Linux ARM, MacOS x64, Windows x64.


## Quick start

1. `mkdir my-project && cd my-project && npm init -y && npm i -s 3d-core-raub && touch index.js`

1. Paste the code and see if it works:
	
	```
	'use strict';
	
	const init = require('3d-core-raub');
	const { Screen, Brush, loop } = init();
	
	const screen = new Screen();
	loop(() => screen.draw());
	
	const brush = new Brush({ screen, color: 0x00FF00 });
	
	screen.on('mousemove', e => brush.pos = [e.x, e.y]);
	```

1. Further consult the docs of [3d-core-raub](https://github.com/raub/node-3d-core).

1. Take a look at Three.js [examples](https://threejs.org/examples/).

1. Look through Node3D plugins for additional features, like 2D GUI or 3D physics.

The contribution guidelines are available as [CONTRIBUTING.md](/CONTRIBUTING.md).


## Some thoughts behind this

Compatibility with **three.js** allows porting the existing JS code.
The real OpenGL backend is used (not ANGLE). So it is possible to use the GL resource IDs
to setup interoperation with CUDA or OpenCL. This is the most important feature of this
project and why it was created in the first place.

Compatibility with **three.js** allows porting the existing JS code.
It is quite possible to create a fully-features apps and games using this framework.
For example, see
[Space Simulation Toolkit](https://store.steampowered.com/app/1196080/Space_Simulation_Toolkit/).


## Node3D Modules

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

1. **Addon** - provides native bindings.
	* [bullet-raub](https://github.com/node-3d/bullet-raub) -
	rigid-body subset of Bullet Physics.
	* [glfw-raub](https://github.com/node-3d/glfw-raub) -
	native window control, can mimic web Document/Window/Canvas.
	* [image-raub](https://github.com/node-3d/image-raub) -
	image loading, can mimic web
	[Image](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image).
	* [qml-raub](https://github.com/node-3d/qml-raub) -
	Node3D-QML interoperation.
	* [webaudio-raub](https://github.com/node-3d/webaudio-raub) -
	a [WebAudio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
	implementation.
	* [webgl-raub](https://github.com/node-3d/webgl-raub) -
	a [WebGL](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
	implementation.

1. **Plugin** - a high-level **Node3D** module for extending the 3d-core features.
For example:
	
	```
	const init3dCore = require('3d-core-raub');
	
	const {
		Image,
		doc,
		qml: { Material, Overlay, OverlayMaterial, Rect },
	} = init3dCore({ plugins: ['3d-qml-raub'] });
	
	// ...
	```
	
	* [3d-bullet-raub](https://github.com/node-3d/3d-bullet-raub) -
	extends 3D Core with Bullet Physics.
	* [3d-qml-raub](https://github.com/node-3d/3d-qml-raub) -
	extends 3D Core with QML graphics.
	* [3d-webaudio-raub](https://github.com/node-3d/3d-webaudio-raub) -
	extends 3D Core with an audio interface.

1. Other:
	* [3d-core-raub](https://github.com/node-3d/3d-core-raub) -
	3D Core, this is just enough for Node3D to work.
	* [addon-tools-raub](https://github.com/node-3d/addon-tools-raub) -
	helpers for Node.js addons.
	* [threejs-raub](https://github.com/node-3d/threejs-raub) -
	a fork of [Three.js](https://threejs.org/) with some additional features.


## License

All of **Node3D** modules have their own code licensed under **MIT** terms. Which in
short means "I've just put it here, do what you want, have fun". However, some
modules have **separately licensed third-party software** in them. For instance,
`deps-freeimage-raub` carries the **FreeImage**
binaries and headers, and those are the property of their respective owners,
and are licensed under **FIPL** terms (but free to use anyway).

All such cases are explained in `README.md` per project in question.

To summarize:
> **Node3D** can be used commercially. You don't have to pay for **Node3D** or
any of its third-party libraries.
