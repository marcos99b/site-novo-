#!/usr/bin/env node
// Cria a função RPC `list_tables(schemas text[])` no Supabase via exec_sql

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace('https://', '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !anonKey) {
  console.error('Variáveis do Supabase ausentes: verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_*_KEY em .env.local');
  process.exit(1);
}

const sql = `
create or replace function public.list_tables(schemas text[])
returns table (table_schema text, table_name text, table_type text)
language sql stable as $$
  select table_schema, table_name, table_type
  from information_schema.tables
  where table_schema = any (schemas)
  order by table_schema, table_name
$$;`;

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
  const resp = await request('/rest/v1/rpc/exec_sql', { sql });
  if (resp.status !== 200) {
    console.error('Falha ao criar função list_tables:', resp.data);
    process.exit(2);
  }
  console.log('✅ RPC list_tables criada/atualizada com sucesso');
})();




