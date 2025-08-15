#!/bin/zsh
set -euo pipefail

ENV_FILE=.env.local
touch "$ENV_FILE"

upsert() {
  local k="$1"; shift
  local v="$1"; shift
  if grep -q "^${k}=" "$ENV_FILE" 2>/dev/null; then
    sed -i '' -e "s|^${k}=.*|${k}=${v}|" "$ENV_FILE"
  else
    echo "${k}=${v}" >> "$ENV_FILE"
  fi
}

echo "==> Matando processos na porta 3000/3001"
for p in 3000 3001; do
  ids=$(lsof -ti :$p 2>/dev/null || true)
  if [ -n "$ids" ]; then kill -9 $ids 2>/dev/null || true; fi
done
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "node .*next" 2>/dev/null || true

echo "==> Ajustando SITE_URL para 3000"
upsert NEXT_PUBLIC_SITE_URL http://localhost:3000

set -a; source .env.local; set +a

echo "==> Subindo dev em 3000 (fallback 3001)"
if pnpm dev -p 3000 | cat; then
  exit 0
else
  echo "==> 3000 falhou, tentando 3001"
  upsert NEXT_PUBLIC_SITE_URL http://localhost:3001
  pnpm dev -p 3001 | cat
fi


