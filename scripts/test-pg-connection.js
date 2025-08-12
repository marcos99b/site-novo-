#!/usr/bin/env node
const { Client } = require('pg');

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL;
  if (!dbUrl) {
    console.error('SUPABASE_DB_URL não definido.');
    process.exit(1);
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  try {
    console.log('🔌 Conectando ao Postgres...');
    await client.connect();
    const { rows } = await client.query('select current_user, current_database(), now() as ts');
    console.log('✅ Conectado:', rows[0]);
  } catch (e) {
    console.error('❌ Falha na conexão:', e.message);
    process.exit(2);
  } finally {
    try { await client.end(); } catch {}
  }
}

main();



