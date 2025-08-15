#!/usr/bin/env node
// Lista todas as tabelas por schema usando a função RPC list_tables

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Variáveis do Supabase ausentes: verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_*_KEY em .env.local');
  process.exit(1);
}

function request(path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: supabaseUrl,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      }
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(data));
    req.end();
  });
}

(async () => {
  const schemas = ['public','auth','storage'];
  const resp = await request('/rest/v1/rpc/list_tables', { schemas });
  if (resp.status !== 200) {
    console.error('Falha ao listar tabelas:', resp.data);
    process.exit(2);
  }
  const rows = resp.data;
  const grouped = rows.reduce((acc, r) => {
    acc[r.table_schema] = acc[r.table_schema] || [];
    acc[r.table_schema].push(r);
    return acc;
  }, {});
  for (const schema of Object.keys(grouped).sort()) {
    console.log(`\n=== Schema: ${schema} ===`);
    for (const r of grouped[schema]) {
      console.log(`- ${r.table_name} (${r.table_type})`);
    }
  }
})();




