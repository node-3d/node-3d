# Instruction Authoring Reference

Load only when modifying `AGENTS.md`, skills, references, or the contract
workflow.

## Placement Test

For each proposed rule ask:

1. Is it globally true and safety/authority-critical? -> root `AGENTS.md`.
2. Is it a domain procedure needed whenever that skill is active? -> `SKILL.md`.
3. Is it detailed factual/checklist material needed only sometimes? -> reference.
4. Is it cross-artifact public-contract synchronization? -> contract workflow.
5. Is it a durable project policy rather than agent procedure? -> ADR.

## Anti-patterns

Avoid:

- duplicated authorization rules;
- duplicated complete routing tables;
- references that override root behavior;
- vague "read everything relevant" instructions;
- unconditional loading of large checklists;
- policy encoded only in examples;
- multiple documents defining the same exception with different wording.

## Reliability Pattern

At long-task boundaries, prefer a compact re-check over more prose:

- before edit -> scope, skill, Contract Gate;
- before side effect -> authorization + repository targets;
- before finish -> validations + dirty state + contract drift.

If a repeated failure can be detected mechanically, add a lint/test rather than
another reminder sentence.
