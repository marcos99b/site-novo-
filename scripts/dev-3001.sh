#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if command -v pnpm >/dev/null 2>&1; then
  pnpm dev -p 3001
else
  npm run dev -- -p 3001
fi


