#!/bin/zsh
set -euo pipefail

# Usage: apply-supabase-db-urls.sh "PROJECT_REF" "PASSWORD"
# Writes DATABASE_URL, DIRECT_URL, SUPABASE_DB_URL into .env.local using Supabase pooler hosts

PROJ="$1"          # e.g., vqpumetbhgqdpnskgbvr
RAW_PASS="$2"      # e.g., 8J8gt8V6F-Y6$W6

# Percent-encode $ in password
ENC_PASS="${RAW_PASS//\$/%24}"

# Para pooler, o usuário inclui o project ref
DB_USER="postgres.${PROJ}"
# Host do pooler conforme sua região
POOL_HOST="aws-1-eu-west-2.pooler.supabase.com"
DB_HOST_DIRECT="db.${PROJ}.supabase.co"

DATABASE_URL="postgresql://${DB_USER}:${ENC_PASS}@${POOL_HOST}:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://${DB_USER}:${ENC_PASS}@${DB_HOST_DIRECT}:5432/postgres?sslmode=require"

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

upsert_var DATABASE_URL "$DATABASE_URL"
upsert_var DIRECT_URL "$DIRECT_URL"
upsert_var SUPABASE_DB_URL "$DATABASE_URL"

echo "OK: DATABASE_URL/DIRECT_URL/SUPABASE_DB_URL gravados em .env.local"

