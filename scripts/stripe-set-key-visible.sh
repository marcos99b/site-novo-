#!/usr/bin/env bash
set -euo pipefail

# Este script permite digitar a STRIPE_SECRET_KEY de forma VISÍVEL e grava no .env.local.
# Depois, executa o autorun para criar/atualizar os produtos no Stripe.

PROJECT_ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT_DIR"

read -r -p "Digite a sua STRIPE_SECRET_KEY (visível): " STRIPE_SECRET_KEY

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Chave vazia. Abortando." >&2
  exit 1
fi

touch .env.local
if grep -q '^STRIPE_SECRET_KEY=' .env.local; then
  # macOS sed
  sed -i '' -E "s|^STRIPE_SECRET_KEY=.*$|STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}|" .env.local
else
  printf "\nSTRIPE_SECRET_KEY=%s\n" "$STRIPE_SECRET_KEY" >> .env.local
fi

echo "STRIPE_SECRET_KEY salva em .env.local. Iniciando autorun..."
node scripts/stripe-autorun.js
echo "Concluído."



