---
name: implement
description: Implement a spec from docs/specs/ that has status ready, test-first, on its own branch. Use when Bruno asks to build or implement a spec.
argument-hint: <spec number>
---

1. Read the spec. If its status isn't `ready`, stop and say so. Read the domain model and decisions it touches. Check `node_modules/next/dist/docs/` before using a Next.js API.
2. Branch from `main`: `spec/NNN-short-name`.
3. Per acceptance criterion: write a failing test, run it and see it fail, write the code that makes it pass. Commit when green.
4. Run `npm run check`. For UI changes, run the app and walk the flow at phone width with Playwright (see the `sandbox-setup` skill), and look at the screenshots.
5. Close the spec: tick the criteria, add what came up under "Later", update the domain model or decisions if they changed, set the status to `done`.
6. Report what was built, the test results, and any deviation from the spec. Ask before pushing or opening a PR.
