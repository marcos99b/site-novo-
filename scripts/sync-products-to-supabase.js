#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('Variáveis do Supabase ausentes.');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const products = await prisma.product.findMany({ include: { variants: true } });

  for (const p of products) {
    const slug = `produto-${p.id}`;
    const price = p.priceMin;
    const regular_price = p.priceMax;
    const stock_quantity = p.variants.reduce((sum, v) => sum + v.stock, 0);

    // Upsert product
    const { data: up, error: upErr } = await supabase
      .from('products')
      .upsert({
        slug,
        name: p.name,
        description: p.description,
        short_description: p.description?.slice(0, 160) || null,
        price,
        regular_price,
        stock_quantity,
        status: 'publish',
        featured: true
      }, { onConflict: 'slug' })
      .select('id')
      .single();
    if (upErr) { console.error('Erro upsert product:', upErr.message); continue; }
    const supaId = up.id;

    // Replace images
    const imgs = Array.isArray(p.images) ? p.images : [];
    await supabase.from('product_images').delete().eq('product_id', supaId);
    if (imgs.length) {
      const rows = imgs.map((img, i) => ({ product_id: supaId, src: (typeof img === 'string' ? img : img.src), alt: p.name, position: i }));
      const { error: imgErr } = await supabase.from('product_images').insert(rows);
      if (imgErr) console.error('Erro inserir imagens:', imgErr.message);
    }

    console.log(`✅ Supabase: sincronizado ${p.name} (${slug})`);
  }

  await prisma.$disconnect();
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });




