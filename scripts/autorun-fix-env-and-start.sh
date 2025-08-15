#!/bin/zsh
set -euo pipefail

echo "==> Restaurando credenciais do Supabase do Keychain"
chmod +x scripts/restore-supabase-creds-from-keychain.sh
./scripts/restore-supabase-creds-from-keychain.sh

echo "==> Exportando variáveis"
set -a
source .env.local
set +a

echo "==> Liberando porta 3000"
chmod +x scripts/fix-dev-port.sh
./scripts/fix-dev-port.sh

echo "==> (Opcional) Autorun Stripe login se não houver STRIPE_WEBHOOK_SECRET"
if ! grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local 2>/dev/null; then
  chmod +x scripts/autorun-stripe-login.sh
  ./scripts/autorun-stripe-login.sh || true
fi

echo "==> Iniciando dev server"
pnpm dev | cat

