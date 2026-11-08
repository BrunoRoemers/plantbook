# Testing

- Test first: write a failing test for an acceptance criterion, see it fail, then write the code that makes it pass.
- Test behaviour through public interfaces (pages, server actions, data functions), not implementation details.
- Unit and integration tests: Vitest, next to the code as `*.test.ts(x)`.
- End to end: Playwright in `e2e/`, at a phone viewport, for flows a gardener walks through (e.g. scanning a tag).
- Work is done when `npm run check` and the relevant e2e tests pass.
