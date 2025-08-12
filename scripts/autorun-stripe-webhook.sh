#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v brew >/dev/null 2>&1; then
  echo "❌ Homebrew não encontrado. Instale o Homebrew primeiro: https://brew.sh" >&2
  exit 1
fi

if ! command -v stripe >/dev/null 2>&1; then
  echo "📦 Instalando Stripe CLI via Homebrew..."
  brew install stripe/stripe-cli/stripe >/dev/null
fi

# Obter STRIPE_SECRET_KEY do .env.local
if [ ! -f .env.local ]; then
  echo "❌ .env.local não encontrado na raiz do projeto" >&2
  exit 1
fi

SECRET_KEY=$(grep -E '^STRIPE_SECRET_KEY=' .env.local | cut -d= -f2- || true)
if [ -z "${SECRET_KEY:-}" ]; then
  echo "❌ STRIPE_SECRET_KEY não definido no .env.local" >&2
  exit 1
fi

echo "🔐 Efetuando login na Stripe CLI em modo interativo..."
printf "%s\n" "$SECRET_KEY" | stripe login --interactive >/dev/null

echo "📡 Iniciando stripe listen e capturando STRIPE_WEBHOOK_SECRET..."
rm -f .stripe_listen.log .stripe_listen.pid || true
nohup stripe listen --forward-to localhost:3000/api/stripe/webhook --print-secret --skip-verify > .stripe_listen.log 2>&1 &
echo $! > .stripe_listen.pid

# Aguardar o CLI emitir o segredo
for i in {1..20}; do
  if grep -q "whsec_" .stripe_listen.log; then
    break
  fi
  sleep 0.5
done

WHSEC=$(grep -m1 -Eo 'whsec_[A-Za-z0-9]+' .stripe_listen.log || true)
if [ -z "${WHSEC:-}" ]; then
  echo "❌ Não foi possível capturar o STRIPE_WEBHOOK_SECRET. Veja .stripe_listen.log" >&2
  exit 1
fi

# Atualizar/Inserir STRIPE_WEBHOOK_SECRET no .env.local
if grep -q '^STRIPE_WEBHOOK_SECRET=' .env.local; then
  sed -i '' "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=${WHSEC}|" .env.local
else
  echo "STRIPE_WEBHOOK_SECRET=${WHSEC}" >> .env.local
fi

echo "✅ STRIPE_WEBHOOK_SECRET configurado: ${WHSEC}"
echo "📝 PID do listener salvo em .stripe_listen.pid (pare com: kill \$(cat .stripe_listen.pid))"


