#!/usr/bin/env bash
set -euo pipefail

# Configura Stripe em modo Live localmente (.env.local) e cria webhook via stripe CLI
# Requisitos: stripe CLI instalado e autenticado (stripe login)

if ! command -v stripe >/dev/null 2>&1; then
  echo "Erro: stripe CLI não encontrada. Instale em https://stripe.com/docs/stripe-cli" >&2
  exit 1
fi

read -r -p "Cole sua STRIPE_SECRET_KEY (sk_live_...): " STRIPE_SECRET_KEY
read -r -p "Cole sua NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...): " NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV_FILE=".env.local"
touch "$ENV_FILE"

awk -v RS='\n' '1' "$ENV_FILE" >/dev/null 2>&1 || true

upsert_var() {
  local key="$1"; shift
  local value="$1"; shift
  if grep -q "^${key}=" "$ENV_FILE"; then
    sed -i '' -e "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert_var STRIPE_SECRET_KEY "$STRIPE_SECRET_KEY"
upsert_var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"

# Definir SITE_URL local (porta 3002)
upsert_var NEXT_PUBLIC_SITE_URL "http://localhost:3002"
upsert_var SITE_URL "http://localhost:3002"

echo "Criando webhook (checkout.session.completed, payment_intent.payment_failed) apontando para http://localhost:3002/api/stripe/webhook ..."
WEBHOOK_OUT=$(stripe webhook create \
  --url "http://localhost:3002/api/stripe/webhook" \
  --api-key "$STRIPE_SECRET_KEY" \
  --enabled-events checkout.session.completed \
  --enabled-events payment_intent.payment_failed)

WHSEC=$(echo "$WEBHOOK_OUT" | grep -E 'whsec_' -o || true)
if [ -z "$WHSEC" ]; then
  echo "Atenção: não foi possível extrair STRIPE_WEBHOOK_SECRET automaticamente. Configure manualmente depois." >&2
else
  upsert_var STRIPE_WEBHOOK_SECRET "$WHSEC"
  echo "STRIPE_WEBHOOK_SECRET salvo no .env.local"
fi

echo "Pronto. Verifique .env.local e reinicie o dev server."


