#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const CJ_LIST = [
  { id: 1, name: "Solid color slimming long sleeve pocket woolen women's coat" },
  { id: 2, name: 'Lightly Mature Cotton And Linen Suit Women' },
  { id: 3, name: 'New loose slimming temperament casual cotton linen top' },
  { id: 4, name: 'Fashion all-match comfort and casual woolen turn-down collar coat' },
  { id: 5, name: "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest" },
  { id: 6, name: 'Metal buckle slit knitted vest slim fit vest foreign trade TUP cardigan' }
];

function loadManifest() {
  const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
  if (fs.existsSync(manifestPath)) return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return {};
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Variáveis do Supabase ausentes (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const manifest = loadManifest();

  for (const p of CJ_LIST) {
    const slug = `produto-${p.id}`;
    const price = 39.9 + p.id;
    const regular_price = price + 20;
    const images = Array.isArray(manifest[p.id])
      ? manifest[p.id].map((src, i) => ({ src, alt: p.name, position: i }))
      : [];

    const { data: up, error: upErr } = await supabase
      .from('products')
      .upsert({
        slug,
        name: p.name,
        description: `${p.name} – peça selecionada na CJ, pronta para envio.`,
        short_description: `${p.name}`,
        price,
        regular_price,
        stock_quantity: 50,
        status: 'publish',
        featured: true,
      }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (upErr) { console.error('Erro upsert product:', upErr.message); continue; }
    const prodId = up.id;

    if (images.length) {
      await supabase.from('product_images').delete().eq('product_id', prodId);
      const { error: imgErr } = await supabase.from('product_images').insert(images.map(img => ({ ...img, product_id: prodId })));
      if (imgErr) console.error('Erro inserir imagens:', imgErr.message);
    }

    console.log(`✅ Supabase REST: sincronizado ${p.name} (${slug})`);
  }

  console.log('🎉 Sincronização via REST concluída.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });


