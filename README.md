# Node3D


## Intro

> **Node.js** is great, and **OpenGL** is great, then why not combine them?

It all has started as a fork of somebody's (there are many forks) **node-webgl**.
And the general idea was to make it very portable with the real-web counterpart.
Also **three.js** always was a major concern. The aim was to become able to run
**three.js** examples in **Node.js** as easily and portable as possible.

> What else we can in **Node.js**, what browsers can't?

It's true, at first people often think, "why would you bother at all".
There are sure some reasons behind this. Most of them can be generalized as
"being able to surpass any browser-limitation".

For example, **OpenGL** can actually be used to its full extent, you are not really
limited to **OpenGL ES 2/3** anymore. Then goes window control beyond what any browser
would ever tolerate. Of course, unrestricted disk operations. But it all comes down
to the ability to use compiled dynamic libraries (like `.dll`/`.so`).

In the end, a solid desktop software installer can be built out of a **Node.js**
based project. And then shipped to the end user as a piece of traditional desktop
software. You can view this process the same way as it happens with other frameworks.
For example, a **Qt**-based **C++** project is compiled and then packaged into a
software installer in a similar way.

> That's a lot of work...

As more and more modules had piled up, the decision was made to bring all official
**Node3D** modules under the dedicated Organization (as in "Github Organizations").
And so, the process is on. Also, **Node3D calls for contributors**, and there are many
ways in which you can collaborate:

1. Start/participate in issues-discussions, including feature requests, use cases, bug reports, etc.
1. Review and comment on the current codebase.
1. Contribute a new feature or fix in form of a Pull Request.
1. Donate me a cup of coffee :coffee:

The contribution guidelines are available as [CONTRIBUTION.md](/CONTRIBUTION.md).


## Where to Start?

To use this as a developer, you have to satisfy several simple prerequisites:

1. Have a recent version of **Node.js** and **NPM** installed.

1. On **Windows**:
	* Install **vcredist 2013** for your architecture (**x32**/**x64**).
	* Do `npm i -g windows-build-tools` on a **PRIVILEGED** console window, reboot.
	* The use of **Git for Windows** and its **Git Bash** is strongly encouraged.
	
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

1. See if there are some interesting plugins to play with (official list below).


## Node3D Modules

There are at least 4 distinct categories of modules you come across at **Node3D**.

1. **Support** - just an ordinary **Node.js** module doing something useful.
Any external module can also qualify as a Support, the difference is only in the
ownership. There are several such modules, owned by the Organization. Those can
be used in any other project, but were directly inspired by the development of **Node3D**.
1. **Dependency** - carries one or more precompiled binary libraries.
1. **Addon** - provides certain native functions, and requires compilation
with **node-gyp** upon installation.
1. **Plugin** - a high-level **Node3D** module, exporting a single function. Having
passed the Core to that function results in Core being extended with new features.
For example:
```
const core3d = require('3d-core-raub');
const bullet3d = require('3d-bullet-raub');

bullet3d(core3d);


const { bullet, Screen, three, loop } = core3d;
const { Scene, Body } = bullet;
```

## License

All of **Node3D** modules have their own code licensed under **MIT** terms. Which in
short means "I've just put it here, do what you want, have fun". However, some
modules have **separately licensed third-party software** in them. For instance,
`deps-freeimage-raub` has some **Node3D** machinery, which makes it work for
the project: `package.json`, `binding.gyp`, etc. But it also carries **FreeImage**
binaries and headers, and those are the property of their respective owners,
and are licensed under **FIPL** terms.

All such cases are explained in `README.md` per project in question.

To summarize,
> **Node3D** can be used commercially. You don't have to pay for **Node3D** or
any of its third-party libraries.
