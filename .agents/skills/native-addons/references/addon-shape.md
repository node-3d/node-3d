# Native Addon Package Shape

This reference captures the stable pattern that should guide everyday addon work.

Native addon packages should remain usable as standalone repositories
and as packages inside the root `node-3d` workspace.

## Addon Layout

```text
package-root/
  install.js
  oxlint.config.ts
  package.json
  rslib.config.ts
  tsconfig.json
  tsconfig.build.json
  src/
    binding.gyp
    common.gypi
    cpp/
      ...
  examples/
    *.ts
  ts/
    index.ts
    native.ts
    *.ts
    *.test.ts
```

- `ts/` is library source and source-level tests.
- Examples live in `examples/`.
- Package lifecycle plumbing stays at package root.

## Package Contract

Publish one public JS entry and one declaration entry:

```json
{
	"type": "module",
	"main": "dist/index.js",
	"types": "dist/index.d.ts",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"default": "./dist/index.js"
		}
	}
}
```

- Keep public values re-exported from `ts/index.ts`.
- Avoid exposing internal files unless a real consumer import use case exists.
- Prefer named exports.

Rslib config:

- `bundle: true` keeps runtime output focused on the public entry.
- Do not enable declaration bundling.
- `dist/*.d.ts` files for internal source modules are expected.

## Scripts

Use namespaced scripts with concrete flavors:

- `build:ci`
- `build:watch`
- `build:compile`
- `build:rebuild`
- `test:ci`
- `test:watch`
- `lint:gypi`
- `lint:oxlint`
- `lint:ts`
- `lint:all`
- `prepare`

`prepare` should build `dist/` for packaging. Do not rely on committed `dist/` for GitHub source.

## Install Script

Use a root `install.js` for postinstall behavior. It should perform package install work such as downloading prebuilt binaries. Do not put install lifecycle logic into the library TS graph.

## Verification

```powershell
npm run build:compile --workspace @node-3d/package-name
npm run build:ci --workspace @node-3d/package-name
npm run lint:gypi --workspace @node-3d/package-name
npm run lint:ts --workspace @node-3d/package-name
npm run lint:oxlint --workspace @node-3d/package-name
npm run test:ci --workspace @node-3d/package-name
npm pack --workspace @node-3d/package-name --dry-run
```

Confirm the built entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```
