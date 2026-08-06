# 0012 - Native Binary Release Reuse

## Status

Accepted.

## Context

Native addon npm packages can change for reasons that do not alter the native
binary payload: TypeScript wrappers, README text, lockfiles, package metadata,
dependency ranges, install policy, or other JavaScript-only changes.

Creating a fresh GitHub binary release for every npm patch version gives the
appearance that the native addon changed even when the archives are byte-for-byte
equivalent in purpose. It also creates avoidable CI work, more attestations and
release assets to audit, and extra failure surface in package publishing.

## Decision

Do not create native binary releases purely to keep the GitHub binary tag equal
to the npm package version.

For JavaScript-only or metadata-only npm releases, keep `install.js` pinned to
the latest existing binary release tag whose native payload is still valid for
that package. Advance the binary release tag only when one of these changes:

* native C++ sources,
* `binding.gyp`, `common.gypi`, or native compiler/linker configuration,
* bundled native dependency inputs,
* platform archive naming or install layout,
* Node.js, ABI, runtime, or platform baseline for the binary,
* any other change that affects the produced `.node` artifact.

If an invalid binary release was created only for version parity, delete that
GitHub release and tag. If an npm package was published that points at the
deleted binary tag, the user should unpublish it when npm policy allows and
publish a corrected package version that points to the valid binary tag.

## Consequences

npm package versions and GitHub binary release tags are intentionally decoupled.
Consumers can install a newer JavaScript package that downloads an older native
binary release when the native artifact did not change.

Release review must check the binary tag in `install.js` independently from the
package version. A package version bump alone is not sufficient reason to run a
native binary workflow.

Agents must not attempt OTP-blocked npm operations such as publish, unpublish,
login, owner/access changes, or dist-tag changes. They should validate release
state and return the exact `npm` commands for a user to run manually in an
authenticated terminal. The commands should not include `--otp`; npm handles
browser-based confirmation interactively for the user. npm publish output is
sufficient confirmation unless the user asks for an additional registry check.
