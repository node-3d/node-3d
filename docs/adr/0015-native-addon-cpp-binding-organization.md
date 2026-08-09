# 0015 - Native Addon C++ Binding Organization

## Status

Accepted.

## Context

Node3D native addons expose C++ libraries through Node-API. As binding surfaces
grow, a single C++ file becomes hard to navigate and makes unrelated methods,
classes, constants, and helper state look coupled.

The repository already uses addon-tools macros and package-local `src/cpp`
folders. The missing convention is the role of each file once an addon has more
than a trivial binding surface.

## Decision

Native addons should keep `bindings.cpp` as the module mount table. It should
own `NODE_API_MODULE`, create or receive the exported module object, and mount
methods, namespace objects, classes, and constants.

`bindings.cpp` should not implement business logic, API wrappers, callback
bridges, class methods, or native resource behavior. Constants can stay in
`bindings.cpp` because they have no implementation; they are bound directly to
the module exports.

Other C++ files should be named after what they implement:

* a native class file implements that class,
* an API-domain file implements that domain's methods,
* a callback file implements callback state, conversion, and polling,
* a utility header contains shared inline helpers when a `.cpp` file would only
  add indirection.

When an addon exposes grouped JavaScript namespaces, each implementation file
may create its own namespace object, and `bindings.cpp` mounts those objects on
the module export. This keeps the mount table visible without dumping all method
implementations into one file.

For third-party APIs with established interface names, namespace and file names
should follow the upstream API shape unless there is a clear JavaScript
ergonomics reason not to. For example, Steamworks bindings group methods under
`steam`, `user`, `apps`, `utils`, `callbacks`, and `userStats` instead of
publishing a flat module full of unrelated function names.

## Consequences

Addon entrypoints stay easy to audit: exported names are visible in
`bindings.cpp`, while implementation details live in files named after their
actual responsibility.

Large addons can grow without turning the module entrypoint into a catch-all
source file.

Constants remain close to export binding code, avoiding fake implementation
files for values that are directly exported.
