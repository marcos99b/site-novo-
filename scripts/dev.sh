#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Porta padrão via env ou 3000
PORT_DEFAULT="${PORT:-3000}"
PORT_SELECTED="$PORT_DEFAULT"

# Se a porta 3000 estiver ocupada e nenhuma PORT foi definida explicitamente, usar 3001
if [ "${PORT:-}" = "" ]; then
  if lsof -i :3000 -sTCP:LISTEN >/dev/null 2>&1; then
    PORT_SELECTED=3001
  fi
fi

echo "Iniciando Next.js na porta $PORT_SELECTED"

if command -v pnpm >/dev/null 2>&1; then
  pnpm exec next dev -p "$PORT_SELECTED"
else
  npx --yes next dev -p "$PORT_SELECTED"
fi


