#!/usr/bin/env bash
set -euo pipefail

# Detecta porta ativa local (3000 ou 3001)
if lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1; then
  PORT=3000
elif lsof -i :3001 -sTCP:LISTEN >/dev/null 2>&1; then
  PORT=3001
else
  PORT=3000
fi

BASE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:$PORT}"

curl -sS -X POST "$BASE_URL/api/products" \
  -H 'Content-Type: application/json' \
  -d '{"keyword": "magnetic charger"}' | jq . || true


