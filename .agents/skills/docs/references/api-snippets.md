# API Snippets

Do not invent API examples. Derive them from public exports, tests, and runnable examples.

## Source Order

Prefer:

1. current package examples,
2. tests that show public API behavior,
3. `ts/index.ts` and exported source files,
4. generated declarations only as a check,
5. old README snippets only after verifying they still compile conceptually.

## Import Style

Use named ESM imports:

```ts
import { init, Screen } from '@node-3d/core';
```

Avoid old CommonJS examples unless documenting legacy behavior deliberately.

## API Sections

For each public API:

- state what it does,
- show a minimal usage snippet,
- mention important lifecycle/context requirements,
- link or point to examples,
- avoid documenting internals as public API.

## Keeping Docs Current

When source changes public exports, update README/API docs in the same task. When examples change, check README snippets that were copied from them.
