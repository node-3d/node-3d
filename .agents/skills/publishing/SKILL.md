---
name: publishing
description: Audit and prepare Node3D packages for safe npm publishing. Use for pre-publish checks, package.json exports/files, npm pack dry-runs, lockfile scope, standalone package readiness, workspace versus submodule safety, release hygiene, package metadata, and root/submodule commit or push planning.
---

# Publishing

Use this skill whenever a change can affect how a Node3D package installs,
builds, packs, publishes, or is committed across the superproject and submodule
repositories. Node3D publishing is intentionally local and agent-assisted; do
not create or rely on dedicated package publish workflows unless the release
policy changes.

## Workflow

1. Check root status and affected submodule status before editing or committing.
2. Determine whether the task affects the root workspace, one package as a standalone repo, or both.
3. Inspect package metadata: `type`, `main`, `types`, `exports`, `files`, scripts, dependencies, engines, and lockfiles.
4. Run the narrow package checks first. Use `npm pack --dry-run` before release-facing conclusions.
5. For native addons, compare native sources and build inputs before creating
   binary releases. Do not create identical binaries purely to couple a GitHub
   binary tag to an npm package version. JavaScript-only, documentation-only,
   lockfile-only, and metadata-only releases must keep `install.js` pinned to
   the latest valid native binary tag.
   If only existing GitHub release binaries are wrong or incomplete and the
   published npm package already points at that release tag, rebuild/replace
   those release assets without bumping or republishing the npm package.
6. For package content changes, commit inside the package submodule first. Commit the root superproject pointer only after the package commit exists.
7. When the user asks to prepare a package for publishing, commit and push the
   prepared package state and root superproject pointer after validation passes.
   Stop before pushing only for an obvious blocker that requires user attention,
   such as failing checks, unresolved dependency/version state, missing required
   release assets, or unrelated dirty work that cannot be safely separated.
8. Before providing `npm publish` instructions, verify the standalone package
   repository and any root superproject state are synchronized with their
   remotes. `git status --short --branch` must be clean and must not show local
   commits ahead of upstream in the package repo or root repo. If pushing fails,
   or if the branch has diverged, stop and report the blocker instead of
   presenting the package as publish-ready.
9. Do not push, publish, tag, or create release artifacts unless the user explicitly asks.
10. Never run npm operations that can require a one-time password, including
   `npm publish`, `npm unpublish`, `npm login`, owner/access changes, or
   dist-tag changes. Validate the package and provide the exact intended
   `npm` commands for the user to run manually in an authenticated terminal.
   Do not add `--otp`; npm handles browser-based confirmation interactively for
   the user. Do not add `npm view` after publish unless the user asks for an
   extra registry check.

## References

- Read [prepublish-checklist.md](references/prepublish-checklist.md) for package validation commands and expected package contents.
- Read [submodule-safety.md](references/submodule-safety.md) before committing, pushing, or changing package lockfiles across the ecosystem.
