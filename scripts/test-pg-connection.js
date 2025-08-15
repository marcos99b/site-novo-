#!/usr/bin/env node
const { Client } = require('pg');

function pickUrls() {
  const urls = [];
  const pooled = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  const direct = process.env.DIRECT_URL;
  if (pooled) urls.push({ name: 'POOLER', url: pooled });
  if (direct) urls.push({ name: 'DIRECT', url: direct });
  return urls;
}

function ensureSsl(url) {
  if (!url) return url;
  if (url.includes('sslmode=')) return url;
  return url.includes('?') ? `${url}&sslmode=require` : `${url}?sslmode=require`;
}

async function tryConnect(name, url) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 12000 });
  console.log(`🔌 Tentando ${name}: ${new URL(url).host}`);
  await client.connect();
  const { rows } = await client.query('select current_user, current_database(), now() as ts');
  await client.end();
  console.log(`✅ ${name} OK:`, rows[0]);
}

async function main() {
  const urls = pickUrls();
  if (urls.length === 0) {
    console.error('Nenhuma URL de banco encontrada (SUPABASE_DB_URL/DATABASE_URL/DIRECT_URL).');
    process.exit(1);
  }
  let lastErr;
  for (const { name, url } of urls) {
    try {
      await tryConnect(name, ensureSsl(url));
      return;
    } catch (e) {
      console.error(`❌ ${name} falhou:`, e.message || e.code || String(e));
      lastErr = e;
    }
  }
  console.error('❌ Nenhuma das URLs conectou.');
  process.exit(2);
}

main();



