#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

ENV_FILE=".env.local"
[ -f "$ENV_FILE" ] || { echo "Arquivo .env.local não encontrado na raiz do projeto." >&2; exit 1; }

# Carregar variáveis do .env.local (sem imprimir)
set -a
. "$ENV_FILE"
set +a

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "STRIPE_SECRET_KEY ausente no .env.local" >&2
  exit 1
fi

# Verificar stripe CLI
if ! command -v stripe >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "Instalando Stripe CLI via Homebrew..."
    brew install stripe/stripe-cli/stripe
  else
    echo "Instale a Stripe CLI: https://stripe.com/docs/stripe-cli" >&2
    exit 1
  fi
fi

echo "Criando webhook Live para http://localhost:3002/api/stripe/webhook ..."
OUT=$(stripe webhook create \
  --url "http://localhost:3002/api/stripe/webhook" \
  --enabled-events checkout.session.completed \
  --enabled-events payment_intent.payment_failed \
  --api-key "$STRIPE_SECRET_KEY" 2>/dev/null || true)

WHSEC=$(printf '%s' "$OUT" | grep -Eo 'whsec_[A-Za-z0-9]+' | head -n1 || true)

if [ -z "$WHSEC" ]; then
  echo "Falha ao obter whsec. Saída da CLI:" >&2
  printf '%s\n' "$OUT" >&2
  exit 1
fi

# Persistir no .env.local
if grep -q '^STRIPE_WEBHOOK_SECRET=' "$ENV_FILE"; then
  sed -i '' -e "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=${WHSEC}|" "$ENV_FILE"
else
  echo "STRIPE_WEBHOOK_SECRET=${WHSEC}" >> "$ENV_FILE"
fi

echo "$WHSEC"


