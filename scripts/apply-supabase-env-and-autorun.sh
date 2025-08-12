#!/usr/bin/env bash
set -euo pipefail

# Ajusta variáveis Supabase no .env.local e dispara autorun

PROJECT_ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT_DIR"

SUPABASE_PASSWORD_RAW='8J8gt8V6F-Y6$W6'
# Escapar senha para URL (apenas o caractere $ aqui)
SUPABASE_PASSWORD_URL='8J8gt8V6F-Y6%24W6'

SUPABASE_DB_URL="postgresql://postgres:${SUPABASE_PASSWORD_URL}@db.vqpumetbhgqdpnskgbvr.supabase.co:5432/postgres?sslmode=require"
NEXT_PUBLIC_SUPABASE_URL='https://vqpumetbhgqdpnskgbvr.supabase.co'
NEXT_PUBLIC_SUPABASE_ANON_KEY='sb_publishable_YzDTTATeMnecYt7QUvkJ6Q_lFB3i98u'
SUPABASE_SERVICE_ROLE_KEY='sb_secret_GLt9pQGCsT6k7LynjWNwlQ_7pjulyoV'

echo "[1/3] Atualizando .env.local"
touch .env.local

# Substituir ou inserir variáveis com valores corretos
if grep -q '^SUPABASE_DB_URL=' .env.local; then
  sed -i '' -E "s|^SUPABASE_DB_URL=.*$|SUPABASE_DB_URL=${SUPABASE_DB_URL}|" .env.local
else
  printf "\nSUPABASE_DB_URL=%s\n" "$SUPABASE_DB_URL" >> .env.local
fi

if grep -q '^NEXT_PUBLIC_SUPABASE_URL=' .env.local; then
  sed -i '' -E "s|^NEXT_PUBLIC_SUPABASE_URL=.*$|NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}|" .env.local
else
  printf "NEXT_PUBLIC_SUPABASE_URL=%s\n" "$NEXT_PUBLIC_SUPABASE_URL" >> .env.local
fi

if grep -q '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' .env.local; then
  sed -i '' -E "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$|NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}|" .env.local
else
  printf "NEXT_PUBLIC_SUPABASE_ANON_KEY=%s\n" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> .env.local
fi

if grep -q '^SUPABASE_SERVICE_ROLE_KEY=' .env.local; then
  sed -i '' -E "s|^SUPABASE_SERVICE_ROLE_KEY=.*$|SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}|" .env.local
else
  printf "SUPABASE_SERVICE_ROLE_KEY=%s\n" "$SUPABASE_SERVICE_ROLE_KEY" >> .env.local
fi

echo "[2/3] Verificando arquivo SQL de autorun"
if [ ! -s supabase_autorun.sql ]; then
  echo "Arquivo supabase_autorun.sql não encontrado ou vazio. Abortando." >&2
  exit 1
fi

echo "[3/3] Disparando autorun via API local"
curl -s -X POST http://localhost:3001/api/supabase/autorun -H 'Content-Type: application/json' | cat

echo "\nConcluído."



