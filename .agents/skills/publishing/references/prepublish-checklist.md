# Pre-publish Checklist

Use this for package-facing changes and before any publish or release conclusion.

## Metadata

Inspect `package.json`:

- `name`
- `version`
- `type`
- `main`
- `types`
- `exports`
- `files`
- `scripts`
- dependency sections
- `engines`
- repository/license metadata

Common package metadata:

- `license: MIT`
- `bugs` should point to the root `node-3d` repo issues.
- `homepage` should point to the root `node-3d` README.
- `repository` should point to the package-specific `node-3d/<package>` repo.
- `publishConfig.access` should be `public` for scoped public packages.

TS packages should generally expose:

- `main: dist/index.js`
- `types: dist/index.d.ts`
- `exports["."].types`
- `exports["."].default`

Dependency packages intentionally use `index.js` and `index.d.ts`.

Runtime dependencies between Node3D packages should use `~` ranges so patch
updates can flow without forcing every dependent package to republish, while
minor changes remain explicit. Development dependencies should be exact/pinned
because repository lockfiles control them and they do not affect consumer
installation. Peer dependencies describe compatibility and may use ranges, such
as `three: ">=0.174.0 <1"` or optional peers for opt-in testing helpers.

Keep `tslib` as a direct dependency where emitted code needs it, pinned to
`2.8.1`.

## Pack Contents

For TypeScript packages, build before inspecting the tarball:

```powershell
npm --workspace @node-3d/package-name run build:ci
```

When validating multiple packages from the root workspace, do not run dependent
package `build:ci` scripts in parallel. Workspace packages resolve each other
through local package folders, and Rslib may clean/regenerate `dist/`; a package
can fail declaration generation if a dependency's `dist` is temporarily absent.
Build dependencies first or use a root/topological build command.

Then run:

```powershell
npm pack --workspace @node-3d/package-name --dry-run
```

The dry run shows exactly what npm would publish. It is useful for manual review
or for future tooling that validates the tarball, but it is only diagnostic
unless something actually checks the output. It does not replace the build step.

For TS packages, the output should include:
`dist/`,
`install.js` when needed,
license,
package metadata,
config files.

`dist/`, `.rslib/`, package tarballs (`*.tgz`), and native build directories are
generated artifacts. They should be ignored by Git and should not be committed.
The npm package should receive `dist/` from the explicit build performed before
packing or publishing.

## Focused Checks

For one package:

```powershell
npm --workspace @node-3d/package-name run lint:all
npm --workspace @node-3d/package-name run test:ci
npm --workspace @node-3d/package-name run build:ci
```

Use `--if-present` only when the package family legitimately lacks the script.

## Install Script Safety

For metadata-only work, prefer:

```powershell
npm install --ignore-scripts
npm ci --ignore-scripts
```

Native packages may download prebuilt binaries in postinstall. Do not trigger those scripts accidentally during package metadata work.

## Lifecycle Scripts

Use `prepack`, not `prepare`, for packages that need to build `dist/` before
packing or publishing. `prepare` also runs during local/workspace install
scenarios and can cause one package to rebuild while another package is trying
to consume its generated declarations. `prepack` runs for `npm pack` and
`npm publish`, where generated publish artifacts must exist.

## Local Publish Path

Publishing is local and agent-assisted, not handled by per-package GitHub
Actions. Before running `npm publish`, make sure the intended package commit
exists in its standalone repository and the root superproject pointer is updated
when the root repo is part of the release state.

For TypeScript packages, install dependencies, run `npm run build:ci`, inspect
`npm pack --dry-run`, and then have the user publish from the package repository
in an interactive terminal. Prefer the package's `publishConfig` for access
settings instead of duplicating flags unless a package lacks that metadata.

On native Windows agent sessions, use `npm.cmd` for these commands.

For packages that provide shared tooling or config, validate a real consumer from
a packed tarball before publishing. For example, validate `@node-3d/segfault`
against a packed `@node-3d/addon-tools` release candidate using normal
`npm run` scripts, not `npx` shortcuts.

After the user publishes, verify the registry state with:

```powershell
npm view @node-3d/package-name@version
```

Publish packages in dependency order so registry installs resolve without
depending on the monorepo. After replacement scoped packages are available,
deprecate old package names with `npm deprecate <old-name> "<message>"`.

## Built Entry Check

After building a TS package, confirm the public entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```
