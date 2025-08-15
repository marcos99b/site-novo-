#!/bin/zsh
set -euo pipefail

# Atualiza STRIPE_WEBHOOK_SECRET se ausente, garante STRIPE_SECRET_KEY, e cria/atualiza tabela de mapeamento de preço

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Erro: STRIPE_SECRET_KEY não definido no ambiente (.env.local)." >&2
  exit 2
fi

if ! grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local 2>/dev/null; then
  if command -v stripe >/dev/null 2>&1; then
    echo "==> Iniciando stripe listen para obter whsec (Ctrl+C depois)"
    stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret | sed -n '1p' | sed 's/^/STRIPE_WEBHOOK_SECRET=/' >> .env.local || true
  fi
fi

echo "OK"

