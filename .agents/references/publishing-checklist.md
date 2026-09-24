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
`publishConfig.access: public`; package repositories point to their standalone
repository while bugs/homepage point to the root project; internal
`@node-3d/*` dependencies use `~` ranges in every installed dependency section;
external installed dependencies are pinned exactly; peer dependency ranges
express consumer compatibility; and emitted-code packages keep `tslib` as a
direct dependency at the project-approved version. See
`docs/adr/0021-internal-and-external-dependency-ranges.md`.

Recommend bare `npm publish`. Public access is a manifest invariant, not a
`--access public` CLI flag. The root superproject and repository-only example
manifests are intentionally private and are not publish targets.

## Registry Availability Verification

When a release depends on a freshly published npm package, do not treat a
plain npm resolution failure or a cached `npm view` result as evidence that the
version is unpublished. npm may serve a stale package document even when its
configured registry is `https://registry.npmjs.org/`.

If the user reports that a package is published, treat the npmjs.com package
page as authoritative. Confirm the exact version with an online registry read
before blocking the release:

```powershell
npm.cmd view @node-3d/package@version version --registry=https://registry.npmjs.org/ --prefer-online --fetch-retries=0
```

Use `--prefer-online` on follow-up `npm install --package-lock-only` commands
that must resolve that fresh version. Report a publication mismatch only after
this online verification fails; never contradict a user-reported npmjs.com
publication based solely on a cached CLI response.

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

## Packed Consumer Gate

Before npm publication, install the actual `npm pack` tarball into an empty
project with normal lifecycle scripts and registry dependency resolution. The
consumer environment must not have workspace links or access to the source or
build tree. Load the public entry and run the narrowest package-specific smoke
behavior needed.

For native packages whose installers fetch GitHub release assets, build and
transfer every candidate platform archive as a workflow artifact, then run the
tarball install against those exact archives on fresh platform runners. Create
or update the GitHub release only after all consumer lanes pass. A passing
repository test suite or `npm pack --dry-run` does not replace this release
gate.

## Native Binary Tags

npm versions and GitHub native binary tags are intentionally decoupled.

Do not create a new binary release solely because the npm version changed.
For an installer that already targets a compatible GitHub release tag, the
normal native-update path is to rebuild and replace that tag's platform
archives. The tag is a stable installer selector, not an immutable-artifact
promise. Avoid advancing the tag or changing `install.js` unless a new
incompatible artifact line, rollback/retirement boundary, or an explicitly
requested release strategy requires it.

When auditing whether native work has shipped, resolve the tag from
`install.js` and inspect the actual GitHub release assets: `updated_at`,
digests, archive contents, and relevant binary evidence. Do not infer that a
native-source commit is unshipped merely because it postdates the tag's release
creation time or the npm package version.

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
