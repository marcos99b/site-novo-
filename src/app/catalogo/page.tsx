'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { trackUserEvent } from '@/lib/supabase';
import ProductImage from '@/components/ProductImage';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import toast from 'react-hot-toast';
import { formatEUR } from '@/lib/currency';

type CatalogProduct = {
  id: string;
  name: string;
  description: string;
  images: { src: string; alt?: string }[];
  price: number;
  compare_at_price: number;
  category?: string;
  slug: string; // Added slug to the type
};

function getDisplayName(product: CatalogProduct): string {
  const original = (product?.name || '').trim();
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

export default function CatalogoPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Tentar primeiro a API do Supabase
        let res = await fetch('/api/supabase/products', { cache: 'no-store' });
        if (!res.ok) {
          // Fallback para API antiga
          res = await fetch('/api/products', { cache: 'no-store' });
        }
        const data = await res.json();
        setProducts((data.products || []) as CatalogProduct[]);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        // Fallback final para API antiga
        try {
          const res = await fetch('/api/products', { cache: 'no-store' });
          const data = await res.json();
          setProducts((data.products || []) as CatalogProduct[]);
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
        }
      } finally { 
        setLoading(false); 
      }
    }
    load();
    setMounted(true);
  }, []);

  const filteredProducts = products;

  const handleAddToCart = (product: CatalogProduct) => {
    addToCart({ id: Number(product.id), name: product.name, price: product.price, images: [{ src: product.images?.[0]?.src || '/placeholder.jpg', alt: product.name }], slug: product.name.toLowerCase().replace(/\s+/g, '-') }, 1);
    try {
      trackUserEvent('add_to_cart', { product_id: product.id, qty: 1, price: product.price }, typeof window !== 'undefined' ? window.location.pathname : undefined);
    } catch {}
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  return (
    <div className="relative">
      {/* Hero elegante como Vellum */}
      <div className="relative min-h-[36vh] sm:min-h-[50vh] flex items-center pt-4 sm:pt-0 hero-spot">
        <div className="absolute inset-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="text-center space-y-3 sm:space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light heading-aurum-3d underline-aurum leading-tight sm:leading-tight text-balance">
              Catálogo Completo
            </h1>
            <p className="text-base sm:text-xl text-luxe-subtitle max-w-3xl mx-auto leading-relaxed text-balance">
              Seleção elegante de vestidos e conjuntos com envio para Portugal. 
              Cada peça foi escolhida para criar uma identidade visual única e sofisticada.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-12 pb-10 sm:pb-16">
        {/* Grid elegante com espaçamentos melhores */}
        {loading ? (
          <div className="text-center py-20 animate-slide-up">
            <div className="inline-flex items-center gap-4 text-gray-300">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-lg">A carregar produtos...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Renderizar produtos se existirem */}
            {filteredProducts.length > 0 && (
              <div suppressHydrationWarning className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {filteredProducts.map((p, idx) => {
                  const thumbs = (p.images || []).slice(0, 4);
                  const isNew = idx < 4;
                  const isBest = p.compare_at_price > p.price;
                  return (
                    <div key={p.id} className="group animate-slide-up" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <div className="bg-white rounded-2xl overflow-hidden">
                        <Link href={`/produto/${p.slug}`} className="block">
                          <div
                            className="relative aspect-[4/5] overflow-hidden [perspective:1000px]"
                            onMouseMove={(e) => {
                              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                              const x = (e.clientX - rect.left) / rect.width;
                              const y = (e.clientY - rect.top) / rect.height;
                              const ry = (x - 0.5) * 12; // rotateY
                              const rx = (0.5 - y) * 12; // rotateX
                              const inner = (e.currentTarget as HTMLDivElement).querySelector('[data-tilt]') as HTMLDivElement | null;
                              if (inner) inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
                            }}
                            onMouseLeave={(e) => {
                              const inner = (e.currentTarget as HTMLDivElement).querySelector('[data-tilt]') as HTMLDivElement | null;
                              if (inner) inner.style.transform = '';
                            }}
                          >
                            <div data-tilt className="h-full w-full transform-gpu transition-transform duration-200 ease-out will-change-transform">
                              <div className="absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-0">
                                <ProductImage rounded={false} src={p.images?.[0]?.src || `/cj/${p.id}/img-1.jpg`} alt={p.images?.[0]?.alt || p.name} />
                              </div>
                              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
                                <ProductImage rounded={false} src={(p.images && p.images[1]?.src) || (thumbs[1]?.src as any) || `/cj/${p.id}/img-2.jpg`} alt={p.images?.[1]?.alt || p.name} />
                              </div>
                            </div>
                            <div className="absolute top-2 left-2 flex gap-2">
                              {isNew && (
                                <span className={`text-white text-[11px] px-2 py-1 rounded font-medium ${
                                  idx % 4 === 0 ? 'bg-emerald-600' : 
                                  idx % 4 === 1 ? 'bg-blue-600' : 
                                  idx % 4 === 2 ? 'bg-purple-600' : 'bg-amber-600'
                                }`}>
                                  {idx % 4 === 0 ? '✨ New' : 
                                   idx % 4 === 1 ? '🔥 Trend' : 
                                   idx % 4 === 2 ? '⭐ Premium' : '🌟 Latest'}
                                </span>
                              )}
                              {isBest && (
                                <span className={`text-white text-[11px] px-2 py-1 rounded font-medium ${
                                  idx % 4 === 0 ? 'bg-red-600' : 
                                  idx % 4 === 1 ? 'bg-orange-600' : 
                                  idx % 4 === 2 ? 'bg-pink-600' : 'bg-rose-600'
                                }`}>
                                  {idx % 4 === 0 ? '🏆 Bestseller' : 
                                   idx % 4 === 1 ? '💎 Popular' : 
                                   idx % 4 === 2 ? '🎯 Top Pick' : '💫 Favorito'}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                        <div className="pt-4 pb-6 sm:pb-8">
                          <h3 className="text-[13px] uppercase tracking-wide text-[#111827] mb-2 line-clamp-2 text-center px-3">{getDisplayName(p)}</h3>
                          <div className="flex items-center gap-3 mb-3 justify-center">
                            <span className="text-[18px] font-semibold text-[#111827]">{formatEUR(p.price)}</span>
                            {p.compare_at_price > p.price && (
                              <span className="text-[14px] text-black/60 line-through">{formatEUR(p.compare_at_price)}</span>
                            )}
                          </div>
                          {thumbs.length > 1 && (
                            <div className="flex items-center gap-2 justify-center">
                              {thumbs.slice(0, 3).map((img, i) => (
                                <div key={i} className="w-10 h-10 rounded overflow-hidden border border-black/10">
                                  <ProductImage src={img.src} alt={img.alt || p.name} />
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-6 pt-4 px-4 border-t border-black/10 grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <Link href={`/produto/${p.slug}`} className="btn-secondary-dark w-full text-center py-2 bg-[#f2f3f5] hover:bg-[#edeff2] border border-black/10">Detalhes</Link>
                            <button onClick={() => handleAddToCart(p)} className="btn-primary w-full py-2">Adicionar</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Estado vazio se não houver produtos */}
            {!loading && filteredProducts.length === 0 && (
              <div className="text-center py-24 animate-slide-up">
                <div className="w-32 h-32 bg-[#faf9f6] rounded-full flex items-center justify-center mx-auto mb-8">
                  <svg className="w-16 h-16 text-[#1a1a1a]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-3xl font-medium text-[#1f1f1f] mb-6">Nenhum produto encontrado</h3>
                <p className="text-lg text-[#1a1a1a]/70 mb-10 max-w-md mx-auto leading-relaxed">
                  Não encontramos produtos no momento. 
                  Volte mais tarde para ver nossa nova coleção.
                </p>
                <Link
                  href="/"
                  className="btn-primary px-12 py-4 text-lg font-medium"
                >
                  Voltar à Página Inicial
                </Link>
              </div>
            )}
          </>
        )}

        {/* Formulário de Captura de Leads */}
        <LeadCaptureForm
          title="🎉 Ganhe Desconto Exclusivo!"
          subtitle="Inscreva-se para receber ofertas especiais"
          description="Seja o primeiro a saber sobre nossas novas coleções e receba descontos exclusivos diretamente no seu email."
          placeholder="Seu melhor email"
          buttonText="Quero o Desconto!"
          discount="15%"
        />
      </div>
    </div>
  );
}


