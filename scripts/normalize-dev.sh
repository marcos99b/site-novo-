#!/bin/zsh
set -euo pipefail

ROOT_DIR=$(pwd)
ENV_FILE=".env.local"
touch "$ENV_FILE"

echo "==> Backup do .env.local"
cp -f "$ENV_FILE" "$ENV_FILE.bak" 2>/dev/null || true

upsert() {
  local k="$1"; shift
  local v="$1"; shift
  if grep -q "^${k}=" "$ENV_FILE" 2>/dev/null; then
    sed -i '' -e "s|^${k}=.*|${k}=${v}|" "$ENV_FILE"
  else
    echo "${k}=${v}" >> "$ENV_FILE"
  fi
}

echo "==> Normalizando NEXT_PUBLIC_SITE_URL para http://localhost:3000"
upsert NEXT_PUBLIC_SITE_URL http://localhost:3000

echo "==> Removendo linhas duplicadas no .env.local (se houver)"
tmpenv=$(mktemp)
awk '!seen[$0]++' "$ENV_FILE" > "$tmpenv" && mv "$tmpenv" "$ENV_FILE"

echo "==> Encerrando processos na porta 3000/3001 e processos Next.js antigos"
for p in 3000 3001; do
  ids=$(lsof -ti :$p 2>/dev/null || true)
  if [ -n "$ids" ]; then kill -9 $ids 2>/dev/null || true; fi
done
pkill -f "next dev" 2>/dev/null || true
pkill -f "pnpm dev" 2>/dev/null || true
pkill -f "node .*next" 2>/dev/null || true

echo "==> Exportando variáveis"
set -a; source .env.local; set +a

echo "==> Subindo dev em background na porta 3000"
(pnpm dev -p 3000 >/dev/null 2>&1 &) || true

echo "==> Aguardando servidor responder..."
tries=0
until curl -sS http://localhost:3000/ >/dev/null 2>&1; do
  tries=$((tries+1))
  if [ $tries -ge 20 ]; then
    echo "⚠️  3000 não respondeu. Tentando 3001."
    upsert NEXT_PUBLIC_SITE_URL http://localhost:3001
    (pnpm dev -p 3001 >/dev/null 2>&1 &) || true
    sleep 2
    if curl -sS http://localhost:3001/ >/dev/null 2>&1; then
      echo "✅ Dev ativo em http://localhost:3001"
      exit 0
    else
      echo "❌ Não foi possível iniciar o servidor. Verifique logs com 'pnpm dev'"
      exit 2
    fi
  fi
  sleep 1
done

echo "✅ Dev ativo em http://localhost:3000"


