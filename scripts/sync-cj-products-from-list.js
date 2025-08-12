#!/usr/bin/env node

/**
 * Sincroniza 6 produtos específicos da CJ no banco (SQLite via Prisma),
 * removendo antigos com segurança (order items -> variants -> products).
 * Usa imagens locais do manifesto gerado por scripts/ingest-product-images.js, quando existir.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const CJ_LIST = [
  { id: 1, cjProductId: '2508080521221628200', name: "Solid color slimming long sleeve pocket woolen women's coat" },
  { id: 2, cjProductId: '2508010339421629200', name: "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest" },
  { id: 3, cjProductId: '2508041417241619800', name: 'New loose slimming temperament casual cotton linen top' },
  { id: 4, cjProductId: '2508060259111624600', name: 'Fashion all-match comfort and casual woolen turn-down collar coat' },
  { id: 5, cjProductId: '2508010339421629200', name: "Women's V-neck Hollow Rhombus Casual Knitted Sweater Vest" },
  { id: 6, cjProductId: '2504290217311600400', name: 'Metal buckle slit knitted vest slim fit vest foreign trade TUP cardigan' }
];

function loadManifest() {
  const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  }
  return {};
}

async function main() {
  console.log('🔄 Sincronizando produtos da CJ...');
  const manifest = loadManifest();
  try {
    // Limpeza segura
    await prisma.orderItem.deleteMany({});
    await prisma.variant.deleteMany({});
    await prisma.product.deleteMany({});

    for (const p of CJ_LIST) {
      const images = (manifest[p.id] || []).map((src) => ({ src, alt: p.name }));
      const priceMin = 39.9 + p.id; // placeholder simples por ID
      const priceMax = priceMin + 20;
      let created;
      try {
        created = await prisma.product.create({
          data: {
            id: String(p.id),
            cjProductId: p.cjProductId,
            name: p.name,
            description: `${p.name} – peça selecionada na CJ com curadoria e pronta para envio a Portugal.`,
            images,
            priceMin,
            priceMax,
            category: 'Moda Feminina',
            brand: 'CJ Dropshipping'
          }
        });
      } catch (e) {
        // Em caso de duplicidade de cjProductId, criar com sufixo único
        const altId = `${p.cjProductId}_${p.id}`;
        created = await prisma.product.create({
          data: {
            id: String(p.id),
            cjProductId: altId,
            name: p.name,
            description: `${p.name} – peça selecionada na CJ com curadoria e pronta para envio a Portugal.`,
            images,
            priceMin,
            priceMax,
            category: 'Moda Feminina',
            brand: 'CJ Dropshipping'
          }
        });
      }
      const actualCj = created.cjProductId;
      const vars = [
        { cjVariantId: `${actualCj}_S`, sku: `${p.id}_S`, name: `${p.name} - Tamanho S`, price: priceMin, stock: 30 },
        { cjVariantId: `${actualCj}_M`, sku: `${p.id}_M`, name: `${p.name} - Tamanho M`, price: (priceMin+priceMax)/2, stock: 50 },
        { cjVariantId: `${actualCj}_L`, sku: `${p.id}_L`, name: `${p.name} - Tamanho L`, price: priceMax, stock: 30 }
      ];
      for (const v of vars) {
        await prisma.variant.create({ data: { ...v, productId: created.id } });
      }
      console.log(`✅ Produto ${p.id} inserido com ${vars.length} variantes`);
    }

    console.log('🎉 Concluído.');
  } catch (e) {
    console.error('❌ Erro:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();


