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

Run:

```powershell
npm pack --workspace @node-3d/package-name --dry-run
```

For TS packages, the output should include:
`dist/`,
`install.js` when needed,
license,
package metadata,
config files.

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

## Built Entry Check

After building a TS package, confirm the public entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```
