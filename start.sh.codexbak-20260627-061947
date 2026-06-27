#!/bin/bash
export PATH="/root/.bun/bin:$PATH"
# Kill any leftover processes on port 3001
fuser -k 3001/tcp 2>/dev/null || true
sleep 2
# Run from the BUILT output so wrangler uses dist/server/wrangler.json (main=index.js),
# NOT the root wrangler.jsonc (main=src/server.ts, raw TypeScript).
cd /var/www/hyper-form-labs/dist/server
exec node --no-warnings --experimental-vm-modules \
  /var/www/hyper-form-labs/node_modules/wrangler/wrangler-dist/cli.js \
  dev --port 3001 --ip 127.0.0.1 --no-bundle
