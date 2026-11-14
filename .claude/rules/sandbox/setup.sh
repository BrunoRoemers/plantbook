#!/usr/bin/env bash
# Sandbox setup, see setup.md. Exits 1 if node_modules can't be mounted; later problems show up as errors or missing lines.

# Circuit breaker: only run inside the sandbox, where the user is "agent". Anywhere else (e.g. claude opened
# on the Mac by accident) this script would apt-get install, bind-mount and start postgres on the host.
[ "$(whoami)" = "agent" ] || { echo "setup skipped: not in the sandbox (whoami is $(whoami))"; exit 0; }

cd "$(dirname "$0")/../../.." || exit 0
start=$(date +%s%N)

# Another apt-get (e.g. at sandbox boot) may hold apt's lock. Retry update+install with exponential
# backoff (1+2+4+...+64s, about 2 minutes in total) until it's released.
apt_install() {
  local delay=1 attempt
  for attempt in 1 2 3 4 5 6 7 8; do
    sudo apt-get update -qq && sudo apt-get install -y -qq "$@" >/dev/null && return 0
    [ "$attempt" -lt 8 ] || break
    echo "apt busy or failed, retrying in ${delay}s..."
    sleep "$delay"; delay=$((delay * 2))
  done
  echo "FAILED: apt_install $*"
  return 1
}

# node_modules: the sandbox's own, mounted over the repo's. Stop if that fails.
command -v mount >/dev/null || apt_install mount
if ! mountpoint -q node_modules; then
  mkdir -p ~/.sandbox/node_modules node_modules
  sudo mount --bind ~/.sandbox/node_modules node_modules
fi
mountpoint -q node_modules || { echo "FAILED: node_modules is not a mountpoint"; exit 1; }

# Node: the major version from package.json "engines"
node_major=$(grep -oP '"node": "\K[0-9]+' package.json)
[ "$(node -v 2>/dev/null | grep -oP '^v\K[0-9]+')" = "$node_major" ] \
  || { echo "installing node $node_major..."; apt_install "nodejs-$node_major" npm; }
echo "node $(node -v)"

# Postgres: pinned to 18, same as Neon
postgres --version 2>/dev/null | grep -q ' 18\.' \
  || { echo "installing postgres 18..."; apt_install postgresql-18; }
[ -d ~/pgdata ] || initdb -D ~/pgdata -U postgres --auth=trust >/dev/null
pg_ctl -D ~/pgdata status >/dev/null \
  || pg_ctl -D ~/pgdata -o "-k /tmp" -l ~/.sandbox/postgres.log -w start >/dev/null
psql -h /tmp -U postgres >/dev/null <<'SQL'
SELECT 'CREATE ROLE plantbook LOGIN PASSWORD ''plantbook''' WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'plantbook')\gexec
SELECT 'CREATE DATABASE plantbook OWNER plantbook' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'plantbook')\gexec
SELECT 'CREATE DATABASE plantbook_test OWNER plantbook' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'plantbook_test')\gexec
SQL
echo "postgres $(postgres --version | grep -oP '\d+\.\d+') on localhost:5432"

# Playwright: comes with npm, so install dependencies if it's missing. Chromium must launch.
[ -d node_modules/@playwright/test ] || { echo "installing dependencies..."; npm ci --loglevel=error >/dev/null; }
launches() { node -e "require('@playwright/test').chromium.launch().then(b => b.close())" 2>/dev/null; }
launches || {
  echo "installing playwright..."
  # NEEDS: sbx policy allow network cdn.playwright.dev
  npx playwright install --with-deps chromium >/dev/null
  launches || echo "FAILED: chromium does not launch"
}
echo "playwright $(node -p "require('@playwright/test/package.json').version")"

echo "setup ready in $(( ($(date +%s%N) - start) / 1000000 ))ms"
