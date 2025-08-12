#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.resolve(__dirname, '../public/brand/products');

// FOTOS DE PRODUTOS COM MODELOS PROFISSIONAIS - Vestidos de luxo e alta costura
const productImages = [
  // Produto 1 - Vestido de gala
  'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1600&q=80',
  // Produto 2 - Vestido de noite elegante
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
  // Produto 3 - Vestido de designer
  'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1600&q=80',
  // Produto 4 - Conjunto de luxo
  'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?auto=format&fit=crop&w=1600&q=80',
  // Produto 5 - Vestido de alta costura
  'https://images.unsplash.com/photo-1519744792095-2f2205e87b6f?auto=format&fit=crop&w=1600&q=80',
  // Produto 6 - Vestido romântico de luxo
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
  // Produto 7 - Vestido de festa sofisticado
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80',
  // Produto 8 - Conjunto business de luxo
  'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1600&q=80'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        }
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', (err) => {
        file.close();
        fs.unlink(dest, () => {});
        reject(err);
      });
  });
}

(async () => {
  try {
    ensureDir(targetDir);
    
    // Limpar diretório existente
    if (fs.existsSync(targetDir)) {
      const files = fs.readdirSync(targetDir);
      for (const file of files) {
        fs.unlinkSync(path.join(targetDir, file));
        console.log(`🗑️ Removido: ${file}`);
      }
    }
    
    for (let i = 0; i < productImages.length; i++) {
      const fileName = `product-${String(i + 1).padStart(2, '0')}.jpg`;
      const dest = path.join(targetDir, fileName);
      
      console.log(`↓ Baixando produto de LUXO ${i + 1}: ${productImages[i]}`);
      await download(productImages[i], dest);
      console.log(`✔︎ Salvo: ${dest}`);
    }
    
    console.log('✅ PRODUTOS DE LUXO com modelos profissionais prontos!');
  } catch (e) {
    console.error('Erro ao baixar imagens:', e.message);
    process.exit(1);
  }
})();
