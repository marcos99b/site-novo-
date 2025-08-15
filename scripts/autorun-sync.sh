#!/bin/zsh
set -euo pipefail

echo "==> Carregando .env.local (se existir)"
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
fi

echo "==> Garantindo variáveis de DB"
if [ -z "${DATABASE_URL:-}" ] && [ -n "${SUPABASE_DB_URL:-}" ]; then
  export DATABASE_URL="$SUPABASE_DB_URL"
  echo "   DATABASE_URL <- SUPABASE_DB_URL"
fi
if [ -z "${SUPABASE_DB_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  export SUPABASE_DB_URL="$DATABASE_URL"
  echo "   SUPABASE_DB_URL <- DATABASE_URL"
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Erro: DATABASE_URL/SUPABASE_DB_URL não configurado." >&2
  exit 2
fi

echo "==> Testando conexão ao Postgres"
node scripts/test-pg-connection.js || (echo "Falha na conexão ao DB" >&2; exit 3)

echo "==> Gerando Prisma Client"
pnpm prisma generate | cat

echo "==> Aplicando migrations (prisma migrate deploy)"
pnpm prisma migrate deploy | cat

echo "==> Verificando tabelas existentes"
node scripts/which-tables-exist.js || true

echo "==> Sincronizando produtos da CJ (lista de 6 produtos)"
node scripts/sync-cj-products-from-list.js || true

echo "==> Pronto. Teste: curl -s http://localhost:3000/api/products | head -c 300"

