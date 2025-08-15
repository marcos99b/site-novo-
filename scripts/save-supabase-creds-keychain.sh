#!/bin/zsh
set -euo pipefail

# Usage: save-supabase-creds-keychain.sh "ANON_KEY" "SERVICE_ROLE_KEY" "DATABASE_URL"

ANON_KEY="$1"
SERVICE_KEY="$2"
DB_URL="$3"

service() { echo "novo-site.supabase.$1"; }

echo "==> Gravando credenciais no macOS Keychain (sem expirar)"
security add-generic-password -U -a "$USER" -s "$(service ANON_KEY)" -w "$ANON_KEY" >/dev/null 2>&1 || true
security add-generic-password -U -a "$USER" -s "$(service SERVICE_ROLE_KEY)" -w "$SERVICE_KEY" >/dev/null 2>&1 || true
security add-generic-password -U -a "$USER" -s "$(service DATABASE_URL)" -w "$DB_URL" >/dev/null 2>&1 || true

host=$(echo "$DB_URL" | sed -E 's#.*://[^@]+@([^/:]+).*#\1#')
proj=$(echo "$host" | sed -E 's#^db\.([^.]+)\.supabase\.co$#\1#')
if [[ -n "$proj" ]]; then
  SUPABASE_URL="https://${proj}.supabase.co"
  security add-generic-password -U -a "$USER" -s "$(service NEXT_PUBLIC_SUPABASE_URL)" -w "$SUPABASE_URL" >/dev/null 2>&1 || true
fi

echo "OK"

