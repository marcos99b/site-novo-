#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Liberando porta 3002 se ocupada..."
if lsof -n -i :3002 -sTCP:LISTEN >/dev/null 2>&1; then
  PID=$(lsof -n -i :3002 -sTCP:LISTEN -t | head -n1)
  kill -9 "$PID" || true
  sleep 1
fi

echo "Verificando variáveis do Stripe..."
missing=()
grep -q '^STRIPE_SECRET_KEY=' .env.local || missing+=(STRIPE_SECRET_KEY)
grep -q '^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=' .env.local || missing+=(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local || missing+=(STRIPE_WEBHOOK_SECRET)
if [ ${#missing[@]} -gt 0 ]; then
  echo "Faltam variáveis no .env.local: ${missing[*]}" >&2
  exit 1
fi

echo "Subindo Next.js em background na porta 3002..."
(
  npx --yes next dev -p 3002 >/tmp/next-dev.log 2>&1 &
  echo $! > /tmp/next-dev.pid
) 

echo "Aguardando servidor responder..."
for i in {1..30}; do
  if curl -sSf http://localhost:3002 >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Criando sessão de checkout..."
curl -sS -X POST http://localhost:3002/api/stripe/create-checkout \
  -H 'Content-Type: application/json' \
  --data '{"currency":"EUR","items":[{"name":"Teste Produto","amount_cents":1000,"quantity":1}]}'

echo
echo "Logs do Next em /tmp/next-dev.log (CTRL+C para parar manualmente; processo em /tmp/next-dev.pid)"


