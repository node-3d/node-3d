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

TS packages should generally expose:

- `main: dist/index.js`
- `types: dist/index.d.ts`
- `exports["."].types`
- `exports["."].default`

Dependency packages intentionally use `index.js` and `index.d.ts`.

## Pack Contents

For TypeScript packages, build before inspecting the tarball:

```powershell
npm --workspace @node-3d/package-name run build:ci
```

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

## Local Publish Path

Publishing is local and agent-assisted, not handled by per-package GitHub
Actions. Before running `npm publish`, make sure the intended package commit
exists in its standalone repository and the root superproject pointer is updated
when the root repo is part of the release state.

For TypeScript packages, install dependencies, run `npm run build:ci`, inspect
`npm pack --dry-run`, and then publish from the package repository. Prefer the
package's `publishConfig` for access settings instead of duplicating flags unless
a package lacks that metadata.

On native Windows agent sessions, use `npm.cmd` for these commands.

For packages that provide shared tooling or config, validate a real consumer from
a packed tarball before publishing. For example, validate `@node-3d/segfault`
against a packed `@node-3d/addon-tools` release candidate using normal
`npm run` scripts, not `npx` shortcuts.

After publishing, verify the registry state with:

```powershell
npm view @node-3d/package-name@version
```

## Built Entry Check

After building a TS package, confirm the public entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```
