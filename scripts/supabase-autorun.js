#!/usr/bin/env node
/*
  Executa o SQL de autorun no Supabase via terminal
  Requer: SUPABASE_DB_URL no ambiente ou em .env.local
*/

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ SUPABASE_DB_URL não encontrado. Adicione no .env.local ou exporte no ambiente.');
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), 'supabase_autorun.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Arquivo supabase_autorun.sql não encontrado na raiz do projeto.');
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log('🚀 Conectando ao Supabase...');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log('📦 Aplicando SQL (autorun)...');
    await client.query('begin');
    await client.query(sql);
    await client.query('commit');
    console.log('✅ Autorun aplicado com sucesso.');
  } catch (err) {
    console.error('❌ Falha ao aplicar SQL:', err.message);
    try { await client.query('rollback'); } catch {}
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('❌ Erro inesperado:', e.message);
  process.exit(1);
});



