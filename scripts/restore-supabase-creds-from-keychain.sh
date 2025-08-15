#!/bin/zsh
set -euo pipefail

ENV_FILE=".env.local"
touch "$ENV_FILE"

service() { echo "novo-site.supabase.$1"; }

get_key() {
  local name="$1"
  security find-generic-password -a "$USER" -s "$(service "$name")" -w 2>/dev/null || true
}

upsert_var() {
  local key="$1"; shift
  local value="$1"; shift
  if [ -z "$value" ]; then return; fi
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i '' -e "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

echo "==> Restaurando credenciais do Keychain para .env.local"
ANON_KEY=$(get_key ANON_KEY)
SERVICE_KEY=$(get_key SERVICE_ROLE_KEY)
DB_URL=$(get_key DATABASE_URL)
SUPABASE_URL=$(get_key NEXT_PUBLIC_SUPABASE_URL)

upsert_var NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY"
upsert_var SUPABASE_SERVICE_ROLE_KEY "$SERVICE_KEY"
upsert_var DATABASE_URL "$DB_URL"
upsert_var SUPABASE_DB_URL "$DB_URL"
upsert_var NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"

echo "OK"

