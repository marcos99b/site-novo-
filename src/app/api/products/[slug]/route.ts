import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

// usando instância compartilhada de prisma de '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const productSlug = params.slug;

    // Buscar produto no banco por ID (fallback para slug)
    const product = await prisma.product.findUnique({
      where: { id: productSlug },
      include: {
        variants: true
      }
    });

    if (!product) {
      // Fallback: tentar manifest local para não quebrar a PDP quando o DB estiver vazio
      try {
        const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
        const raw = await fs.readFile(manifestPath, 'utf-8');
        const parsed: any = JSON.parse(raw || '{}');
        const entry = parsed?.[productSlug];
        const images = Array.isArray(entry)
          ? (entry as string[]).map((src) => ({ src }))
          : (entry && Array.isArray(entry?.images))
            ? (entry.images as string[]).map((src: string) => ({ src }))
            : [];

        if (images.length) {
          const fallback = {
            id: productSlug,
            cjProductId: null,
            name: `Produto ${productSlug}`,
            description: 'Descrição em preparação.',
            price: 0,
            compare_at_price: 0,
            images,
            category: 'Coleção',
            stock: 0,
            available: true,
            variants: [],
            colors: [],
            sizes: [],
            variant_matrix: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          return NextResponse.json({ product: fallback });
        }
      } catch {}

      return NextResponse.json(
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Função auxiliar para derivar cor a partir de strings comuns
    const deriveColor = (raw?: string) => {
      const s = (raw || '').toLowerCase();
      const map: Array<[RegExp, string]> = [
        [/\b(preto|black|noir|negro)\b/, 'Preto'],
        [/\b(branco|white|blanc)\b/, 'Branco'],
        [/\b(cinza|grey|gray|gris)\b/, 'Cinza'],
        [/\b(bege|beige)\b/, 'Bege'],
        [/\b(caqui|khaki)\b/, 'Caqui'],
        [/\b(marfim|ivory|off\s*white)\b/, 'Marfim'],
        [/\b(castanho|marrom|brown|coffee)\b/, 'Castanho'],
        [/\b(azul|blue|navy)\b/, 'Azul'],
        [/\b(verde|green|olive)\b/, 'Verde'],
        [/\b(vermelho|red|rouge)\b/, 'Vermelho'],
        [/\b(rosa|pink|rose)\b/, 'Rosa'],
      ];
      for (const [re, name] of map) if (re.test(s)) return name;
      return null;
    };

    // Formatar produto para compatibilidade com o frontend
    // Montar matrizes de cores e tamanhos
    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();
    const matrix: Array<{ color: string | null; size: string; variantId: string; stock: number; price: number }>
      = [];
    const sizeFrom = (vName: string, sku?: string): string => {
      const m = vName.match(/tamanho\s*(XS|S|M|L|XL)/i);
      if (m) return m[1].toUpperCase();
      const m2 = (sku || '').match(/_(XS|S|M|L|XL)\b/i);
      if (m2) return m2[1].toUpperCase();
      return 'Único';
    };
    for (const v of product.variants as any[]) {
      const color = (v as any).color || null;
      const size = sizeFrom(String(v.name || ''), String(v.sku || ''));
      if (color) colorsSet.add(color);
      if (size) sizesSet.add(size);
      matrix.push({ color, size, variantId: v.id, stock: v.stock, price: v.price });
    }

    // Se não houver cores derivadas, aplicar fallback offline por produto (até CJ conectar)
    const fallbackColorsByProduct: Record<string, string[]> = {
      '1': ['Preto', 'Bege'],
      '2': ['Bege', 'Castanho'],
      '3': ['Branco', 'Bege'],
      '4': ['Cinza', 'Azul'],
      '5': ['Bege', 'Castanho'],
      '6': ['Preto', 'Marfim']
    };
    if (colorsSet.size === 0 && fallbackColorsByProduct[product.id]) {
      fallbackColorsByProduct[product.id].forEach(c => colorsSet.add(c));
    }

    const formattedProduct = {
      id: product.id,
      cjProductId: (product as any).cjProductId,
      name: product.name,
      description: product.description,
      price: product.priceMin,
      compare_at_price: product.priceMax,
      images: product.images,
      category: product.category,
      stock: product.variants.reduce((sum: number, v: { stock: number }) => sum + (v?.stock || 0), 0),
      available: product.variants.some((v: { stock: number }) => (v?.stock || 0) > 0),
      variants: product.variants.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        name: variant.name,
        color: deriveColor(variant.name) || deriveColor(variant.sku) || null,
        cjVid: (variant as any).cjVariantId || null
      })),
      colors: Array.from(colorsSet),
      sizes: Array.from(sizesSet),
      variant_matrix: (colorsSet.size > 0 && matrix.length)
        ? (() => {
            const out: Array<{ color: string | null; size: string; variantId: string; cjVid: string | null; stock: number; price: number }> = [];
            const sizes = Array.from(sizesSet);
            const colors = Array.from(colorsSet);
            for (const color of colors) {
              for (const size of sizes) {
                const base = matrix.find(m => m.size === size) || matrix[0];
                if (base) {
                  const vRow = (product.variants as any[]).find(v => v.id === base.variantId);
                  const cjVid = vRow ? (vRow as any).cjVariantId || null : null;
                  out.push({ color, size, variantId: base.variantId, cjVid, stock: base.stock, price: base.price });
                }
              }
            }
            return out;
          })()
        : matrix,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString()
    };

    return NextResponse.json({ product: formattedProduct });
  } catch (error) {
    // Fallback final: tentar manifest para não quebrar a PDP quando DB falhar
    try {
      const productSlug = params.slug;
      const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
      const raw = await fs.readFile(manifestPath, 'utf-8');
      const parsed: any = JSON.parse(raw || '{}');
      const entry = parsed?.[productSlug];
      const images = Array.isArray(entry)
        ? (entry as string[]).map((src) => ({ src }))
        : (entry && Array.isArray(entry?.images))
          ? (entry.images as string[]).map((src: string) => ({ src }))
          : [];
      if (images.length) {
        const fallback = {
          id: productSlug,
          cjProductId: null,
          name: `Produto ${productSlug}`,
          description: 'Descrição em preparação.',
          price: 0,
          compare_at_price: 0,
          images,
          category: 'Coleção',
          stock: 0,
          available: true,
          variants: [],
          colors: [],
          sizes: [],
          variant_matrix: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        return NextResponse.json({ product: fallback });
      }
    } catch {}
    console.error('Erro ao buscar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
