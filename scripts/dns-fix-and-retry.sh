#!/bin/zsh
set -euo pipefail

HOST="${1:-db.vqpumetbhgqdpnskgbvr.supabase.co}"

echo "==> Testando resolução DNS para $HOST"
if command -v dig >/dev/null 2>&1; then
  dig +short "$HOST" || true
fi
if ! ping -c1 -W1 "$HOST" >/dev/null 2>&1; then
  echo "DNS falhou. Tentando setar DNS do Wi-Fi para 1.1.1.1 8.8.8.8 (pode pedir senha)."
  if networksetup -listallnetworkservices | grep -qi "Wi-Fi"; then
    sudo networksetup -setdnsservers "Wi-Fi" 1.1.1.1 8.8.8.8 || true
  fi
  sleep 1
fi

echo "==> Retestando resolução"
if ! ping -c1 -W2 "$HOST" >/dev/null 2>&1; then
  echo "Ainda sem DNS. Verifique sua rede/VPN/Firewall." >&2
  exit 2
fi

echo "==> Testando conexão Postgres"
node scripts/test-pg-connection.js

echo "OK"

