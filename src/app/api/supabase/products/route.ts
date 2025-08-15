import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');

    // Buscar produtos do Supabase
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images(src, alt, position, is_primary),
        product_variants(id, name, sku, price, stock, attributes)
      `)
      .eq('status', 'publish');

    if (featured) {
      query = query.eq('featured', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: products, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Erro Supabase:', error);
      throw error;
    }

    // Carregar manifest de imagens como fallback
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

    // Função para padronizar nomes de produtos (igual ao catálogo)
    function getDisplayName(productName: string): string {
      const original = (productName || '').trim();
      if (!original) return 'Peça Elegante';
      const s = original.toLowerCase();

        // Overrides por padrões conhecidos (CJ)
  const patterns: Array<{ re: RegExp; label: string }> = [
    { re: /(woolen|wool)\s+.*coat|coat.*(woolen|wool)/i, label: 'Casaco de Lã Clássico' },
    { re: /(turn[- ]down\s+collar).*(coat)/i, label: 'Casaco Gola Clássica' },
    { re: /(cotton\s+and\s+linen|cotton\s*&\s*linen).*suit/i, label: 'Conjunto Algodão & Linho' },
    { re: /(cotton\s+and\s+linen|cotton\s*&\s*linen).*top/i, label: 'Top Algodão & Linho' },
    { re: /(metal\s+buckle).*vest|vest.*(metal\s+buckle)/i, label: 'Colete com Fivela' },
    { re: /(v[- ]neck).*sweater.*vest|sweater.*vest.*(v[- ]neck)/i, label: 'Colete Tricot Decote V' },
    { re: /(hollow|hollowed|hollow-out|hollow out).*rhombus.*(vest|sweater)/i, label: 'Colete Tricot Vazado' },
    { re: /(knitted|knit).*vest/i, label: 'Colete Tricot' },
    { re: /(cardigan)/i, label: 'Cardigã Elegante' },
  ];
      for (const ptn of patterns) {
        if (ptn.re.test(original)) return ptn.label;
      }

      // Mapeamento simples EN -> PT para fallback elegante
      const wordMap: Record<string, string> = {
        sweater: 'Suéter',
        vest: 'Colete',
        cardigan: 'Cardigã',
        coat: 'Casaco',
        top: 'Top',
        knitted: 'Tricot',
        knit: 'Tricot',
        woolen: 'Lã',
        wool: 'Lã',
        cotton: 'Algodão',
        linen: 'Linho',
        'v-neck': 'Decote V',
        hollow: 'Vazado',
        rhombus: 'Losangos',
        slit: 'Fenda',
        metal: 'Metal',
        buckle: 'Fivela',
      };

      const stopWords = [
        "women's",
        'women',
        "men's",
        'men',
        'fashion',
        'casual',
        'comfort',
        'comfortable',
        'slim',
        'slim fit',
        'loose',
        'all-match',
        'foreign',
        'trade',
        'new',
        'lightly',
        'mature',
        'temperament',
        'basic',
        'simple',
        'solid',
        'color',
        'pocket',
        'pockets',
        'women\'s',
      ];

      const cleaned = s
        .replace(/[^a-z0-9\-\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const tokens = cleaned
        .split(' ')
        .filter((w) => w && !stopWords.includes(w))
        .map((w) => wordMap[w] || wordMap[w as keyof typeof wordMap] || w)
        .filter(Boolean);

      // Prioriza tipo + até 2 qualificadores
      const typeIdx = tokens.findIndex((t) => ['Casaco', 'Cardigã', 'Colete', 'Suéter', 'Top', 'Vestido', 'Conjunto'].includes(t));
      let result: string[] = [];
      if (typeIdx >= 0) {
        result.push(tokens[typeIdx]);
        const qualifiers = tokens.filter((t, i) => i !== typeIdx && ['Tricot', 'Lã', 'Algodão', 'Linho', 'Decote', 'Decote V', 'Vazado', 'Losangos', 'Fenda', 'Metal', 'Fivela', 'Clássica', 'Gola', 'Gola V'].includes(t));
        result.push(...qualifiers.slice(0, 2));
      } else {
        result = tokens.slice(0, 3);
      }

      // Título elegante e curto
      const title = result
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        .trim();

      return title || 'Peça Elegante';
    }

    // Formatar produtos para o frontend
    const formattedProducts = (products || []).map((product: any) => {
      // Mapear ID do produto para o manifest usando o slug
      const productSlug = product.slug;
      let manifestKey = null;
      
      // Tentar encontrar por slug (produto-1, produto-2, etc.)
      if (productSlug && productSlug.startsWith('produto-')) {
        const productNumber = productSlug.replace('produto-', '');
        manifestKey = productNumber;
      }
      
      // Se não encontrar por slug, tentar por ID
      if (!manifestKey) {
        manifestKey = Object.keys(manifestImages).find(key => 
          key === product.id || key === `produto-${product.id}`
        );
      }
      
      // Usar imagens do manifest (prioridade) ou do Supabase
      let images = [];
      if (manifestKey && manifestImages[manifestKey]) {
        // Usar imagens do manifest.json
        images = manifestImages[manifestKey].map((src: string) => ({ 
          src, 
          alt: product.name || 'Imagem do produto' 
        }));
      } else if (product.product_images && product.product_images.length > 0) {
        // Fallback para imagens do Supabase
        images = product.product_images
          .sort((a: any, b: any) => a.position - b.position)
          .map((img: any) => ({ src: img.src, alt: img.alt }));
      }

      // Formatar variantes
      const variants = (product.product_variants || []).map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        name: variant.name,
        attributes: variant.attributes
      }));

      // Calcular estoque total
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

      // Usar nomes corretos do catálogo
      const displayName = getDisplayName(product.name);

      return {
        id: product.id,
        name: displayName,
        slug: product.slug,
        description: product.description || '',
        short_description: product.short_description || '',
        price: Number(product.price || 0),
        compare_at_price: Number(product.original_price || product.compare_at_price || 0),
        images,
        category: product.category || 'Coleção',
        stock: totalStock,
        available: totalStock > 0,
        featured: Boolean(product.featured),
        variants,
        created_at: product.created_at,
        updated_at: product.updated_at
      };
    });

    return new NextResponse(JSON.stringify({ products: formattedProducts }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300'
      }
    });

  } catch (error) {
    console.error('Erro ao buscar produtos do Supabase:', error);
    
    // Fallback para manifest local
    try {
      const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
      const raw = await fs.readFile(manifestPath, 'utf-8');
      const parsed: any = JSON.parse(raw || '{}');
      const manifestImages: Record<string, string[]> = {};
      
      if (parsed && typeof parsed === 'object') {
        for (const [key, value] of Object.entries(parsed)) {
          if (Array.isArray(value)) {
            manifestImages[String(key)] = value as string[];
          } else if (value && typeof value === 'object' && Array.isArray((value as any).images)) {
            manifestImages[String(key)] = (value as any).images as string[];
          }
        }
      }

      const nowIso = new Date().toISOString();
      const fallbackProducts = Object.entries(manifestImages).map(([pid, imgs]) => ({
        id: pid,
        name: `Produto ${pid}`,
        slug: pid,
        description: '',
        short_description: '',
        price: 0,
        compare_at_price: 0,
        images: (imgs as string[]).map((src) => ({ src })),
        category: 'Coleção',
        stock: 0,
        available: true,
        featured: true,
        variants: [],
        created_at: nowIso,
        updated_at: nowIso,
      }));

      return new NextResponse(JSON.stringify({ products: fallbackProducts }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=300'
        }
      });
    } catch (e) {
      return NextResponse.json({ products: [] }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    message: "API Supabase ativa - Produtos gerenciados via Supabase", 
    status: "active" 
  });
}
