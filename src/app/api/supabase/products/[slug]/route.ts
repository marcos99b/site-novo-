import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

// Cliente Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const productSlug = params.slug;

    // Buscar produto no Supabase por slug
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images(src, alt, position, is_primary),
        product_variants(id, name, sku, price, stock, attributes)
      `)
      .eq('slug', productSlug)
      .eq('status', 'publish')
      .single();

    if (error || !product) {
      // Fallback para manifest local
      try {
        const manifestPath = path.join(process.cwd(), 'public', 'produtos', 'manifest.json');
        const raw = await fs.readFile(manifestPath, 'utf-8');
        const parsed: any = JSON.parse(raw || '{}');
        
        // Tentar encontrar produto por ID ou slug
        let entry = parsed?.[productSlug];
        if (!entry) {
          // Tentar por slug
          const slugKey = Object.keys(parsed).find(key => 
            parsed[key] && typeof parsed[key] === 'object' && parsed[key].slug === productSlug
          );
          if (slugKey) entry = parsed[slugKey];
        }
        
        const images = Array.isArray(entry)
          ? (entry as string[]).map((src) => ({ src }))
          : (entry && Array.isArray(entry?.images))
            ? (entry.images as string[]).map((src: string) => ({ src }))
            : [];

        if (images.length) {
          const fallback = {
            id: productSlug,
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

    // Função auxiliar para derivar cor a partir de atributos
    const deriveColor = (attributes: any): string | null => {
      if (!attributes) return null;
      
      const colorMap: Record<string, string> = {
        'preto': 'Preto',
        'black': 'Preto',
        'noir': 'Preto',
        'negro': 'Preto',
        'branco': 'Branco',
        'white': 'Branco',
        'blanc': 'Branco',
        'cinza': 'Cinza',
        'grey': 'Cinza',
        'gray': 'Cinza',
        'gris': 'Cinza',
        'bege': 'Bege',
        'beige': 'Bege',
        'caqui': 'Caqui',
        'khaki': 'Caqui',
        'marfim': 'Marfim',
        'ivory': 'Marfim',
        'off-white': 'Marfim',
        'castanho': 'Castanho',
        'marrom': 'Castanho',
        'brown': 'Castanho',
        'coffee': 'Castanho',
        'azul': 'Azul',
        'blue': 'Azul',
        'navy': 'Azul',
        'verde': 'Verde',
        'green': 'Verde',
        'olive': 'Verde',
        'vermelho': 'Vermelho',
        'red': 'Vermelho',
        'rouge': 'Vermelho',
        'rosa': 'Rosa',
        'pink': 'Rosa',
        'rose': 'Rosa'
      };

      if (attributes.color) {
        const color = attributes.color.toLowerCase();
        return colorMap[color] || attributes.color;
      }

      // Tentar extrair cor do nome ou SKU
      const name = (attributes.name || '').toLowerCase();
      const sku = (attributes.sku || '').toLowerCase();
      
      for (const [key, value] of Object.entries(colorMap)) {
        if (name.includes(key) || sku.includes(key)) {
          return value;
        }
      }

      return null;
    };

    // Formatar variantes
    const variants = (product.product_variants || []).map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      name: variant.name,
      color: deriveColor(variant.attributes),
      attributes: variant.attributes
    }));

    // Montar matrizes de cores e tamanhos
    const colorsSet = new Set<string>();
    const sizesSet = new Set<string>();
    const matrix: Array<{ color: string | null; size: string; variantId: string; stock: number; price: number }> = [];

    variants.forEach((variant: any) => {
      const color = variant.color;
      const size = variant.attributes?.size || 'Único';
      
      if (color) colorsSet.add(color);
      if (size) sizesSet.add(size);
      
      matrix.push({ 
        color, 
        size, 
        variantId: variant.id, 
        stock: variant.stock, 
        price: variant.price 
      });
    });

    // Se não houver cores derivadas, aplicar fallback por produto
    const fallbackColorsByProduct: Record<string, string[]> = {
      '1': ['Preto', 'Bege'],
      '2': ['Bege', 'Castanho'],
      '3': ['Branco', 'Bege'],
      '4': ['Cinza', 'Azul'],
      '5': ['Bege', 'Castanho'],
      '6': ['Preto', 'Marfim']
    };

    if (colorsSet.size === 0 && fallbackColorsByProduct[productSlug]) {
      fallbackColorsByProduct[productSlug].forEach(c => colorsSet.add(c));
    }

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

    // Mapear imagens do manifest.json
    let images = [];
    let manifestKey = null;
    
    // Carregar manifest de imagens
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
    
    // Tentar encontrar por slug (produto-1, produto-2, etc.)
    if (product.slug && product.slug.startsWith('produto-')) {
      const productNumber = product.slug.replace('produto-', '');
      manifestKey = productNumber;
    }
    
    // Se não encontrar por slug, tentar por ID
    if (!manifestKey) {
      manifestKey = Object.keys(manifestImages).find(key => 
        key === product.id || key === `produto-${product.id}`
      );
    }
    
    // Usar imagens do manifest (prioridade) ou do Supabase
    if (manifestKey && manifestImages[manifestKey]) {
      // Usar imagens do manifest.json
      images = manifestImages[manifestKey].map((src: string) => ({ 
        src, 
        alt: product.name || 'Imagem do produto' 
      }));
    } else if (product.product_images && product.product_images.length > 0) {
      // Fallback para imagens do Supabase
      images = (product.product_images || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((img: any) => ({ src: img.src, alt: img.alt }));
    }

    // Formatar produto para compatibilidade com o frontend
    const formattedProduct = {
      id: product.id,
      name: getDisplayName(product.name),
      description: product.description || '',
      price: Number(product.price || 0),
      compare_at_price: Number(product.original_price || product.compare_at_price || 0),
      originalPrice: Number(product.original_price || product.price || 0),
      images: images,
      category: product.category || 'Coleção',
      stock: variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0),
      available: variants.some((v: any) => (v.stock || 0) > 0),
      variants,
      colors: Array.from(colorsSet),
      sizes: Array.from(sizesSet),
      variant_matrix: matrix,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    return NextResponse.json({ product: formattedProduct });

  } catch (error) {
    console.error('Erro ao buscar produto do Supabase:', error);
    
    // Fallback final para manifest
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
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
