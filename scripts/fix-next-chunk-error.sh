#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PORT=3000

echo "🔎 Verificando processo na porta $PORT..."
PID=$(lsof -ti tcp:$PORT || true)
if [[ -n "${PID}" ]]; then
  echo "🛑 Matando processo Next (PID: $PID)"
  kill -9 $PID || true
  sleep 1
else
  echo "ℹ️  Nenhum processo ativo na porta $PORT"
fi

echo "🧹 Limpando cache do Next (.next)..."
rm -rf .next || true
mkdir -p .next

echo "📦 Garantindo dependências..."
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --prefer-offline --silent || true
else
  npm install --silent || true
fi

echo "🚀 Subindo servidor de desenvolvimento em http://localhost:$PORT ..."
npm run dev
