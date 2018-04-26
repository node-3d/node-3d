# Node3D

Node3D is a large open source project &mdash; it's made up of over
[20 repositories](https://github.com/node-node3d). Node3D is intentionally very modular.


## Node3D Packages

All modules are divided into 3 categories: deps, addons, aggregators:

* Packages that carry one or more binary libraries are published as `deps-[package-name]`.
* Addon packages are Node.js addons, which provide certain native functions, and
require compilation with **node-gyp** upon installation. They have arbitrary names.
* Pure script packages aggregate functionality from several submodules
and provide high-level abstractions. The naming is `3d-[package-name]`.
