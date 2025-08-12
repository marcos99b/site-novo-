#!/usr/bin/env node

/**
 * Copia imagens locais de ~/Downloads/Imagem produtos para a pasta public/produtos/{produto-N}
 * Aceita arquivos nomeados como: "PRODUTO 1 ... .jpg|png|webp" (case-insensitive)
 */

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const HOME = process.env.HOME || process.env.USERPROFILE || '';
// Aceita "Imagens produtos" (preferencial) ou "Imagem produtos"
const CANDIDATE_DIRS = [
  path.join(HOME, 'Downloads', 'Imagens produtos'),
  path.join(HOME, 'Downloads', 'Imagem produtos')
];
const PUBLIC_DIR = path.join(process.cwd(), 'public', 'produtos');

async function ensureDir(p) {
  await fsp.mkdir(p, { recursive: true });
}

async function main() {
  try {
    if (!HOME) throw new Error('HOME não detectado no ambiente');
    const SOURCE_DIR = CANDIDATE_DIRS.find((p) => fs.existsSync(p));
    if (!SOURCE_DIR) {
      console.error('❌ Pasta de origem não encontrada. Tente criar uma das opções:');
      for (const p of CANDIDATE_DIRS) console.error('   - ' + p);
      process.exit(1);
    }
    await ensureDir(PUBLIC_DIR);

    // Percorrer recursivamente subpastas
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

    const allPaths = await walk(SOURCE_DIR);
    const imagePaths = allPaths.filter((p) => /\.(png|jpe?g|webp)$/i.test(p));
    if (imagePaths.length === 0) {
      console.log('ℹ️ Nenhuma imagem encontrada em', SOURCE_DIR);
      return;
    }

    const mapping = {}; // produtoNumero -> [destPaths]

    for (const srcPath of imagePaths) {
      const rel = path.relative(SOURCE_DIR, srcPath);
      const file = path.basename(srcPath);
      const parent = path.basename(path.dirname(srcPath));
      // Extrair número do produto do diretório pai, do arquivo, ou de QUALQUER ancestral até SOURCE_DIR
      let num = null;
      let m = parent.match(/PRODUTO\s*(\d+)/i);
      if (m) num = parseInt(m[1], 10);
      if (!num) {
        m = file.match(/PRODUTO\s*(\d+)/i);
        if (m) num = parseInt(m[1], 10);
      }
      if (!num) {
        const parts = rel.split(path.sep);
        for (const seg of parts) {
          const mm = seg.match(/PRODUTO\s*(\d+)/i);
          if (mm) { num = parseInt(mm[1], 10); break; }
        }
      }
      if (!num || num < 1) continue;

      const destFolder = path.join(PUBLIC_DIR, `produto-${num}`);
      await ensureDir(destFolder);
      const ext = path.extname(file).toLowerCase();
      const base = path.basename(file, ext)
        .replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
      const destName = `${base}${ext}`;
      const destPath = path.join(destFolder, destName);
      await fsp.copyFile(srcPath, destPath);
      const webPath = `/produtos/produto-${num}/${destName}`;
      if (!mapping[num]) mapping[num] = [];
      mapping[num].push(webPath);
      console.log(`✅ Copiada: PRODUTO ${num} -> ${webPath}`);
    }

    const manifestPath = path.join(PUBLIC_DIR, 'manifest.json');
    await fsp.writeFile(manifestPath, JSON.stringify(mapping, null, 2));
    console.log('\n📄 Manifesto salvo em', manifestPath);
    console.log('🎉 Ingestão de imagens concluída.');
  } catch (e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
}

main();


