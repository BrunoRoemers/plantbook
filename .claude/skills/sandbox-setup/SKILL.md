---
name: sandbox-setup
description: Prepare this Linux sandbox to run PlantBook, start the dev server, and check pages in a headless browser with Playwright. Use in a fresh sandbox, when asked to run or screenshot the app, or before walking a flow at phone width.
---

Run everything from the repo root.

## 1. System tools
A fresh sandbox may lack `mount`, `node` and `npm`:

```bash
command -v mount && command -v node && command -v npm \
  || { sudo apt-get update && sudo apt-get install -y mount nodejs npm; }
```

## 2. Own node_modules
Why: see the `sandbox-quirks` rule. Bind-mount a sandbox-only directory over the repo's `node_modules`, and persist the mount for every later command:

```bash
REPO=$(git rev-parse --show-toplevel)
OWN="$HOME/$(basename "$REPO")-node_modules"
mkdir -p "$OWN" "$REPO/node_modules"
LINE="mountpoint -q '$REPO/node_modules' || sudo mount --bind '$OWN' '$REPO/node_modules'"
grep -qF "$LINE" /etc/sandbox-persistent.sh || echo "$LINE" >> /etc/sandbox-persistent.sh
eval "$LINE"
mountpoint node_modules   # must say "is a mountpoint" before going on
```

## 3. Dependencies
```bash
npm ci
npx playwright install --with-deps chromium
```

`--with-deps` also installs the system libraries Chromium needs. They don't survive a fresh sandbox, even though the browser download in the home directory does.

## 4. Dev server
Run in the background and wait for `Ready`:

```bash
npm run dev    # http://localhost:3000
```

## 5. Look at a page
```bash
node .claude/skills/sandbox-setup/smoke.mjs [url] [screenshot.png]
```
It prints the HTTP status and title, and saves a full-page, phone-sized screenshot (iPhone 13). Defaults: `http://localhost:3000`, written to the current directory as `smoke.png`. Save screenshots in the scratchpad rather than the repo, then read the image to check it.
