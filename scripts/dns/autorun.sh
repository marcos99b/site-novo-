#!/bin/zsh
set -euo pipefail

echo "== DNS Autorun (Supabase) =="
set -a
[ -f .env.local ] && source .env.local || true
set +a

derive_host() {
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "$DATABASE_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'
    return 0
  fi
  if [ -n "${SUPABASE_DB_URL:-}" ]; then
    echo "$SUPABASE_DB_URL" | sed -E 's#.*://[^@]+@([^/:\?]+).*#\1#'
    return 0
  fi
  echo ""
}

HOST="${1:-$(derive_host)}"
if [ -z "$HOST" ]; then
  echo "Não foi possível derivar o host do Supabase. Ex.: ./scripts/dns/autorun.sh db.<proj>.supabase.co"
  exit 2
fi

chmod +x scripts/dns/diagnose.sh scripts/dns/fix.sh
./scripts/dns/diagnose.sh "$HOST"

if ! ping -c1 -W1000 "$HOST" >/dev/null 2>&1; then
  echo "== Tentando corrigir DNS (Wi‑Fi → 1.1.1.1 8.8.8.8)"
  ./scripts/dns/fix.sh "$HOST"
  echo "== Diagnóstico pós-fix"
  ./scripts/dns/diagnose.sh "$HOST"
fi

echo "== Teste de conexão ao Postgres"
node scripts/test-pg-connection.js || echo "(Ainda sem conexão — verifique rede/VPN/firewall)"

echo "== Fim"

