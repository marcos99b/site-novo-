#!/bin/zsh
set -euo pipefail

HOST="${1:-}"

derive_host_from_env() {
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "$DATABASE_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'
    return 0
  fi
  if [ -n "${SUPABASE_DB_URL:-}" ]; then
    echo "$SUPABASE_DB_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'
    return 0
  fi
  return 1
}

if [ -z "$HOST" ]; then
  h=$(derive_host_from_env || true)
  HOST="${h:-db.example.supabase.co}"
fi

echo "== DNS Diagnose para: $HOST"
echo "— Network Service Ativos:"
networksetup -listallnetworkservices 2>/dev/null | tail -n +2 | sed 's/^/   /'

echo "— DNS atuais (Wi‑Fi):"
networksetup -getdnsservers "Wi-Fi" 2>/dev/null | sed 's/^/   /' || true

echo "— scutil --dns (resumo):"
scutil --dns | egrep 'domain|nameserver\[[0-9]+\]' | sed 's/^/   /' || true

echo "— nslookup:"
if command -v nslookup >/dev/null 2>&1; then
  nslookup "$HOST" | sed 's/^/   /' || true
fi

echo "— dig +short (Cloudflare/Google):"
if command -v dig >/dev/null 2>&1; then
  echo "   @1.1.1.1: $(dig +short @1.1.1.1 "$HOST" | tr '\n' ' ')"
  echo "   @8.8.8.8: $(dig +short @8.8.8.8 "$HOST" | tr '\n' ' ')"
fi

echo "— ping 1x:"
ping -c1 -W1000 "$HOST" >/dev/null 2>&1 && echo "   OK" || echo "   FAIL"

echo "— Teste porta 5432:"
if command -v nc >/dev/null 2>&1; then
  nc -vz "$HOST" 5432 >/dev/null 2>&1 && echo "   ABERTA" || echo "   FECHADA"
fi

echo "— /etc/resolver entries:"
ls -l /etc/resolver 2>/dev/null | sed 's/^/   /' || true

echo "— /etc/hosts entradas para supabase:"
grep -i supabase /etc/hosts 2>/dev/null | sed 's/^/   /' || echo "   (nenhuma)"

echo "== Fim do diagnóstico"

