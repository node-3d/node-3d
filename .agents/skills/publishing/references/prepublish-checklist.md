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

The output should not include `examples/`. Node3D examples are always
repository-only; see `docs/adr/0016-repository-only-examples.md`. Treat
examples in npm pack output as a publish blocker unless a future ADR supersedes
that policy.

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

## Debug and Research Helpers

Before publish readiness, remove research-only debug helpers introduced during
investigation. This includes temporary diagnostic exports, one-off timing APIs,
extra logging, benchmark probes in normal examples, and native helpers whose
only purpose was to answer the current research question. Keep them only when
the user explicitly promotes them to supported package API or documented
examples.

## Install Script Safety

For metadata-only work, prefer:

```powershell
npm install --ignore-scripts
npm ci --ignore-scripts
```

Native packages may download prebuilt binaries in postinstall. Do not trigger those scripts accidentally during package metadata work.

## Native Binary Release Tags

Do not create or require a new native binary release only because the npm
package version changed. npm package versions and GitHub binary release tags are
intentionally decoupled.

For JavaScript-only, documentation-only, lockfile-only, or metadata-only package
releases, keep `install.js` pinned to the latest existing native binary tag
whose artifacts remain valid. Advance the binary tag and run binary workflows
only when native C++ sources, native build configuration, bundled native inputs,
ABI/runtime/platform baselines, or archive/install layout changed.

During publish readiness, review `install.js` as a separate contract:

- if native artifacts changed, verify the matching GitHub release assets exist;
- if native artifacts did not change, verify the pinned older binary release
  assets still exist and do not create duplicate binaries for version parity.

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

When the user asks to prepare a package for publishing, validation should end in
committed and pushed package/root state unless there is an obvious blocker that
needs user attention. Obvious blockers include failing checks, unresolved
dependency or version state, missing required binary release assets, or
unrelated dirty work that cannot be safely separated from the publish prep.

Before giving the user an `npm publish` command, verify remote synchronization:

- the standalone package repository has pushed the exact package commit being
  published;
- the root superproject has pushed the commit that records the package
  submodule pointer, lockfile, and documentation state when the root repo is in
  scope;
- `git status --short --branch` is clean and does not show local commits ahead
  of upstream for the package repo or root repo;
- any failed push, missing upstream, or diverged branch is a publish blocker.

For TypeScript packages, install dependencies, run `npm run build:ci`, inspect
`npm pack --dry-run`, and then provide the exact intended publish command for
the user to run from the package repository in an authenticated terminal. The
user-facing command should use `npm`, not `npm.cmd`; `npm.cmd` is only for agent
execution on Windows. Prefer the package's `publishConfig` for access settings
instead of duplicating flags unless a package lacks that metadata.

On native Windows agent sessions, use `npm.cmd` for these commands.

Agents must not run npm operations that can require a one-time password:
`npm publish`, `npm unpublish`, `npm login`, owner/access changes, or dist-tag
changes. OTP prompts and recovery are user-controlled. The agent's job is to
validate state and return copyable commands, not to attempt these operations.
Do not include `--otp` in user-facing npm commands; npm opens the browser-based
confirmation flow interactively when needed.

For packages that provide shared tooling or config, validate a real consumer from
a packed tarball before publishing. For example, validate `@node-3d/segfault`
against a packed `@node-3d/addon-tools` release candidate using normal
`npm run` scripts, not `npx` shortcuts.

After the user publishes, treat npm's publish output as sufficient confirmation
unless the user asks for an additional registry check or the publish feedback is
ambiguous.

Publish packages in dependency order so registry installs resolve without
depending on the monorepo. After replacement scoped packages are available,
deprecate old package names with `npm deprecate <old-name> "<message>"`.

## Built Entry Check

After building a TS package, confirm the public entry imports:

```powershell
node -e "import('./packages/package-name/dist/index.js').then((m) => console.log(Object.keys(m)))"
```
