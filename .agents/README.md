# Agent Instruction Architecture

This directory is optimized for low context cost and predictable behavior.

Do not load this file during ordinary implementation tasks. Read it when editing
the agent guidance itself.

## Release Layout

This directory is a staging tree. A release copies `.import/AGENTS.md` to the
repository root, `.import/docs/contract-workflow.md` to `docs/`, and
`.import/.agents/` to `.agents/`. Paths in these files intentionally name the
final repository locations, not `.import/...` paths.

Keep `skills/*/agents/openai.yaml` alongside each `SKILL.md`; it is discovery
metadata, not runtime instruction text.

## Layers

### Root `AGENTS.md`

Owns only:

- repository-wide invariants;
- authorization/side-effect policy;
- skill routing;
- the Contract Gate;
- required checkpoints;
- global command conventions.

Anything that must never be silently overridden belongs at the root.

### `skills/*/SKILL.md`

Own domain procedure:

- when the skill applies;
- what artifacts it owns;
- a short workflow;
- conditional reference triggers.

A skill may narrow global behavior but may not broaden authority.

### `references/*.md`

Own detailed project facts, platform notes, and checklists.

References are opt-in. Each should be useful for a specific condition, not as a
general prerequisite. References must not define new commit/push/tag/release/
publish authorization.

### `docs/contract-workflow.md`

Owns cross-artifact synchronization for public/behavioral contracts. It is loaded
only when the root Contract Gate is YES.

## Context Budget

Targets, not hard syntax constraints:

- root `AGENTS.md`: <= ~4.5 KB;
- each skill: <= ~2 KB;
- references: split when unrelated sections are commonly loaded separately;
- normal task: root + one primary skill;
- complex task: root + contract workflow + primary + only necessary secondary
  skills/references.

Avoid duplicating routing tables or authorization rules in deeper files.

## Authoring Rules

- Put a rule at the highest layer where it is universally true.
- Put facts near the domain that consumes them.
- Prefer artifact/path triggers over fuzzy conceptual routing.
- Prefer positive executable rules over long rationale.
- Encode exceptions once.
- If a rule can be checked mechanically, prefer CI/tooling over prose.
- When adding a reference, add an explicit condition in the owning skill for when
  to load it.
- Keep examples of policy behavior in `BEHAVIOR-TESTS.md`, not in runtime files.

## Recommended Mechanical Checks

A future `lint:agents` script should verify:

- every skill directory has one `SKILL.md`;
- skill names match root routing names;
- referenced paths exist;
- root and skill size budgets;
- no reference introduces authority language that conflicts with root policy;
- no duplicated full routing table outside root;
- accepted ADR links resolve;
- every skill has its discovery metadata when the host supports it;
- `BEHAVIOR-TESTS.md` scenarios remain internally consistent.
