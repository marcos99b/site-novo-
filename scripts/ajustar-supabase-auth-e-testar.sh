#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "🔎 Verificando .env.local..."
if [ ! -f .env.local ]; then
  echo "❌ Arquivo .env.local não encontrado na raiz do projeto."
  echo "➡️  Copie ENV-EXAMPLE.md para .env.local e preencha: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY."
  exit 1
fi

echo "📦 Instalando dependências (pnpm se disponível, senão npm)..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --prefer-offline || pnpm install
else
  npm install --no-audit --no-fund
fi

echo "🔧 Configurando Supabase Auth (desabilitar confirmação de e-mail, habilitar signups, redirect URLs)..."
node scripts/desabilitar-email-confirmation.js || true

if [ -f scripts/configurar-auth-via-rpc.js ]; then
  echo "🔁 Ajuste complementar via RPC..."
  node scripts/configurar-auth-via-rpc.js || true
fi

echo "🧪 Testando fluxo real de signup/login..."
node scripts/testar-login-real.js || true

echo "🚀 Iniciando servidor de desenvolvimento em http://localhost:3000 ..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm dev
else
  npm run dev
fi


