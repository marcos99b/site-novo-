#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function tryHostsAndApply({ projectRef, password, sql }) {
  const database = 'postgres';
  const username = 'postgres';
  const hosts = [
    { host: `${projectRef}.pooler.supabase.com`, port: 6543 },
    { host: `db.${projectRef}.supabase.co`, port: 5432 }
  ];

  for (const { host, port } of hosts) {
    const connString = `postgresql://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}/${database}?sslmode=require`;
    const client = new Client({ connectionString: connString, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
    try {
      process.stdout.write(`Tentando conectar em ${host}:${port} ... `);
      await client.connect();
      console.log('conectado. Aplicando SQL...');
      await client.query('begin');
      await client.query(sql);
      await client.query('commit');
      await client.end();
      console.log('✅ Autorun aplicado com sucesso:', `${host}:${port}`);
      return true;
    } catch (e) {
      try { await client.query('rollback'); } catch {}
      try { await client.end(); } catch {}
      console.log('falhou:', e.message);
    }
  }
  return false;
}

async function main() {
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').split('https://')[1]?.split('.')[0] || 'vqpumetbhgqdpnskgbvr';
  const password = process.env.SUPABASE_DB_PASSWORD || '8J8gt8V6F-Y6$W6';
  const sql = fs.readFileSync(path.join(process.cwd(), 'supabase_autorun.sql'), 'utf8');

  const ok = await tryHostsAndApply({ projectRef, password, sql });
  if (!ok) {
    console.error('❌ Não foi possível conectar ao pooler em nenhuma região conhecida.');
    process.exit(2);
  }
}

main();


