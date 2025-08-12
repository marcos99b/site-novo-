#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT_DIR"

# Usar porta 5432 com sslmode=require; senha com $ já foi codificada como %24
DB_URL_LINE='SUPABASE_DB_URL=postgresql://postgres:8J8gt8V6F-Y6%24W6@db.vqpumetbhgqdpnskgbvr.supabase.co:5432/postgres?sslmode=require'
URL_LINE='NEXT_PUBLIC_SUPABASE_URL=https://vqpumetbhgqdpnskgbvr.supabase.co'
ANON_LINE='NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_YzDTTATeMnecYt7QUvkJ6Q_lFB3i98u'
SERVICE_LINE='SUPABASE_SERVICE_ROLE_KEY=sb_secret_GLt9pQGCsT6k7LynjWNwlQ_7pjulyoV'

# Reescrever com printf para evitar quebras acidentais
{
  printf '%s\n' "$DB_URL_LINE"
  printf '%s\n' "$URL_LINE"
  printf '%s\n' "$ANON_LINE"
  printf '%s\n' "$SERVICE_LINE"
} > .env.local

echo "Reescrito .env.local com sucesso."


