# PlantBook

PlantBook connects gardeners through the plants they grow and give away: QR tags on spots → plant timelines → gifting → friends start growing too. We find out what works by trying things, so docs stay short and are hypotheses, not contracts.

## Docs
- `docs/ideas/`: raw input from Bruno. Read, never rewrite.
- `docs/domain-model.md`: vocabulary and data model. Use its terms in code, UI copy and URLs.
- `docs/decisions/NNN-*.md`: choices that are costly to reverse.
- `docs/specs/NNN-*.md`: one feature each.

## Workflow: idea → tested
1. **Scope.** `/spec` drafts a spec. Stop until Bruno sets it to `ready`.
2. **Decide.** If the spec forces a hard-to-reverse choice, propose a decision record first.
3. **Build.** `/implement NNN`: branch, tests first, code, check.
4. **Close.** Acceptance criteria ticked, docs updated, spec `done`.

## Rules
- Build what the spec says. New ideas go in the spec's "Later" section, not into the code.
- Ask when a spec is ambiguous instead of guessing.
- Mobile-first: tags get scanned outside, on any phone.
- No account required for anything a tag holder does.

## Commands
- `npm run dev`: http://localhost:3000
- `npm run check`: typecheck + lint + Vitest
- `npm run test:e2e`: Playwright tests in `e2e/` at iPhone 13 size (starts the dev server if needed)
- Setting up the sandbox, running the app, Playwright screenshots: `sandbox-setup` skill

## Next.js
@../AGENTS.md
