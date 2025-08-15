#!/usr/bin/env node

// Importa imagens de uma pasta arbitrária para public/produtos/produto-{id}
// Uso: node scripts/import-from-folder-into-product.js <productId> "/caminho/da/pasta"

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function walk(dir) {
  const dirents = await fsp.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const d of dirents) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) {
      results.push(...(await walk(full)));
    } else {
      results.push(full);
    }
  }
  return results;
}

function sanitizeFilename(name) {
  return name
    .replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '')
    .replace(/-+/g, '-').toLowerCase();
}

async function main() {
  try {
    const productId = Number(process.argv[2]);
    const sourceDir = process.argv[3];
    if (!productId || !Number.isFinite(productId)) {
      console.error('Uso: node scripts/import-from-folder-into-product.js <productId> "/caminho/da/pasta"');
      process.exit(1);
    }
    if (!sourceDir) {
      console.error('Erro: informe o caminho da pasta de origem entre aspas.');
      process.exit(1);
    }

    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
      console.error('Erro: pasta de origem não encontrada:', sourceDir);
      process.exit(1);
    }

    const PUBLIC_DIR = path.join(process.cwd(), 'public', 'produtos');
    const destFolder = path.join(PUBLIC_DIR, `produto-${productId}`);
    await ensureDir(destFolder);

    const allPaths = await walk(sourceDir);
    const imagePaths = allPaths.filter((p) => /\.(png|jpe?g|webp)$/i.test(p));
    if (imagePaths.length === 0) {
      console.error('Nenhuma imagem encontrada em', sourceDir);
      process.exit(1);
    }

    // Copiar mantendo nomes sanitizados; em caso de conflito, acrescentar índice
    const usedNames = new Set(await fsp.readdir(destFolder).catch(() => []));
    const webPaths = [];
    let counter = 1;
    for (const srcPath of imagePaths) {
      const ext = path.extname(srcPath).toLowerCase();
      const baseRaw = path.basename(srcPath, ext);
      let base = sanitizeFilename(baseRaw);
      if (!base) base = `img-${counter++}`;
      let destName = `${base}${ext}`;
      let attempt = 1;
      while (usedNames.has(destName)) {
        destName = `${base}-${attempt++}${ext}`;
      }
      const destPath = path.join(destFolder, destName);
      await fsp.copyFile(srcPath, destPath);
      usedNames.add(destName);
      const webPath = `/produtos/produto-${productId}/${destName}`;
      webPaths.push(webPath);
      console.log(`✔ Copiada: ${srcPath} -> ${webPath}`);
    }

    // Atualizar manifest.json (formato simples: { "id": [paths] })
    const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
    let manifest = {};
    try {
      const raw = await fsp.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(raw || '{}');
    } catch {}

    // Ordenar por nome para estabilidade
    webPaths.sort((a, b) => a.localeCompare(b));
    manifest[String(productId)] = webPaths;
    await ensureDir(PUBLIC_DIR);
    await fsp.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`\n📝 Manifesto atualizado: ${manifestPath}`);
    console.log(`📦 Produto ${productId}: ${webPaths.length} imagens registradas.`);
  } catch (e) {
    console.error('Falha:', e?.message || e);
    process.exit(1);
  }
}

main();



