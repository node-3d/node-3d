# Publishing Checklist

Load for publish readiness, version/lock/install state, npm pack contents,
native binary tag decisions, or root/submodule release coordination.

This checklist does not grant side-effect authority. Re-check root `AGENTS.md`
before commit, push, tag, release, or registry operations.

## Metadata

Inspect relevant `package.json` fields:

- name/version/type/main/types/exports/files/scripts;
- dependencies/peers/devDependencies;
- engines;
- repository/license/bugs/homepage;
- `publishConfig`.

TS runtime packages normally expose `dist/index.js` and `dist/index.d.ts`.
Dependency packages may intentionally expose root `index.js`/`index.d.ts`.

Preserve existing Node3D metadata conventions unless the task intentionally
changes them: every publishable `packages/*` package uses
`publishConfig.access: public`; package
repositories point to their standalone repository while bugs/homepage point to
the root project; internal runtime dependencies use `~` ranges, development
dependencies are pinned, and emitted-code packages keep `tslib` as a direct
dependency at the project-approved version.

Recommend bare `npm publish`. Public access is a manifest invariant, not a
`--access public` CLI flag. The root superproject and repository-only example
manifests are intentionally private and are not publish targets.

## Package Contents

Build before inspecting a TS package tarball, then run `npm pack --dry-run`.

Expected publish material is package-specific but generated runtime output,
metadata, license, and required lifecycle/config files belong in the pack.

Block publish readiness if `examples/` enters the tarball. Generated artifacts
must not be committed merely because they are required in a package.

When building multiple interdependent workspaces, avoid parallel declaration
builds that can race on regenerated `dist/`; use dependency order/topological
root commands.

Remove investigation-only exports, logging, timing probes, benchmark hooks, and
native helpers before declaring release readiness unless they were deliberately
promoted to supported API or examples. For shared tooling/config packages,
validate a real packed-tarball consumer when that consumer contract changed.

After building a TS package, confirm its public entry can import before making a
release conclusion.

## Native Binary Tags

npm versions and GitHub native binary tags are intentionally decoupled.

Do not create a new binary release solely because the npm version changed.
Advance the binary tag only when native source/build inputs, bundled native
dependencies, ABI/platform baseline, or archive/install layout requires new
artifacts.

JS/docs/lock/metadata-only releases should keep `install.js` pinned to the latest
compatible existing binary tag.

If already-published npm metadata points to a release whose assets alone are
broken/incomplete, treat that as a binary-asset repair rather than forcing an npm
version bump.

## Release State

For coordinated native + npm release preparation, keep package version, package
lock metadata, root workspace lock metadata when in scope, and `install.js`
target synchronized.

Package-content commits precede root submodule-pointer commits.

Do not fold package content into a root-only commit: the root records package
commit pointers plus root-owned files. Root and standalone package lockfiles are
separate artifacts; update only the scopes affected by the task and do not
invent a missing standalone lockfile without explicit direction.

Before declaring state publish-ready, verify the relevant standalone package and
root superproject are clean and synchronized with their remotes if those remotes
are part of the requested preparation.

Authenticated npm operations remain user-controlled per root `AGENTS.md`.
