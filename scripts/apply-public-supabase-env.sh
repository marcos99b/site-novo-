#!/bin/zsh
set -euo pipefail

# Usage: apply-public-supabase-env.sh "NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY"

SUPABASE_URL="$1"
ANON_KEY="$2"

ENV_FILE=".env.local"
touch "$ENV_FILE"

upsert_var() {
  local key="$1"; shift
  local value="$1"; shift
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    sed -i '' -e "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert_var NEXT_PUBLIC_SUPABASE_URL "$SUPABASE_URL"
upsert_var NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY"
echo "OK: salvos em .env.local"

