#!/bin/zsh
set -euo pipefail

ENV_FILE=".env.local"
touch "$ENV_FILE"

upsert_var() {
  local key="$1"; shift
  local value="$1"; shift
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i '' -e "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

echo "==> Configurando credenciais do Supabase no .env.local"
read -r "SUPABASE_URL?NEXT_PUBLIC_SUPABASE_URL (https://xxxxx.supabase.co): "
read -r "SUPABASE_ANON?NEXT_PUBLIC_SUPABASE_ANON_KEY (opcional): "
read -r "SUPABASE_SERVICE?SUPABASE_SERVICE_ROLE_KEY: "
read -r "PG_URL?DATABASE_URL/SUPABASE_DB_URL (postgres://...): "

if [ -n "$SUPABASE_URL" ]; then
  upsert_var NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
fi
if [ -n "$SUPABASE_ANON" ]; then
  upsert_var NEXT_PUBLIC_SUPABASE_ANON_KEY "$SUPABASE_ANON"
fi
if [ -n "$SUPABASE_SERVICE" ]; then
  upsert_var SUPABASE_SERVICE_ROLE_KEY "$SUPABASE_SERVICE"
fi
if [ -n "$PG_URL" ]; then
  upsert_var DATABASE_URL "$PG_URL"
  upsert_var SUPABASE_DB_URL "$PG_URL"
fi

echo "==> Testando conexão ao Postgres"
# Exportar variáveis recém gravadas
set -a
source .env.local
set +a

node scripts/test-pg-connection.js || (echo "Falha na conexão; verifique a URL e rede." >&2; exit 2)

echo "==> Pronto. Variáveis salvas em .env.local"

