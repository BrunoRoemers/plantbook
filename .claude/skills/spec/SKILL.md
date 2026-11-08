---
name: spec
description: Draft a feature spec in docs/specs/ from an idea, the domain model and the conversation. Use when Bruno wants to scope a feature before building it.
argument-hint: <feature or idea>
---

1. Read `docs/domain-model.md`, the relevant `docs/ideas/` and `docs/decisions/`, and existing specs.
2. Pick the next number: highest `NNN` in `docs/specs/` + 1.
3. Write `docs/specs/NNN-short-name.md` from [template.md](template.md). Keep it under a page. Prefer a thin slice a gardener can try end to end over a complete feature.
4. Make each acceptance criterion observable and testable. It becomes a test during `/implement`.
5. Ask questions that block building in the chat; don't park them in the spec.
6. Leave the status at `draft`. Bruno sets it to `ready`.
