#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const { spawnSync } = require('child_process');

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(r.stderr || r.stdout || `fail ${cmd}`);
  return r.stdout.trim();
}

async function ensureMapTable(sb) {
  const sql = `
    create table if not exists public.stripe_price_map (
      slug text primary key,
      stripe_product_id text not null,
      stripe_price_id text not null,
      currency text not null default 'eur'
    );
  `;
  try { await sb.rpc('exec_sql', { sql }); } catch {}
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Supabase vars ausentes');
    process.exit(1);
  }
  try { run('stripe', ['--version']); } catch { console.error('Stripe CLI não encontrado. Instale com: brew install stripe/stripe-cli/stripe'); process.exit(2); }

  const sb = createClient(url, key);
  await ensureMapTable(sb);

  const { data: rows, error } = await sb.from('products').select('slug,name,price');
  if (error) { console.error('Erro supabase:', error.message); process.exit(3); }

  for (const r of rows || []) {
    const slug = String(r.slug || '');
    const name = String(r.name || slug);
    const amount = Math.round(Number(r.price || 0) * 100);
    if (!slug || !name || !amount) continue;

    // Criar produto e preço via Stripe CLI (usa contexto atual: teste ou live dependendo da config do CLI)
    const prodId = run('stripe', ['products', 'create', '--name', name, '--query', 'id', '--format', 'yaml']).split(':').pop().trim();
    const priceId = run('stripe', ['prices', 'create', `--unit-amount=${amount}`, '--currency=eur', `--product=${prodId}`, '--query', 'id', '--format', 'yaml']).split(':').pop().trim();
    await sb.from('stripe_price_map').upsert({ slug, stripe_product_id: prodId, stripe_price_id: priceId, currency: 'eur' }, { onConflict: 'slug' });
    console.log(`✅ ${slug} -> ${priceId}`);
  }

  console.log('🎉 Stripe CLI sync concluído.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(9); });


