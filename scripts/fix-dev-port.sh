#!/bin/zsh
set -euo pipefail

echo "==> Verificando processos na porta 3000"
typeset -a pids
pids=(${(@f)$(lsof -ti :3000 2>/dev/null || true)})
if [ ${#pids[@]} -gt 0 ]; then
  echo "==> Finalizando PIDs: ${pids[@]}"
  kill -9 ${pids[@]} 2>/dev/null || true
else
  echo "==> Porta 3000 livre"
fi
echo "==> OK"

