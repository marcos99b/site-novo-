#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const PRODUCTS = [
  { id: '1', url: 'https://www.cjdropshipping.com/product/tube-top-white-shirt-asymmetric-hip-skirt-suit-p-2508110621021602000.html' },
  { id: '2', url: 'https://www.cjdropshipping.com/product/autumn-and-winter-leisure-retro-style-stitching-dress-women-p-2508110855591629400.html' },
  { id: '3', url: 'https://www.cjdropshipping.com/product/fashion-sexy-backless-tube-top-pure-color-split-dress-p-2508110913291617700.html' }
];

async function safeMkdir(dir) {
  await fs.promises.mkdir(dir, { recursive: true }).catch(() => {});
}

function extractImageUrls(html) {
  const urls = new Set();
  const regex = /(https?:\/\/[\w\-./%?=&:]+\.(?:jpg|jpeg|png|webp))/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const u = m[1];
    // ignorar ícones, logos ou muito pequenas
    if (/logo|icon|favicon|avatar|svg|\/static\//i.test(u)) continue;
    urls.add(u);
  }
  return Array.from(urls);
}

async function download(url, dest) {
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 20000 });
  await fs.promises.writeFile(dest, res.data);
}

async function updateProductImages(productId, images) {
  await prisma.product.update({
    where: { id: productId },
    data: { images }
  });
}

async function run() {
  const placeholderSet = [
    { src: '/placeholder.jpg', alt: 'Imagem do produto' }
  ];

  for (const { id, url } of PRODUCTS) {
    const targetDir = path.join(process.cwd(), 'public', 'cj', id);
    await safeMkdir(targetDir);

    try {
      console.log(`🔎 Buscando imagens do produto ${id}...`);
      const { data: html } = await axios.get(url, { timeout: 20000 });
      const urls = extractImageUrls(html).slice(0, 8);

      const saved = [];
      let idx = 1;
      for (const u of urls) {
        const ext = path.extname(new URL(u).pathname) || '.jpg';
        const fname = `img-${idx}${ext.split('?')[0]}`;
        const dest = path.join(targetDir, fname);
        try {
          await download(u, dest);
          saved.push({ src: `/cj/${id}/${fname}`, alt: `Produto ${id} - ${idx}` });
          idx++;
        } catch (e) {
          // ignora falhas individuais
        }
      }

      if (saved.length === 0) {
        console.log(`⚠️  Nenhuma imagem válida encontrada para ${id}. Usando placeholder.`);
        await updateProductImages(id, placeholderSet);
      } else {
        await updateProductImages(id, saved);
        console.log(`✅ ${saved.length} imagens salvas em /public/cj/${id}`);
      }
    } catch (e) {
      console.log(`❌ Falha ao extrair imagens do produto ${id}: ${e.message}. Usando placeholder.`);
      await updateProductImages(id, placeholderSet);
    }
  }

  await prisma.$disconnect();
  console.log('🎉 Processo concluído.');
}

run().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
