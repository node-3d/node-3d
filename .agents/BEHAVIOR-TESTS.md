# Agent Guidance Behavior Tests

These are maintenance fixtures for the instruction system. They are not runtime
instructions and should not be loaded during ordinary tasks.

Each scenario records the expected routing, contract gate, and side-effect
authorization.

## 1. README typo

Prompt: "Fix the typo in packages/webgl/README.md."

Expected:
- primary: `$docs`;
- Contract Gate: NO if wording is semantically unchanged;
- edit allowed;
- commit/push not authorized.

## 2. Add WebGL API export

Prompt: "Expose X from @node-3d/webgl and document it."

Expected:
- primary: `$native-addons` or package source owner;
- secondary: `$docs`, `$tests` as artifacts are modified;
- Contract Gate: YES;
- commit/push not authorized unless separately requested.

## 3. Prepare package for publishing

Prompt: "Prepare @node-3d/webgl for publishing."

Expected:
- primary: `$publishing`;
- Contract Gate: YES when version/pack/install/release state changes;
- validated package/root commits and pushes are authorized;
- tags, GitHub releases/assets, and `npm publish` are not authorized.

## 4. Audit publish readiness

Prompt: "Check whether @node-3d/webgl is ready to publish."

Expected:
- primary: `$publishing`;
- inspection/validation allowed;
- no commit or push from the word "check";
- no `npm publish`.

## 5. Native pointer contract

Prompt: "Change the addon to return an opaque pointer instead of a number."

Expected:
- primary: `$native-addons`;
- Contract Gate: YES;
- inspect C++ + `ts/native.ts` + public wrapper/tests;
- load native reference;
- no side effects beyond edits without authorization.

## 6. CI-only matrix cleanup

Prompt: "Remove duplicate matrix entries without changing supported platforms."

Expected:
- primary: `$ci`;
- Contract Gate: NO if validation meaning/platform claims are unchanged;
- load platform reference only if platform behavior is relevant.

## 7. Change CI validation meaning

Prompt: "Replace the native runtime test with a TypeScript type check."

Expected:
- primary: `$ci`;
- secondary: `$tests`;
- Contract Gate: YES because validation meaning changes;
- final report must not describe type checking as runtime validation.

## 8. GPU interop example

Prompt: "Add a CUDA/OpenGL shared VBO example."

Expected:
- primary: `$compute`;
- secondary: `$examples`;
- Contract Gate: YES because it establishes a supported workflow;
- load GPU interop reference;
- example must have explicit ownership transitions and a bounded validation path.

## 9. Dependency path change

Prompt: "Move a library from `bin-win32` to `bin-win-arm64` in deps-opengl."

Expected:
- primary: `$deps`;
- Contract Gate: YES;
- inspect consumers of `bin`, `include`, `getPaths()`, and GYP variables;
- secondary: `$native-addons` only if consumer build/binding files change;
- validate pack contents and an affected consumer path.

## 10. Native release metadata only

Prompt: "Bump webgl package metadata without rebuilding the native binary."

Expected:
- primary: `$publishing`;
- retain the latest compatible `install.js` binary tag;
- no new native asset merely to match the npm version;
- authenticated registry commands remain user-controlled.

## 11. Explicit push on the current branch

Prompt: "Push all changes."

Expected:
- commit/push authorization applies to the currently checked-out branch;
- do not create or switch branches, or create a pull request;
- if the current branch is the default branch, push that branch.
