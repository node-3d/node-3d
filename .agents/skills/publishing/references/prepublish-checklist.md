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

Publish workflows may use `npm publish --ignore-scripts` to avoid lifecycle
surprises, but then they must explicitly run the package build first. For TS
packages, the release path should install dependencies, run `npm run build:ci`,
then publish. Add tarball validation later as a single feature that creates,
checks, and publishes the same artifact.

## Built Entry Check

After building a TS package, confirm the public entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```
