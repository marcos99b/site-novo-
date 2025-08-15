#!/bin/zsh
set -euo pipefail

KEY="$1"  # sk_live_...

ENV_FILE=.env.local
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

echo "==> Gravando STRIPE_SECRET_KEY (LIVE) em .env.local"
upsert_var STRIPE_SECRET_KEY "$KEY"

echo "==> Exportando env"
set -a; source .env.local; set +a

echo "==> Sincronizando produtos/preços da Stripe a partir do Supabase"
node scripts/stripe-sync-from-supabase.js | cat || node scripts/stripe-sync-via-cli.js | cat

echo "==> Liberando porta 3000 e reiniciando dev"
if [ -x scripts/fix-dev-port.sh ]; then ./scripts/fix-dev-port.sh | cat; fi
pnpm dev | cat


