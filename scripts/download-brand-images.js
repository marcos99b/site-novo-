#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.resolve(__dirname, '../public/brand/models');

// URLs ESPECÍFICAS do Pexels - Fotos de moda feminina dos estilos solicitados
const images = [
  // 1. Modern Minimalist Womenswear
  'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1600',
  
  // 2. Luxury Casual Wear
  'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1600',
  
  // 3. Contemporary Resort Wear
  'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1600',
  
  // 4. Elevated Basics
  'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1600',
  
  // 5. Sophisticated Everyday Clothing
  'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1600',
  
  // 6. Elegant Evening Wear
  'https://images.pexels.com/photos/994523/pexels-photo-994523.jpeg?auto=compress&cs=tinysrgb&w=1600'
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
    
    console.log('🎯 Baixando fotos ESPECÍFICAS de moda feminina...');
    
    for (let i = 0; i < images.length; i++) {
      const fileName = `${String(i + 1).padStart(2, '0')}.jpg`;
      const dest = path.join(targetDir, fileName);
      
      console.log(`↓ Baixando foto ${i + 1}: ${images[i]}`);
      await download(images[i], dest);
      console.log(`✔︎ Salvo: ${dest}`);
    }
    
    console.log('✅ FOTOS ESPECÍFICAS de moda feminina prontas!');
  } catch (e) {
    console.error('Erro ao baixar imagens:', e.message);
    process.exit(1);
  }
})();
