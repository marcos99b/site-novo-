#!/bin/zsh
set -euo pipefail

HOST="${1:-}"
PREFERRED_DNS=(1.1.1.1 8.8.8.8)

echo "== Aplicando DNS preferidos no Wi‑Fi: ${PREFERRED_DNS[@]} (pode pedir senha)"
if networksetup -listallnetworkservices | grep -qi "Wi-Fi"; then
  sudo networksetup -setdnsservers "Wi-Fi" ${PREFERRED_DNS[@]}
else
  echo "Wi‑Fi não encontrado pelo networksetup. Ajuste manualmente nas Preferências do Sistema."
fi

echo "== Limpando caches DNS"
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder || true

if [ -n "$HOST" ]; then
  echo "== Retestando resolução/porta"
  ping -c1 -W1000 "$HOST" >/dev/null 2>&1 && echo "   ping OK" || echo "   ping FAIL"
  if command -v nc >/dev/null 2>&1; then
    nc -vz "$HOST" 5432 >/dev/null 2>&1 && echo "   porta 5432 ABERTA" || echo "   porta 5432 FECHADA"
  fi
fi

echo "== Concluído"

