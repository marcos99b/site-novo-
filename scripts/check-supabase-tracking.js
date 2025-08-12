#!/usr/bin/env node
/*
  scripts/check-supabase-tracking.js
  Lê .env.local, conecta no Supabase e lista últimos registros de user_events, product_views e leads
*/
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

function getEnv(name, fallback) {
  return process.env[name] || fallback || '';
}

async function main() {
  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY', getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
  if (!url || !key) {
    console.error('Variáveis do Supabase ausentes. Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  async function show(table, select, orderBy) {
    const { data, error, count } = await supabase
      .from(table)
      .select(select, { count: 'exact' })
      .order(orderBy, { ascending: false })
      .limit(5);
    console.log(`\n=== ${table} ===`);
    if (error) {
      console.log('error:', error.message);
      return;
    }
    console.log('count:', count);
    console.log(data);
  }

  await show('user_events', 'id,event_type,event_data,page_url,timestamp', 'timestamp');
  await show('product_views', '*', 'created_at');
  try { await show('leads', '*', 'created_at'); } catch { console.log('\n(leads não disponível neste schema)'); }
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(2); });



