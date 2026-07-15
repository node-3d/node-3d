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
5. For package content changes, commit inside the package submodule first. Commit the root superproject pointer only after the package commit exists.
6. Do not push, publish, tag, or create release artifacts unless the user explicitly asks.
7. When publishing is requested, prefer a local `npm publish` from the package
   repository after the checklist passes and the intended Git state is committed.

## References

- Read [prepublish-checklist.md](references/prepublish-checklist.md) for package validation commands and expected package contents.
- Read [submodule-safety.md](references/submodule-safety.md) before committing, pushing, or changing package lockfiles across the ecosystem.
