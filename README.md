# Node3D


## Desktop 3D applications with **Node.js** and **OpenGL**.

* **WebGL**-like interface. Real OpenGL though.
* **Three.js** compatible environment.
* Use node modules and compiled addons.
* Window control. Multiwindow applications.
* Read/write files.
* Crossplatform: Linux >=Xenial, OSX, Windows.


## Some thoughts behind this

* I'm sane enough to assume people do more JS+GL stuff in a browser.
* So, I try to create a familiar and (probably) portable environment.
* A browser can't do files/dlls, I can -- CUDA, OpenCL yaay!
* Users may need some extra functions or forks, so I try to be modular.


## How to colaborate

1. Start/participate in issues-discussions, including feature requests,
use cases, bug reports, etc.
1. Review and comment on the current codebase.
1. Contribute a new feature, fix or module-test in form of a Pull Request.
1. Donate, well I didn't really establish how yet.
1. Ask me a question, give advice via skype messaging: rauber666.

The contribution guidelines are available as [CONTRIBUTING.md](/CONTRIBUTING.md).


## Where to Start?

1. Have a recent version of **Node.js** and **NPM** installed.

1. On **Windows**:
	* Install **vcredist 2013** for your architecture (**x32**/**x64**).
	* Do `npm i -g windows-build-tools` on a **PRIVILEGED** console window.
	* Open a new console window and enjoy.
	
1. `mkdir my-project && cd my-project && npm init -y && npm i -s 3d-core-raub && touch index.js`

1. Paste the code and see if it works:
	
	```
	'use strict';
	
	const { Screen, Brush, loop } = require('3d-core-raub');
	
	const screen = new Screen();
	loop(() => screen.draw());
	
	const brush = new Brush({ screen, color: 0x00FF00 });
	
	screen.on('mousemove', e => brush.pos = [e.x, e.y]);
	```

1. Further consult the docs of [3d-core-raub](https://github.com/raub/node-3d-core).

1. Take a look at Three.js [examples](https://threejs.org/examples/).

1. Look through Node3D plugins for additional features, like 2D GUI or 3D physics.


## Node3D Modules

1. **Dependency** - carries one or more precompiled binary.
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

1. **Addon** - provides certain native functions, and requires compilation
with **node-gyp** upon installation.
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

1. **Plugin** - a high-level **Node3D** module, exporting a single function. Having
passed the Core to that function results in Core being extended with new features.
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
`deps-freeimage-raub` has some **Node3D** machinery, which makes it work for
the project: `package.json`, `binding.gyp`, etc. But it also carries **FreeImage**
binaries and headers, and those are the property of their respective owners,
and are licensed under **FIPL** terms.

All such cases are explained in `README.md` per project in question.

To summarize:
> **Node3D** can be used commercially. You don't have to pay for **Node3D** or
any of its third-party libraries.
