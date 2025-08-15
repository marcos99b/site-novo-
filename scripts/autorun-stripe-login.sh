#!/bin/zsh
set -euo pipefail

echo "==> Verificando Stripe CLI"
if ! command -v stripe >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    echo "==> Instalando Stripe CLI via Homebrew"
    brew install stripe/stripe-cli/stripe
  else
    echo "Erro: Stripe CLI não encontrado e Homebrew não disponível. Instale manualmente: https://stripe.com/docs/stripe-cli"
    exit 1
  fi
fi

echo "==> Iniciando login no Stripe (abre o navegador)"
stripe login

echo "==> Iniciando listener do webhook e capturando o secret"
tmpfile=$(mktemp -t stripe-listen-XXXXXX)
stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret > "$tmpfile" 2>&1 &
listen_pid=$!

# Esperar o secret aparecer no arquivo
secret=""
for i in {1..50}; do
  if [ -s "$tmpfile" ]; then
    secret=$(head -n1 "$tmpfile" | tr -d '\r\n' | sed 's/.*\(whsec_[A-Za-z0-9]\+\).*/\1/')
    if [[ "$secret" == whsec_* ]]; then
      break
    fi
  fi
  sleep 0.2
done

if [[ -z "$secret" ]]; then
  echo "Erro: não foi possível capturar STRIPE_WEBHOOK_SECRET. O listener continua rodando (PID $listen_pid)."
  echo "Considere rodar: stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret"
  exit 1
fi

echo "==> Atualizando .env.local com STRIPE_WEBHOOK_SECRET"
touch .env.local
tmpenv=$(mktemp -t envlocal-XXXXXX)
grep -v '^STRIPE_WEBHOOK_SECRET=' .env.local > "$tmpenv" || true
echo "STRIPE_WEBHOOK_SECRET=$secret" >> "$tmpenv"
mv "$tmpenv" .env.local

echo "==> Pronto. Listener ativo (PID $listen_pid). Secret salvo em .env.local"
echo "   STRIPE_WEBHOOK_SECRET=$secret"

