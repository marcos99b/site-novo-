import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

// usando instância compartilhada de prisma de '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');

    let products;
    
    if (search) {
      const term = String(search);
      products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: term } },
            { description: { contains: term } }
          ]
        },
        include: { variants: true },
        take: 20,
      });
      // Ordenação simples por relevância (nome primeiro, depois descrição)
      const t = term.toLowerCase();
      products.sort((a: any, b: any) => {
        const an = (a.name || '').toLowerCase();
        const bn = (b.name || '').toLowerCase();
        const ad = (a.description || '').toLowerCase();
        const bd = (b.description || '').toLowerCase();
        const ar = (an.indexOf(t) !== -1 ? 0 : 1) + (ad.indexOf(t) !== -1 ? 1 : 2);
        const br = (bn.indexOf(t) !== -1 ? 0 : 1) + (bd.indexOf(t) !== -1 ? 1 : 2);
        return ar - br;
      });
    } else if (featured) {
      products = await prisma.product.findMany({ include: { variants: true }, take: 6 });
    } else if (category) {
      products = await prisma.product.findMany({
        where: { category: { contains: category } },
        include: { variants: true }
      });
    } else {
      products = await prisma.product.findMany({ include: { variants: true }, take: 50 });
    }

    // Tentar carregar manifest local (suporta dois formatos):
    //  - antigo: { "1": ["/img1.jpg", ...] }
    //  - novo:   { "1": { images: ["/img1.jpg", ...], video: "/videos/1.mp4" } }
    let manifestImages: Record<string, string[]> = {};
    try {
      const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
      const raw = await fs.readFile(manifestPath, 'utf-8');
      const parsed: any = JSON.parse(raw || '{}');
      if (parsed && typeof parsed === 'object') {
        for (const [key, value] of Object.entries(parsed)) {
          if (Array.isArray(value)) {
            manifestImages[String(key)] = value as string[];
          } else if (value && typeof value === 'object' && Array.isArray((value as any).images)) {
            manifestImages[String(key)] = (value as any).images as string[];
          }
        }
      }
    } catch {}

    const rename = (raw: string) => {
      if (!raw) return raw;
      const rules: Array<[RegExp, string]> = [
        [/women'?s|woman/gi, 'Feminino'],
        [/v[- ]?neck/gi, 'Decote em V'],
        [/hollow|cut[- ]?out/gi, 'Recortes'],
        [/rhombus|diamond/gi, 'Losangos'],
        [/casual/gi, 'Elegante'],
        [/knit(?:ted)?/gi, 'Tricot'],
        [/sweater/gi, 'Suéter'],
        [/vest\b/gi, 'Colete'],
        [/top\b/gi, 'Top'],
        [/loose|oversized/gi, 'Ajuste solto'],
        [/slimming/gi, 'Modelagem que valoriza'],
        [/cotton/gi, 'Algodão'],
        [/linen/gi, 'Linho'],
        [/solid\s*color/gi, 'Cor lisa'],
        [/long\s*sleeve/gi, 'Manga comprida'],
        [/pocket/gi, 'com bolsos'],
        [/woolen/gi, 'em lã'],
        [/coat/gi, 'Casaco'],
        [/turn[- ]?down\s*collar/gi, 'gola clássica'],
        [/all[- ]?match/gi, 'versátil'],
        [/comfort(able)?/gi, 'confortável'],
        [/fashion/gi, 'Elegante'],
        [/metal\s*buckle/gi, 'fivela metálica'],
        [/slit/gi, 'Abertura'],
        [/cardigan/gi, 'Cardigã'],
        [/foreign\s*trade/gi, ''],
        [/new\b/gi, 'Novo'],
        [/temperament/gi, 'sofisticado']
      ];
      let name = raw;
      for (const [re, rep] of rules) name = name.replace(re, rep);
      // Capitalizar e reduzir ruído
      name = name.replace(/\s{2,}/g, ' ').trim();
      // Pequenas curadorias por padrão
      if (/Colete/i.test(name) && /Tricot/i.test(name)) name = 'Colete em Tricot Elegante';
      if (/Top/i.test(name) && /Algodão|Linho/i.test(name)) name = 'Top em Algodão e Linho';
      if (/Suéter|Tricot/i.test(name) && /Decote em V/i.test(name)) name = 'Suéter em Tricot com Decote em V';
      // Normalizações adicionais para casacos
      name = name
        .replace(/Casaco em lã com gola clássica/i, 'Casaco em lã com gola clássica')
        .replace(/Casaco em lã/i, 'Casaco em lã')
        .replace(/\bversátil\b(?!\s*e\s*confortável)/i, 'Versátil')
        .replace(/\bconfortável\b/i, 'Confortável');
      // Remover duplicatas de palavras consecutivas
      name = name.replace(/(\b\w+\b)(\s+\1\b)+/gi, '$1');
      // Garantir capitalização de início
      name = name.charAt(0).toUpperCase() + name.slice(1);
      return name;
    };

    // 1) Pré-formatar com nomes candidatos (para evitar duplicados)
    const pre = products.map((product) => {
      const pid = String(product.id);
      const fromDb = Array.isArray(product.images) ? (product.images as any[]) : [];
      const fromManifest = (manifestImages[pid] || []).map((src: string) => ({ src }));
      const mergedImages = (fromDb.length ? fromDb : fromManifest);

      const base = rename(product.name);
      const lowerRaw = (product.name || '').toLowerCase();
      const qualifiers: string[] = [];
      if (/rhombus|diamond|losang/i.test(lowerRaw)) qualifiers.push('com Losangos');
      if (/hollow|cut[- ]?out|recort/i.test(lowerRaw)) qualifiers.push('com Recortes');
      if (/linen|linho/i.test(lowerRaw) && !/Linho/i.test(base)) qualifiers.push('em Linho');
      if (/cotton|algod/i.test(lowerRaw) && !/Algodão/i.test(base)) qualifiers.push('em Algodão');
      if (/loose|oversized/i.test(lowerRaw) && !/Ajuste solto/i.test(base)) qualifiers.push('Ajuste solto');
      if (/slimming/i.test(lowerRaw) && !/Modelagem que valoriza/i.test(base)) qualifiers.push('Modelagem que valoriza');

      const firstQualifier = qualifiers.find(q => !base.includes(q)) || '';
      const initialName = firstQualifier ? `${base} ${firstQualifier}` : base;

      return {
        product,
        initialName,
        qualifiers,
        mergedImages,
      };
    });

    // 2) Resolver duplicados distribuindo qualificadores; se persistir, adicionar sufixo elegante
    const nameToIndices = new Map<string, number[]>();
    pre.forEach((p, idx) => {
      const arr = nameToIndices.get(p.initialName) || [];
      arr.push(idx);
      nameToIndices.set(p.initialName, arr);
    });

    const roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const finalNames: string[] = pre.map(p => p.initialName);

    for (const [name, indices] of nameToIndices.entries()) {
      if (indices.length <= 1) continue;
      indices.forEach((idx, i) => {
        if (i === 0) return; // Mantém o primeiro
        const p = pre[idx];
        // Tenta outro qualificador que ainda não esteja no nome
        const extra = p.qualifiers.find(q => !finalNames[idx].includes(q) && !finalNames.some(n => n === `${name} ${q}`));
        if (extra) {
          finalNames[idx] = `${name} ${extra}`;
        } else {
          finalNames[idx] = `${name} – Edição ${roman[i] || i + 1}`;
        }
      });
    }

    // 3) Montar resposta final
    const formattedProducts = pre.map((entry, idx) => {
      const { product, mergedImages } = entry;
      return ({
        id: product.id,
        name: finalNames[idx],
        slug: product.id,
        description: (product.description || '').replace(/cj/gi, '').replace(/Dropshipping/gi, '').replace(/–\s*peça selecionada.*$/i, '').trim(),
        short_description: ((product.description || '').length > 110 ? (product.description || '').slice(0, 110) + '…' : (product.description || '')),
        price: product.priceMin,
        compare_at_price: product.priceMax,
        images: mergedImages.map((img: any) => (typeof img === 'string' ? { src: img } : img)),
        category: product.category,
        stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
        available: product.variants.some((v) => v.stock > 0),
        featured: true,
        variants: product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stock: variant.stock,
          name: variant.name,
        })),
        created_at: product.createdAt.toISOString(),
        updated_at: product.updatedAt.toISOString(),
      });
    });

    return new NextResponse(JSON.stringify({ products: formattedProducts }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ message: "Produtos gerenciados via CJ Dropshipping", status: "ready_for_migration" });
}


