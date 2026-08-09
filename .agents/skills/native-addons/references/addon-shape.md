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
- Package-local scripts live in `scripts/` when they are more than trivial
  one-liners.
- Delete stale source folders after source layout cleanup. Do not leave empty
  legacy `js/` or `test/` folders once their contents have moved.

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
- `format:ts`
- `format:ts:ci`
- `format:src`
- `format:src:ci`
- `test:ci`
- `test:watch`
- `lint:gypi`
- `lint:oxlint`
- `lint:ts`
- `lint:all`
- `prepack`

Use `prepack`, not `prepare`, to build `dist/` for packaging. `prepare` can run
during local/workspace installs and trigger rebuilds while dependent packages
consume generated declarations. Do not rely on committed `dist/` for GitHub
source. `dist/` and `.rslib/` are generated artifacts: ignore them in Git,
include `dist/` in the npm `files` allowlist, and build explicitly before
publishing.

Use TypeScript for source, tests, examples, and package-local scripts whenever
Node can execute the files directly or the package bundler owns the generated
output. Keep package-local scripts under `tsconfig.json` coverage. Root-level
`install.js` is the small shipped lifecycle exception because it runs from
`node_modules` during postinstall and normally does not justify a bundled output
path.

Native addons should expose `format:src` and `format:src:ci` scripts for C++
sources. Copy the shared `@node-3d/addon-tools/utils/.clang-format` with
`cpclangformat()` before invoking `clang-format-node`. Package-local
`.clang-format` files are generated, gitignored, and can be overwritten.

## Install Script

Use a root `install.js` for postinstall behavior. It should perform package
install work such as downloading prebuilt binaries. Do not put install lifecycle
logic into the library TS graph.

Prefer shared `@node-3d/addon-tools` download/install helpers through normal
package scripts. Their release-asset downloads retry transient failures three
total times, with waits after the first failures, so a transient postinstall
download does not leave dependent binary packages unavailable in CI.

## Verification

```powershell
npm run build:compile --workspace @node-3d/package-name
npm run build:ci --workspace @node-3d/package-name
npm run format:ts:ci --workspace @node-3d/package-name
npm run format:src:ci --workspace @node-3d/package-name
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
