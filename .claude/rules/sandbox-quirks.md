---
name: sandbox-quirks
description: Mac and Linux sandbox share one tree — the sandbox gets its own node_modules via a bind mount
type: rule
---

Bruno works on a Mac; this sandbox is Linux. Same files, different platform. His `node_modules`
has macOS native binaries and can't run here; a Linux install would break it for him. So the
sandbox keeps its own `node_modules` outside the tree, bind-mounted over his:

```bash
mkdir -p /home/agent/plantbook-node_modules
grep -q plantbook-node_modules /etc/sandbox-persistent.sh || echo 'mountpoint -q /Users/bruno/repos/plantbook/node_modules || sudo mount --bind /home/agent/plantbook-node_modules /Users/bruno/repos/plantbook/node_modules' >> /etc/sandbox-persistent.sh
```

`/etc/sandbox-persistent.sh` is sourced before every command, so the mount is (re)applied
automatically. It's per-instance: in a fresh sandbox, set it again, then `npm ci`.

With the mount in place, `npm install`/`npm ci` are safe here and only touch the sandbox copy. Only
the repo is shared with the Mac (virtiofs), so the mount itself never reaches him. Check with
`mountpoint node_modules` before installing; if it isn't mounted, stop rather than install into his tree.

After switching, `rm -rf .next/dev`: Turbopack caches module resolution there.
