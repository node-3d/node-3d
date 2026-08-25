---
name: publishing
description: Audit or prepare Node3D packages for npm publishing: package metadata, exports/files, versions, lockfiles, npm pack, binary tags/assets, submodule/root release state, and readiness.
---

# Publishing

## Owns

Package/release readiness and consistency across standalone package + root
superproject state.

This skill does not grant side-effect authority. Re-check root `AGENTS.md` before
commit, push, tag, release, or registry operations.

## Workflow

1. Check affected root/submodule status before release-facing edits.
2. Determine whether release state affects the package repo, root workspace, or
   both.
3. Inspect metadata, exports/files, scripts, dependencies, engines, lockfiles,
   and native `install.js` when present.
4. Run narrow validation first; build before `npm pack --dry-run`. For native
   package or consumer validation, use normal `npm ci` so postinstall-managed
   binary artifacts are present; `--ignore-scripts` is metadata-only.
5. Keep npm package versions decoupled from native binary tags unless native
   artifacts actually changed.
6. For package content changes, package commit state precedes the root submodule
   pointer state.
7. Before declaring publish-ready, verify requested package/root state is clean,
   coherent, and synchronized with remotes where required by the task.
8. Every publishable `packages/*` package is public by project policy. Require
   `publishConfig.access: public` in its manifest and recommend bare
   `npm publish`; never add `--access public` or offer private-package paths.
   Give authenticated npm commands to the user; do not run them.

## Load References

Load `.agents/references/publishing-checklist.md` for metadata, pack contents,
binary-tag decisions, release-state sequencing, or readiness checks.

Load `.agents/references/repository-model.md` when multiple submodules/workspaces
are involved.
