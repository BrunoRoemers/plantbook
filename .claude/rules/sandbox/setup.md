# Sandbox setup

- `.claude/rules/sandbox/setup.sh` runs automatically at every session start via the `SessionStart` hook in `.claude/settings.json`.
- Everything in that script must be idempotent: running it any number of times must leave the sandbox in the same state, with only short status output.
- Do not edit `setup.sh` without explicit confirmation from the user. Propose the change and wait for a yes first.

## Context

The host is a Mac and this sandbox is Linux, with the repo shared. The host's `node_modules` has macOS binaries, so the sandbox bind-mounts its own over it; never install into the tree unless `mountpoint node_modules` says it's mounted. `.next` gets the same treatment, so the sandbox's and the Mac's dev servers don't corrupt each other's Turbopack cache.
