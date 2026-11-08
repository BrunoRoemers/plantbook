---
name: sandbox-setup
description: Prepare this Linux sandbox to run PlantBook, start the dev server, and check pages in a headless browser with Playwright. Use in a fresh sandbox, when asked to run or screenshot the app, or before walking a flow at phone width.
---

## 1. Dependencies
The sandbox needs its own `node_modules` (see the `sandbox-quirks` rule). Run `mountpoint node_modules` first. If it isn't a mountpoint, set up the mount as that rule describes; never install into Bruno's tree.

```bash
npm ci
npx playwright install --with-deps chromium
```

Browsers are cached in the home directory, but the system libraries they need (installed with `--with-deps`) don't survive a fresh sandbox. If Chromium fails with `error while loading shared libraries`, rerun the install. If apt reports `dpkg was interrupted`, run `sudo dpkg --configure -a` first.

## 2. Dev server
Run in the background and wait for `Ready`:

```bash
npm run dev    # http://localhost:3000
```

For Bruno to open it from the Mac, start it with `npm run dev -- -H 0.0.0.0` and ask Bruno to publish the port (`sbx ports <sandbox-name> --publish 3000:3000`).

## 3. Look at a page
```bash
node .claude/skills/sandbox-setup/smoke.mjs [url] [screenshot.png]
```
It prints the HTTP status and title, and saves a phone-sized screenshot (390×844). Defaults: `http://localhost:3000`, written to the current directory as `smoke.png`. Save screenshots in the scratchpad rather than the repo, then read the image to check it.
