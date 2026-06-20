#!/usr/bin/env bash
#
# shot.sh - build, serve, and (optionally) screenshot the lab from a PRODUCTION
# server. Always builds + `npm start` on purpose: in dev mode Next injects
# Tailwind via JavaScript, so a headless screenshot fires before the CSS lands
# and the page comes out unstyled. Production serves a real linked stylesheet.
#
# Usage:
#   scripts/shot.sh                          # build, start, wait for ready, keep running
#   scripts/shot.sh lab lab/rate-limiter     # also screenshot these routes into .shots/
#   SKIP_BUILD=1 scripts/shot.sh lab         # reuse the existing .next build
#   PORT=3001 scripts/shot.sh                # serve on a different port
#   STOP=1 scripts/shot.sh lab               # stop the server after capturing
#
# Screenshots land in .shots/ (gitignored). The server is left running so a
# browser tool (e.g. Playwright MCP) can drive the live, interactive sims;
# stop it with the printed `kill` command, or pass STOP=1.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
OUTDIR="$ROOT/.shots"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
mkdir -p "$OUTDIR"

if [[ "${SKIP_BUILD:-0}" != "1" ]]; then
  echo "▸ building production bundle…"
  npm run build
fi

echo "▸ starting production server on port ${PORT}"
nohup env PORT="$PORT" npm start > /tmp/labshot-server.log 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null || true

echo -n "▸ waiting for server"
ready=0
for _ in $(seq 1 40); do
  if [[ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT/lab" 2>/dev/null)" == "200" ]]; then
    ready=1
    echo " - ready"
    break
  fi
  echo -n "."
  sleep 1
done
if [[ "$ready" != "1" ]]; then
  echo " - timed out. Last server log:"
  tail -n 20 /tmp/labshot-server.log
  kill "$SERVER_PID" 2>/dev/null || true
  exit 1
fi

# capture any routes passed as arguments
if [[ $# -gt 0 ]]; then
  if [[ ! -x "$CHROME" ]]; then
    echo "⚠ Chrome not found at: $CHROME"
    echo "  set CHROME=/path/to/chrome to capture screenshots."
  else
    for route in "$@"; do
      name="${route//\//_}"
      [[ -z "$name" ]] && name="home"
      out="$OUTDIR/$name.png"
      "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
        --force-device-scale-factor=1 --virtual-time-budget=2500 \
        --window-size=1440,2400 --screenshot="$out" \
        "http://localhost:$PORT/$route" >/dev/null 2>&1
      echo "  📸 /$route -> ${out#$ROOT/}"
    done
  fi
fi

if [[ "${STOP:-0}" == "1" ]]; then
  kill "$SERVER_PID" 2>/dev/null || true
  echo "▸ server stopped."
else
  echo
  echo "▸ server running at http://localhost:$PORT (pid $SERVER_PID)"
  echo "  stop it with:  kill $SERVER_PID"
fi
