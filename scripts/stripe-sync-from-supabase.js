#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

async function ensureTable(supabase) {
  const sql = `
    create table if not exists public.stripe_price_map (
      slug text primary key,
      stripe_product_id text not null,
      stripe_price_id text not null,
      currency text not null default 'eur'
    );
  `;
  try { await supabase.rpc('exec_sql', { sql }); } catch {}
}

async function main() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Supabase vars ausentes');
    process.exit(1);
  }
  if (!STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY ausente no ambiente');
    process.exit(2);
  }
  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });

  await ensureTable(sb);

  const { data: rows, error } = await sb.from('products').select('slug,name,price');
  if (error) {
    console.error('Erro lendo produtos do Supabase:', error.message);
    process.exit(3);
  }
  for (const r of rows || []) {
    const slug = String(r.slug || '');
    const name = String(r.name || slug);
    const unit = Math.round(Number(r.price || 0) * 100);
    if (!unit || unit <= 0) continue;
    // criar produto/price na Stripe
    const prod = await stripe.products.create({ name });
    const price = await stripe.prices.create({ unit_amount: unit, currency: 'eur', product: prod.id });
    // mapear
    await sb.from('stripe_price_map').upsert({ slug, stripe_product_id: prod.id, stripe_price_id: price.id, currency: 'eur' }, { onConflict: 'slug' });
    console.log(`✅ Stripe: ${slug} -> ${price.id}`);
  }
  console.log('🎉 Sincronização Stripe concluída');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(9); });


