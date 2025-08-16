'use client';

import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useMemo } from 'react';

// Remover tracking para performance máxima
// // Remover tracking para performance máxima
// import { trackProductView, trackUserEvent } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProductImage from '@/components/ProductImage';
import toast from 'react-hot-toast';
import { formatEUR } from '@/lib/currency';

// Funções para avaliações variadas por produto
function getProductRating(slug: string): number {
  const ratings: Record<string, number> = {
    'produto-1': 4.7, // Casaco de Lã
    'produto-2': 4.5, // Conjunto Algodão
    'produto-5': 4.8, // Colete Tricot
    'produto-6': 4.4, // Colete com Fivela
    'produto-7': 4.9, // Pantufas de Couro Premium
    'produto-8': 4.6, // Bolsa Tote Designer de Inverno
  };
  return ratings[slug] || 4.6;
}

function getProductReviews(slug: string): number {
  const reviews: Record<string, number> = {
    'produto-1': 127, // Casaco de Lã
    'produto-2': 89, // Conjunto Algodão
    'produto-5': 156, // Colete Tricot
    'produto-6': 73, // Colete com Fivela
    'produto-7': 94, // Pantufas de Couro Premium
    'produto-8': 112, // Bolsa Tote Designer de Inverno
  };
  return reviews[slug] || 47;
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

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  stock: number;
  features: string[];
  variants?: any[];
  images?: { src: string; alt?: string }[];
  video?: string | null;
  colors?: string[];
  sizes?: string[];
  variant_matrix?: Array<{ color: string | null; size: string; variantId: string; stock: number; price: number }>;
}

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeType, setActiveType] = useState<'image' | 'video'>('image');
  const router = useRouter();
  const productSlug = params.slug as string;

  useEffect(() => {
    if (productSlug) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/supabase/products/${productSlug}`);
          
          if (!response.ok) {
            throw new Error('Produto não encontrado');
          }
          
          const data = await response.json();
          setProduct(data.product);
        } catch (error) {
          console.error('Erro ao buscar produto:', error);
          setProduct(null);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProduct();
    }
  }, [productSlug]);

  // Remover tracking para performance máxima
  // useEffect(() => {
  //   if (!productSlug) return;
  //   trackProductView(String(productSlug)).catch(() => {});
  // }, [productSlug]);

  // Variante selecionada (tamanho)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  useEffect(() => { setSelectedVariantIndex(0); }, [productSlug]);
  const selectedVariantPrice = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return product?.price || 0;
    const v = product.variants[selectedVariantIndex] || product.variants[0];
    return v?.price ?? product.price;
  }, [product, selectedVariantIndex]);

  // Derivar cores simples a partir dos nomes das variantes
  const derivedColors: string[] = useMemo(() => {
    if (product?.colors && product.colors.length) return product.colors;
    const colorList = ['preto','branco','bege','cinza','azul','verde','vermelho','rosa','marfim','caqui','castanho','marrom'];
    const found = new Set<string>();
    (product?.variants || []).forEach((v: any) => {
      const n = (v?.name || '').toLowerCase();
      colorList.forEach((c) => { if (n.includes(c)) found.add(c.charAt(0).toUpperCase()+c.slice(1)); });
    });
    return Array.from(found);
  }, [product]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  useEffect(() => { setSelectedColor(derivedColors[0] || null); }, [derivedColors]);

  const savingsPercent = useMemo(() => {
    if (!product) return 0;
    const orig = product.originalPrice || product.price;
    if (!orig || orig <= (selectedVariantPrice || product.price)) return 0;
    return Math.round(((orig - (selectedVariantPrice || product.price)) / orig) * 100);
  }, [product, selectedVariantPrice]);

  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Avatares externos reais (mulheres europeias) – fonte randomuser.me
  const femaleAvatars = Array.from({ length: 48 }).map((_, i) => `https://randomuser.me/api/portraits/women/${i}.jpg`);

  function buildTestimonials(prod: Product | null) {
    if (!prod) return [] as Array<{ name: string; location: string; text: string; avatar: string; rating: number; verified: boolean }>;
    const pickAvatar = (i: number) => femaleAvatars[i % femaleAvatars.length] || '/placeholder.jpg';
    const namePool = ['Inês Martins', 'Beatriz Ferreira', 'Sofia Carvalho', 'Marta Almeida', 'Carolina Dias', 'Ana Pereira'];
    const locPool = ['Lisboa', 'Porto', 'Braga', 'Coimbra', 'Setúbal', 'Faro'];
    const seed = Number(String(prod.id).replace(/\D/g, '')) || 1;
    const choose = (arr: string[], offset: number) => arr[(seed + offset) % arr.length];
    const t1 = `Caimento impecável e acabamento limpo. Usei em jantar e escritório — versátil e muito confortável.`;
    const t2 = `Qualidade acima do esperado. Silhueta elegante sem esforço; medidas fiéis ao guia.`;
    const t3 = `Entrega rápida em ${choose(locPool, 2)}. Excelente custo‑benefício pela estrutura e tecido.`;
    // variar avatares por produto para evitar repetição
    const base = (seed % femaleAvatars.length + femaleAvatars.length) % femaleAvatars.length;
    return [
      { name: choose(namePool, 0), location: choose(locPool, 0), text: t1, avatar: pickAvatar(base), rating: 5, verified: true },
      { name: choose(namePool, 1), location: choose(locPool, 1), text: t2, avatar: pickAvatar(base + 1), rating: 5, verified: true },
      { name: choose(namePool, 2), location: choose(locPool, 2), text: t3, avatar: pickAvatar(base + 2), rating: 4.5, verified: true },
    ];
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="loading-elegant text-center">
          <div className="loading-elegant__spinner" />
          <div className="loading-elegant__label">A carregar produto…</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1f1f1f] mb-2">Produto não encontrado</h1>
          <p className="text-black/60">O produto que procura não existe.</p>
        </div>
      </div>
    );
  }

  function buildRefinedCopy(name: string): string[] {
    const base = name || 'a peça';
    return [
      `${base} foi escolhida pela sua construção impecável e caimento que valoriza a silhueta feminina. O tecido tem toque macio e estrutura que não marca, ideal para o dia a dia ou eventos com dress code smart.`,
      `Detalhes de acabamento garantem sofisticação sem esforço: costuras limpas, linhas modernas e proporções equilibradas. Combine com saltos médios e casacos leves para um coordenado elegante à portuguesa.`,
      `Conselhos de cuidado: lavar do avesso em água fria, secar à sombra e passar a baixa temperatura para preservar o brilho e a textura.`,
    ];
  }

  const handleAddToCart = () => {
    addToCart(
      { id: product.id, name: product.name, price: selectedVariantPrice || product.price, images: [{ src: product.image, alt: product.name }], slug: productSlug },
      quantity
    );
    toast.success(`${product.name} adicionado ao carrinho!`);
    // trackUserEvent('add_to_cart', { product_id: product.id, qty: quantity, price: selectedVariantPrice || product.price }, window.location.pathname).catch(() => {});
  };

  const handleBuyNow = async () => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{
            id: productSlug,
            name: product?.name || 'Produto',
            price: selectedVariantPrice || product?.price || 0,
            quantity: quantity,
            image: product?.images?.[0]?.src || product?.image || '/placeholder.jpg'
          }]
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar checkout');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar checkout');
    }
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* JSON-LD Product para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: (product.images || []).map(i => i.src).slice(0, 8),
            description: product.description,
            brand: { '@type': 'Brand', name: 'Reliet' },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'EUR',
              price: String(selectedVariantPrice || product.price),
              availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              url: typeof window !== 'undefined' ? window.location.href : undefined
            }
          }) }}
        />
                {/* ===== LAYOUT RESPONSIVO PREMIUM ===== */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
          
          {/* ===== GALERIA SIMPLES ===== */}
          <div className="order-1 xl:order-1">
            {/* Imagem principal */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-[4/5]">
              {activeType === 'video' && product.video ? (
                <video 
                  src={product.video} 
                  className="w-full h-full object-cover" 
                  autoPlay loop muted playsInline 
                />
              ) : (
                <ProductImage 
                  src={(product.images?.[activeImageIndex]?.src) || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover" 
                  priority 
                />
              )}
            </div>
            
            {/* Miniaturas */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4">
                <div className="flex gap-2 overflow-x-auto">
                  {product.video && (
                    <button
                      onClick={() => { setActiveType('video'); setActiveImageIndex(0); }}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                        activeType === 'video' 
                          ? 'border-blue-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>
                  )}
                  
                  {product.images.map((img: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => { setActiveType('image'); setActiveImageIndex(index); }}
                      className={`flex-shrink-0 w-16 h-16 rounded border-2 ${
                        activeType === 'image' && activeImageIndex === index 
                          ? 'border-blue-500' 
                          : 'border-gray-300'
                      }`}
                    >
                      <ProductImage 
                        src={img.src} 
                        alt={img.alt || product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== PAINEL DE INFORMAÇÕES PREMIUM ===== */}
          <div className="order-2 xl:order-2 p-4 lg:p-6 xl:p-8 bg-white rounded-xl lg:rounded-2xl border border-slate-200 shadow-sm lg:shadow-lg">
            {/* ===== SEÇÃO 1: IDENTIFICAÇÃO DO PRODUTO ===== */}
            <div className="mb-6 lg:mb-8">
              {/* Header do produto */}
              <div className="mb-4 lg:mb-6">
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-royal font-bold text-slate-900 leading-tight mb-2 lg:mb-3 tracking-[0.2px]">{getDisplayName(product.name)}</h1>
                <p className="text-base lg:text-lg text-slate-600 font-medium">{getDisplayName(product.name)} - Peça elegante e sofisticada</p>
              </div>
              
              {/* Rating e Credibilidade - Responsivo */}
              <div className="flex flex-wrap items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} className={`w-4 h-4 lg:w-5 lg:h-5 ${i < Math.floor(getProductRating(productSlug)) ? 'text-amber-500' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.175 0L6.266 16.28c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.63 8.72c-.783-.57-.38-1.81.588-1.81H6.68a1 1 0 00.95-.69l1.418-4.292z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="text-lg lg:text-2xl font-bold text-slate-800">{getProductRating(productSlug)}</span>
                </div>
                
                <div className="hidden lg:block w-px h-6 bg-slate-300"></div>
                
                <div className="text-slate-600 text-sm lg:text-base">
                  <span className="font-semibold">{getProductReviews(productSlug)}</span> avaliações
                </div>
                
                <div className="hidden lg:block w-px h-6 bg-slate-300"></div>
                
                <div className="flex items-center gap-1 text-emerald-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Compra segura</span>
                </div>
              </div>
            </div>

            {/* ===== SEÇÃO 2: BENEFÍCIOS PREMIUM ===== */}
            <div className="mb-6 lg:mb-8">
              <div className="space-y-3 lg:space-y-4">
                {/* Benefício Premium */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-xl lg:rounded-2xl border border-slate-200 p-4 lg:p-6 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-start gap-3 lg:gap-4">
                    {/* Ícone Premium */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base lg:text-lg font-royal font-bold text-slate-800 tracking-[0.2px] text-left">
                          Silhueta Valorizada
                        </h3>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-royal font-medium rounded-full border border-slate-200 tracking-[0.2px] self-start">
                          PREMIUM
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4 font-royal tracking-[0.2px] text-sm lg:text-base text-left">
                        Caimento impecável que realça a elegância natural da silhueta feminina, criando uma silhueta harmoniosa e sofisticada.
                      </p>
                      <div className="flex flex-col gap-2 text-xs lg:text-sm text-slate-500 font-royal tracking-[0.2px]">
                        <span className="flex items-center gap-2 text-left">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                          <span>Corte atemporal</span>
                        </span>
                        <span className="flex items-center gap-2 text-left">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                          <span>Proporções perfeitas</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tecido Premium */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-xl lg:rounded-2xl border border-slate-200 p-4 lg:p-6 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-start gap-3 lg:gap-4">
                    {/* Emblema Sofisticado - Tecido */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base lg:text-lg font-royal font-bold text-slate-800 tracking-[0.2px] text-left">
                          Tecido Nobre
                        </h3>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-royal font-medium rounded-full border border-slate-200 tracking-[0.2px] self-start">
                          LUXO
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4 font-royal tracking-[0.2px] text-sm lg:text-base text-left">
                        Tecido premium de alta qualidade que proporciona conforto excepcional sem marcar, mantendo a elegância ao longo do dia.
                      </p>
                      <div className="flex flex-col gap-2 text-xs lg:text-sm text-slate-500 font-royal tracking-[0.2px]">
                        <span className="flex items-center gap-2 text-left">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                          <span>Fibra natural</span>
                        </span>
                        <span className="flex items-center gap-2 text-left">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                          <span>Respirabilidade</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Versatilidade Premium */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-xl lg:rounded-2xl border border-slate-200 p-4 lg:p-6 hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-start gap-3 lg:gap-4">
                    {/* Emblema Sofisticado - Versatilidade */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
                        <svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-base lg:text-lg font-royal font-bold text-slate-800 tracking-[0.2px] text-left">
                          Versatilidade Total
                        </h3>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-royal font-medium rounded-full border border-slate-200 tracking-[0.2px] self-start">
                          ICÓNICO
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4 font-royal tracking-[0.2px] text-sm lg:text-base text-left">
                        Transição perfeita do ambiente corporativo ao jantar elegante, mantendo sempre a sofisticação e o estilo atemporal.
                      </p>
                      <div className="flex flex-col gap-2 text-xs lg:text-sm text-slate-500 font-royal tracking-[0.2px]">
                        <span className="flex items-center gap-2 text-left">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                          <span>Dia ao jantar</span>
                        </span>
                        <span className="flex items-center gap-2 text-left">
                          <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-slate-400 rounded-full flex-shrink-0"></div>
                          <span>Estilo atemporal</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Separador Visual */}
              <div className="my-8 border-t border-gray-200"></div>
              
              {/* ===== SEÇÃO 3: ESCASSEZ & URGÊNCIA ===== */}
              <div className="mt-4">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-3 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-slate-600 to-gray-700 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-royal font-semibold text-slate-800 tracking-[0.2px]">Disponibilidade limitada</div>
                      <div className="text-xs text-slate-600 font-royal tracking-[0.2px]">
                        Apenas {Math.max(product.stock, 15)} unidades restantes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 4: DETALHES TÉCNICOS ===== */}
            <div className="mt-6 mb-8">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-gray-200 p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-royal font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent tracking-[0.2px]">Detalhes da Peça</h3>
                    <p className="text-sm text-gray-500 font-royal tracking-[0.2px]">Construção premium & acabamento atemporal</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-royal font-semibold text-gray-800 mb-2 flex items-center gap-2 tracking-[0.2px]">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Construção
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed font-royal tracking-[0.2px]">Costuras limpas, linhas modernas e proporções equilibradas que valorizam a silhueta feminina.</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-royal font-semibold text-gray-800 mb-2 flex items-center gap-2 tracking-[0.2px]">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Versatilidade
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed font-royal tracking-[0.2px]">Vai do dia ao jantar com elegância. Combine com saltos médios e casacos leves para um coordenado sofisticado.</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <h4 className="font-royal font-semibold text-gray-800 mb-2 flex items-center gap-2 tracking-[0.2px]">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        Cuidados
                      </h4>
                      <ul className="text-gray-600 text-sm space-y-2 font-royal tracking-[0.2px]">
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                          Lavar do avesso em água fria
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                          Secar à sombra
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                          Passar a baixa temperatura
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 5: PREÇO & DESCONTO ===== */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <div className="text-sm text-gray-500 mb-1">Preço atual</div>
                    <div className="text-3xl font-bold text-gray-900">{formatEUR(selectedVariantPrice || product.price)}</div>
                  </div>
                  {product.originalPrice > product.price && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">Preço original</div>
                      <div className="text-lg text-gray-400 line-through">{formatEUR(product.originalPrice)}</div>
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Poupa {savingsPercent}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 6: PERSONALIZAÇÃO ===== */}
            {derivedColors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  <div className="text-sm font-semibold text-gray-700">Cor disponível</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {derivedColors.map((c) => (
                    <button 
                      key={c} 
                      onClick={() => setSelectedColor(c)} 
                      aria-pressed={selectedColor===c} 
                      className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        selectedColor===c 
                          ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border-gray-800 shadow-lg scale-105' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 7: SELEÇÃO DE TAMANHO ===== */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                    <div className="text-sm font-semibold text-gray-700">Selecione o seu tamanho</div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSizeGuideOpen(true)} 
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    Guia de tamanhos
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {(() => {
                    // construir lista de tamanhos com base no filtro de cor
                    const sizes = new Set<string>();
                    (product.variant_matrix || []).forEach((row) => {
                      if (!selectedColor || row.color === selectedColor) sizes.add(row.size);
                    });
                    const ordered = ['XS','S','M','L','XL','Único'];
                    const sizeList = Array.from(sizes).sort((a,b)=> ordered.indexOf(a)-ordered.indexOf(b));
                    return sizeList.map((size) => {
                      const matching = (product.variant_matrix || []).find(r => (r.size===size) && (!selectedColor || r.color===selectedColor));
                      if (!matching) return null;
                      const i = (product.variants || []).findIndex((v:any)=> v.id===matching.variantId);
                      const selected = i === selectedVariantIndex;
                      const disabled = matching.stock === 0;
                      return (
                        <button key={size}
                          type="button"
                          aria-pressed={selected}
                          disabled={disabled}
                          onClick={() => { if (!disabled && i>=0) setSelectedVariantIndex(i); }}
                          className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                            selected 
                              ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white border-gray-800 shadow-lg scale-105' 
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          } ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-100' : ''}`}
                        >
                          {size}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 8: LOGÍSTICA & ENTREGA PREMIUM ===== */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-royal font-bold text-slate-800 mb-1 tracking-[0.2px]">Entrega Premium para Portugal</div>
                    <div className="text-sm text-slate-600 font-medium">Prazo estimado: 5–9 dias úteis • Trocas em 7 dias</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 9: QUANTIDADE PREMIUM ===== */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-700"></div>
                <div className="text-base font-royal font-bold text-slate-800 tracking-[0.2px]">Quantidade</div>
              </div>
              <div className="inline-flex items-center gap-4 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 rounded-3xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-300 flex items-center justify-center font-bold text-xl hover:scale-105"
                >
                  -
                </button>
                <span className="min-w-[4rem] text-center text-xl font-royal font-bold text-slate-800 tracking-[0.2px]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 transition-all duration-300 flex items-center justify-center font-bold text-xl hover:scale-105"
                >
                  +
                </button>
              </div>
            </div>

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 10: AÇÃO DE COMPRA PREMIUM ===== */}
            <div className="flex flex-col sm:flex-row gap-5 mb-8">
              <button 
                onClick={handleBuyNow} 
                className="flex-1 btn-buy-now py-5 px-8 rounded-3xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3 tracking-[0.2px]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Comprar agora
              </button>
              <button 
                onClick={handleAddToCart} 
                className="flex-1 btn-add-to-cart py-5 px-8 rounded-3xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3 tracking-[0.2px]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
                Adicionar ao carrinho
              </button>
            </div>

            {/* Separador Visual */}
            <div className="my-8 border-t border-gray-200"></div>

            {/* ===== SEÇÃO 11: EMBLEMAS 3D PROFISSIONAIS & INOVADORES ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {[
                { 
                  label: 'Envio para Portugal', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ), 
                  color: 'from-blue-600 to-indigo-700', 
                  bg: 'bg-gradient-to-br from-blue-50 to-indigo-50', 
                  border: 'border-blue-200',
                  tech: 'Logística Premium',
                  accent: 'from-blue-400 to-indigo-500'
                },
                { 
                  label: 'Trocas em 7 dias', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ), 
                  color: 'from-emerald-600 to-teal-700', 
                  bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', 
                  border: 'border-emerald-200',
                  tech: 'Flexibilidade Total',
                  accent: 'from-emerald-400 to-teal-500'
                },
                { 
                  label: 'Pagamento seguro', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ), 
                  color: 'from-purple-600 to-violet-700', 
                  bg: 'bg-gradient-to-br from-purple-50 to-violet-50', 
                  border: 'border-purple-200', 
                  sub: 'Stripe/PayPal',
                  tech: 'Criptografia Avançada',
                  accent: 'from-purple-400 to-violet-500'
                },
                { 
                  label: 'Qualidade verificada', 
                  icon: (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ), 
                  color: 'from-amber-600 to-orange-700', 
                  bg: 'bg-gradient-to-br from-amber-50 to-orange-50', 
                  border: 'border-amber-200',
                  tech: 'Certificação Digital',
                  accent: 'from-amber-400 to-orange-500'
                }
              ].map((item, i) => (
                <div key={i} className={`rounded-3xl border-2 ${item.border} ${item.bg} p-6 transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl group relative overflow-hidden perspective-1000`}>
                  {/* Efeito 3D de profundidade */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  
                  {/* Sombra 3D interna */}
                  <div className="absolute inset-2 bg-gradient-to-br from-black/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-4">
                      {/* Ícone 3D com profundidade */}
                      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-2xl group-hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-1 transform-gpu`}>
                        {item.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-royal font-bold text-gray-800 text-lg mb-2 tracking-[0.2px] group-hover:text-gray-900 transition-colors duration-500">{item.label}</div>
                        {item.sub && <div className="text-sm text-gray-600 font-medium group-hover:text-gray-700 transition-colors duration-500">{item.sub}</div>}
                      </div>
                    </div>
                    
                    {/* Badge tecnológico 3D */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-105">
                      {/* Indicador de tecnologia animado */}
                      <div className="relative">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.accent} animate-pulse`}></div>
                        <div className={`absolute inset-0 w-3 h-3 rounded-full bg-gradient-to-r ${item.accent} animate-ping opacity-75`}></div>
                      </div>
                      
                      <span className="text-sm font-royal font-semibold text-gray-700 tracking-[0.2px] group-hover:text-gray-800 transition-colors duration-500">{item.tech}</span>
                      
                      {/* Seta 3D sutil */}
                      <div className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-500">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Borda 3D no hover */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-white/20 transition-all duration-700"></div>
                </div>
              ))}
            </div>

            {/* (Detalhes reposicionados e bloco de features substituído pelos cartões de confiança) */}

            {/* Guia de tamanhos (modal) */}
            {sizeGuideOpen && (
              <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-black/10">
                  <h3 className="text-lg font-semibold mb-2">Guia de tamanhos</h3>
                  <p className="text-sm text-black/70 mb-4">Consulte as medidas em cm. Se estiver entre dois tamanhos, escolha o maior para um ajuste confortável.</p>
                  <table className="w-full text-sm mb-4">
                    <thead><tr className="text-left text-black/70"><th>Tamanho</th><th>Peito</th><th>Cintura</th><th>Quadril</th></tr></thead>
                    <tbody>
                      {['XS','S','M','L','XL'].map((t) => (
                        <tr key={t}><td className="py-1">{t}</td><td>80–86</td><td>60–66</td><td>86–92</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right"><button className="btn-secondary-dark" onClick={() => setSizeGuideOpen(false)}>Fechar</button></div>
                </div>
              </div>
            )}


          </div>
        </div>

        {/* Experiências das clientes (profissional) */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] font-semibold text-luxe">Experiências das clientes</h2>
            <div className="flex items-center gap-2 text-sm text-white">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.175 0L6.266 16.28c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.63 8.72c-.783-.57-.38-1.81.588-1.81H6.68a1 1 0 00.95-.69l1.418-4.292z"/></svg>
              <span className="font-semibold text-white">{getProductRating(productSlug)}</span>
              <span className="text-white/70">({getProductReviews(productSlug)} avaliações)</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {buildTestimonials(product).map((t, idx) => (
              <div key={idx} className="p-5 border border-black/[0.06] rounded-2xl bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg'; }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] font-medium text-[#111827]">{t.name}</div>
                      {t.verified && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Compra verificada</span>
                      )}
                    </div>
                    <div className="text-[12px] text-black/60">{t.location}</div>
                  </div>
                </div>
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < Math.floor(t.rating) ? 'text-white' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.175 0L6.266 16.28c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.63 8.72c-.783-.57-.38-1.81.588-1.81H6.68a1 1 0 00.95-.69l1.418-4.292z"/></svg>
              ))}
            </div>
                <p className="text-[14px] text-[#374151] leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Vídeo removido para restaurar estado anterior */}
      </div>
      {/* Barra fixa de ação (mobile) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden backdrop-blur bg-white/95 border-t border-black/10 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="mobile-price-display text-[18px] font-bold text-slate-800">{formatEUR(selectedVariantPrice || product?.price || 0)}</div>
          <button onClick={handleBuyNow} className="flex-1 btn-buy-now py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">Comprar agora</button>
        </div>
      </div>


    </div>
  );
}


