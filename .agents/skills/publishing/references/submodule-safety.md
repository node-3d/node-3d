# Submodule Safety

The root repo is a superproject. Most top-level packages under `packages/` are standalone Git repositories.

## Before Editing

Check:

```powershell
git status --short --branch
git submodule foreach --recursive git status --short --branch
```

Preserve unrelated dirty work in both the root and package submodules.

## Commit Order

When package contents change:

1. Commit inside the package submodule.
2. Push the package submodule only if the user asked to push, or if the user
   asked to prepare a package for publishing.
3. Commit the root superproject pointer after package commits exist.
4. Push root only if the user asked to push, or if the user asked to prepare a
   package for publishing.

Before npm publish instructions are handed to the user, the package submodule
and root superproject must both be synchronized with their upstream remotes when
both are in scope. A package commit that exists only locally, or a root pointer
commit that exists only locally, is not publish-ready state.

Do not fold package content changes into a root-only commit. The root only records submodule commit pointers plus root files.

## Lockfile Scope

Root workspace lockfiles and standalone package lockfiles are separate concerns.

When adding direct dependencies across packages:

- update root metadata and root lock when the root workspace needs it,
- update package manifests,
- update existing standalone package locks when possible,
- do not invent missing standalone lockfiles unless explicitly requested.

Standalone package lock refresh can fail when unpublished local `@node-3d/*` dependencies are not resolvable from the registry. In that case, avoid forcing registry resolution and make deterministic lock metadata edits only when the structure is clear.
