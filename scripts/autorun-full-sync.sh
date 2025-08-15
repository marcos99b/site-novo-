#!/bin/zsh
set -euo pipefail

echo "==> Autorun Full Sync (Supabase + Prisma + CJ + Stripe + Dev)"

# 0) Restaurar credenciais do Keychain se script existir
if [ -x scripts/restore-supabase-creds-from-keychain.sh ]; then
  ./scripts/restore-supabase-creds-from-keychain.sh || true
fi

# 1) Exportar env do .env.local
set -a
[ -f .env.local ] && source .env.local || true
set +a

# 2) Aplicar URLs do banco via pooler, se PROJECT_REF e PASS estiverem presentes
if [ -n "${SUPABASE_PROJECT_REF:-}" ] && [ -n "${SUPABASE_DB_PASSWORD:-}" ] && [ -x scripts/apply-supabase-db-urls.sh ]; then
  echo "==> Aplicando URLs do DB pelo pooler"
  ./scripts/apply-supabase-db-urls.sh "$SUPABASE_PROJECT_REF" "$SUPABASE_DB_PASSWORD" || true
  set -a; source .env.local; set +a
fi

# 3) DNS diagnose e tentativa de correção (usa derivação do host da URL)
if [ -x scripts/dns/autorun.sh ]; then
  host=""
  if [ -n "${DATABASE_URL:-}" ]; then host=$(echo "$DATABASE_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'); fi
  if [ -z "$host" ] && [ -n "${SUPABASE_DB_URL:-}" ]; then host=$(echo "$SUPABASE_DB_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'); fi
  if [ -n "$host" ]; then
    ./scripts/dns/autorun.sh "$host" || true
  fi
fi

# 4) Aguardar DB conectar (POOLER ou DIRECT)
echo "==> Testando conexão ao DB até ficar OK"
attempt=0
until node scripts/test-pg-connection.js; do
  attempt=$((attempt+1))
  if [ $attempt -ge 10 ]; then
    echo "❌ Sem conexão após $attempt tentativas. Saindo." >&2
    exit 2
  fi
  echo "⏳ Aguardando 8s e tentando novamente ($attempt/10)"
  sleep 8
done

echo "==> Prisma generate"
pnpm prisma generate | cat

echo "==> Prisma migrate deploy"
pnpm prisma migrate deploy | cat

echo "==> Sincronizando 6 produtos (CJ) conforme lista"
node scripts/sync-cj-products-from-list.js | cat

# 5) Stripe (opcional): criar produtos/preços se STRIPE_SECRET_KEY existir e stripe CLI estiver ok
if [ -n "${STRIPE_SECRET_KEY:-}" ] && command -v stripe >/dev/null 2>&1; then
  if [ -f scripts/stripe-create-products.sh ]; then
    echo "==> Criando produtos/preços na Stripe"
    bash scripts/stripe-create-products.sh | cat || true
  fi
fi

# 6) Liberar porta e iniciar dev server (se não estiver rodando)
if [ -x scripts/fix-dev-port.sh ]; then
  ./scripts/fix-dev-port.sh || true
fi
echo "==> Iniciando dev server (pnpm dev)"
pnpm dev | cat


