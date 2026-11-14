---
name: upgrade-deps
description: Upgrade npm dependencies, clear vulnerability warnings that matter, and prove the app still works. Use when asked to upgrade packages, update dependencies, or fix npm audit warnings.
---

Goal: no advisories in code that runs in production; ideally every package at its latest version.

## Rules
- **Production vs tooling.** Judge an advisory by whether its code runs in the deployed app, not by `dependencies` vs `devDependencies`. If it only affects CLI, build, lint or test tooling, it's acceptable to leave. If it affects production code, fix it, or raise it if you can't.
- **No `overrides`, and no hand-edits to the lockfile.** If only an override would fix it, leave it and report it.
- **Never run `npm audit fix --force`.** Its "fixes" are often downgrades.
- **No prereleases** unless asked.
- **Keep each specifier's style.** Exact pins stay exact (`--save-exact`), and bare ranges like `^4` stay bare. Check `git diff package.json`.

## Steps
1. `npm outdated` and `npm audit`.
2. Upgrade the direct dependencies to latest.
3. `npm ls`: peer conflicts show up as `invalid`, because `npm install` doesn't fail on them. Step back to the newest version that fits, and narrow the range so the next upgrade doesn't overshoot. Keep packages that release together on matching versions.
4. Trace each remaining advisory to its root package and the direct dependency that pulls it in (`npm ls <pkg>`). Decide: is it fixable with a stable upgrade, does it reach production, is a fix coming upstream?
5. Verify: `npm run check`, `npm run test:e2e`, `npm run build`, and call the API routes on the dev server. If something fails, find out whether the upgrade caused it before you fix it.
6. Report: majors upgraded, packages held back (and why), and the remaining advisories (root cause, direct dependency, production or tooling, upstream status).
