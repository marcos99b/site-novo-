#!/bin/zsh
set -euo pipefail

# Usage: apply-supabase-creds-and-sync.sh "ANON_KEY" "SERVICE_ROLE_KEY" "DATABASE_URL"

ANON_KEY="$1"
SERVICE_KEY="$2"
DB_URL="$3"

ENV_FILE=".env.local"
touch "$ENV_FILE"

upsert_var() {
  local key="$1"; shift
  local value="$1"; shift
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i '' -e "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

echo "==> Derivando NEXT_PUBLIC_SUPABASE_URL a partir do DATABASE_URL"
host=$(echo "$DB_URL" | sed -E 's#.*://[^@]+@([^/:]+).*#\1#')
proj=$(echo "$host" | sed -E 's#^db\.([^.]+)\.supabase\.co$#\1#')
if [[ -z "$proj" ]]; then
  echo "Erro: não foi possível derivar o projeto do Supabase a partir de $host" >&2
  exit 2
fi
SUPABASE_URL="https://${proj}.supabase.co"

echo "==> Gravando variáveis no .env.local"
upsert_var NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
upsert_var NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY"
upsert_var SUPABASE_SERVICE_ROLE_KEY "$SERVICE_KEY"
upsert_var DATABASE_URL "$DB_URL"
upsert_var SUPABASE_DB_URL "$DB_URL"

echo "==> Exportando variáveis"
set -a
source .env.local
set +a

echo "==> Testando conexão ao Postgres"
node scripts/test-pg-connection.js

echo "==> Gerando Prisma Client"
pnpm prisma generate | cat

echo "==> Aplicando migrations"
pnpm prisma migrate deploy | cat

echo "==> Finalizado. Você pode rodar ./scripts/autorun-sync.sh para importar produtos da CJ."
echo "   (Ou iniciar o dev server: ./scripts/fix-dev-port.sh && pnpm dev)"

