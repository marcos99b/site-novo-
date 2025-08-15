#!/bin/zsh
set -euo pipefail

echo "==> Autorun Setup (Stripe + Supabase + CJ + Dev)"

# 0) Restaurar credenciais do Supabase do Keychain (se existirem)
if [ -x scripts/restore-supabase-creds-from-keychain.sh ]; then
  echo "==> Restaurando credenciais do Supabase do Keychain"
  ./scripts/restore-supabase-creds-from-keychain.sh || true
fi

# 1) Exportar env
set -a
[ -f .env.local ] && source .env.local || true
set +a

# 2) Derivar host do Supabase do DATABASE_URL/SUPABASE_DB_URL
derive_host() {
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "$DATABASE_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'
    return 0
  fi
  if [ -n "${SUPABASE_DB_URL:-}" ]; then
    echo "$SUPABASE_DB_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'
    return 0
  fi
  echo ""
}
HOST=$(derive_host)

# 3) Diagnóstico/correção DNS
if [ -n "$HOST" ] && [ -x scripts/dns/autorun.sh ]; then
  echo "==> DNS autorun para $HOST"
  ./scripts/dns/autorun.sh "$HOST" || true
fi

# 4) Testar conexão ao Postgres
DB_OK=0
if node scripts/test-pg-connection.js; then
  DB_OK=1
else
  echo "==> Aviso: ainda sem conexão ao Postgres. Continuando com fallback."
fi

# 5) Prisma + migrations (se DB ok)
if [ $DB_OK -eq 1 ]; then
  echo "==> Prisma generate"
  pnpm prisma generate | cat
  echo "==> Prisma migrate deploy"
  pnpm prisma migrate deploy | cat
fi

# 6) Importar produtos da CJ (se DB ok)
if [ $DB_OK -eq 1 ] && [ -x scripts/autorun-sync.sh ]; then
  echo "==> Sincronizando produtos da CJ"
  ./scripts/autorun-sync.sh || true
fi

# 7) Stripe: listener/login (se faltar secret)
if ! grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local 2>/dev/null; then
  if [ -x scripts/autorun-stripe-login.sh ]; then
    echo "==> Configurando Stripe CLI (login + webhook listener)"
    ./scripts/autorun-stripe-login.sh || true
  fi
fi

# 8) Liberar porta e iniciar dev server
if [ -x scripts/fix-dev-port.sh ]; then
  echo "==> Liberando porta 3000"
  ./scripts/fix-dev-port.sh || true
fi

echo "==> Iniciando dev server (pnpm dev)"
pnpm dev | cat


