'use client';

import { useParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect, useMemo } from 'react';
import { trackProductView, trackUserEvent } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import ProductImage from '@/components/ProductImage';
import toast from 'react-hot-toast';
import { formatEUR } from '@/lib/currency';

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
  const productId = params.id as string;

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          const productData = data.product;
          // Mapear imagens padronizadas por produto via manifest
          let imageOverrides: Record<string, string[]> = {};
          try {
            const res = await fetch('/produtos/manifest.json', { cache: 'no-store' });
            if (res.ok) {
              const json = await res.json();
              imageOverrides = Object.fromEntries(
                Object.entries(json).map(([k, arr]: any) => [String(k), arr])
              );
            }
          } catch {}
          const idStr = String(productData.id);
          let normalizedImages = (imageOverrides[idStr] || productData.images?.map((i: any) => i.src) || []).map((src: string) => ({ src }));
          if (!normalizedImages.length) {
            normalizedImages = [
              { src: `/cj/${idStr}/img-1.jpg` }
            ];
          }

            const transformName = (raw?: string) => {
              if (!raw) return raw as any;
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
              ];
              let name = raw;
              for (const [re, rep] of rules) name = name.replace(re, rep);
              name = name.replace(/\s{2,}/g, ' ').trim();
              if (/Colete/i.test(name) && /Tricot/i.test(name)) name = 'Colete em Tricot Elegante';
              if (/Top/i.test(name) && /Algodão|Linho/i.test(name)) name = 'Top em Algodão e Linho';
              if (/Suéter|Tricot/i.test(name) && /Decote em V/i.test(name)) name = 'Suéter em Tricot com Decote em V';
              return name;
            };

            const formattedProduct: Product = {
            id: productData.id,
            name: transformName(productData.name),
            description: productData.description,
            price: productData.price,
            originalPrice: productData.compare_at_price || productData.price * 1.2,
            image: (normalizedImages[0]?.src) || '/placeholder.jpg',
            category: productData.category || 'Moda Feminina',
            stock: productData.stock || 0,
            features: [
              'Envio rápido para Portugal',
              'Trocas e devoluções em 7 dias',
              'Qualidade verificada',
              'Pagamento seguro com Stripe'
            ],
            variants: productData.variants,
            images: normalizedImages.length > 0 ? normalizedImages : productData.images,
            video: (productData as any)?.video || null,
            colors: (productData as any)?.colors || [],
            sizes: (productData as any)?.sizes || [],
            variant_matrix: (productData as any)?.variant_matrix || []
            } as any;
          setProduct(formattedProduct);
          setActiveImageIndex(0);
          setActiveType('image');
        }
      } catch (error) {
        console.error('Erro ao buscar produto:', error);
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId]);

  // Registrar pageview do produto
  useEffect(() => {
    if (!productId) return;
    trackProductView(String(productId)).catch(() => {});
  }, [productId]);

  // Variante selecionada (tamanho)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0);
  useEffect(() => { setSelectedVariantIndex(0); }, [productId]);
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
      { id: product.id, name: product.name, price: selectedVariantPrice || product.price, images: [{ src: product.image, alt: product.name }], slug: product.name.toLowerCase().replace(/\s+/g, '-') },
      quantity
    );
    toast.success(`${product.name} adicionado ao carrinho!`);
    trackUserEvent('add_to_cart', { product_id: product.id, qty: quantity, price: selectedVariantPrice || product.price }, window.location.pathname).catch(() => {});
  };

  const handleBuyNow = async () => {
    try {
      trackUserEvent('checkout_started', { product_id: product?.id, qty: quantity, price: selectedVariantPrice || product?.price }, window.location.pathname).catch(() => {});
      const resp = await fetch('/api/stripe/create-checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: 'EUR',
          items: [{ name: product?.name || 'Produto', amount_cents: Math.round(((selectedVariantPrice || product?.price || 0)) * 100), quantity }],
          successPath: '/checkout/success', cancelPath: '/checkout/cancel',
          metadata: { product_id: product?.id, product_name: product?.name, category: product?.category }
        })
      });
      const data = await resp.json();
      if (data.ok && data.url) window.location.href = data.url;
      else toast.error('Erro ao criar checkout: ' + (data.error || 'Erro desconhecido'));
    } catch (error) {
      console.error('Erro ao criar checkout:', error);
      toast.error('Erro ao processar pagamento');
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Galeria à esquerda */}
          <div>
            <div className="relative rounded-3xl overflow-hidden bg-[#f4f1ef] border border-black/[0.06] aspect-[4/5]">
              {activeType === 'video' && product.video ? (
                <video src={product.video} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : (
                <ProductImage src={(product.images?.[activeImageIndex]?.src) || product.image} alt={product.name} className="w-full h-full object-cover" priority />
              )}
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)' }} />
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-3">
              {product.video && (
                <button
                  onClick={() => { setActiveType('video'); setActiveImageIndex(0); }}
                  className={`rounded-xl overflow-hidden bg-[#f4f1ef] border aspect-square flex items-center justify-center ${activeType==='video' ? 'border-[#111827]' : 'border-black/[0.06]'} hover:opacity-90`}
                >
                  <span className="text-[#111827] text-xs">Vídeo</span>
                </button>
              )}
              {(product.images || []).slice(0, 12).map((img: any, index: number) => (
                <button
                  key={index}
                  onClick={() => { setActiveType('image'); setActiveImageIndex(index); }}
                  className={`rounded-xl overflow-hidden bg-[#f4f1ef] border aspect-square ${activeType==='image' && activeImageIndex===index ? 'border-[#111827]' : 'border-black/[0.06]'} hover:opacity-90`}
                >
                  <ProductImage src={img.src} alt={img.alt || product.name} />
                </button>
              ))}
            </div>
          </div>

          {/* Painel de informação à direita */}
          <div className="p-6 bg-white rounded-3xl border border-black/[0.06]">
            <div className="panel-3d mb-2">
              <h1 className="font-royal text-4xl sm:text-[40px] font-semibold tracking-[0.2px] text-balance panel-3d__inner text-gold-warm text-gold-contrast">{product.name}</h1>
            </div>
            {/* Subtítulo curto */}
            <p className="subtitle-royal text-[15px] text-[#2f3640] mb-2 text-balance">Blazer em tricot elegante, leve e confortável.</p>
            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-[#1f1f1f] mb-4" aria-label="Avaliação">
              <span>★ 4,8</span>
              <span className="text-black/50">·</span>
              <span className="text-black/70">128 avaliações</span>
            </div>

            {/* Benefícios curtos */}
            <ul className="text-[14px] text-[#2f3640] space-y-1 mb-4">
              <li>• Caimento que valoriza a silhueta</li>
              <li>• Tecido leve que não marca</li>
              <li>• Vai do dia ao jantar</li>
            </ul>

            {/* Detalhes e cuidados (2–3 linhas + bullets) */}
            <div className="mt-4 mb-6">
              <div className="card-elegant bg-white p-6">
                <h3 className="section-header-aurum text-[18px] font-semibold">Detalhes da peça</h3>
                <hr className="rule-aurum" />
                {(() => {
                  const copy = buildRefinedCopy(product.name);
                  const care = (copy[2] || '').split(':')[1]?.split(',').map(s => s.trim().replace(/\.$/, '')) || [];
                  return (
                    <div className="space-y-4">
                      <p className="subtitle-royal text-[15px] text-[#2f3640] leading-relaxed">Costuras limpas, linhas modernas e proporções equilibradas. Combine com saltos médios e casacos leves para um coordenado elegante.</p>
                      <ul className="list-aurum text-[14px] text-[#2f3640] space-y-1">
                        <li>Lavar do avesso em água fria</li>
                        <li>Secar à sombra</li>
                        <li>Passar a baixa temperatura</li>
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <span className="text-[26px] sm:text-[28px] font-semibold">{formatEUR(selectedVariantPrice || product.price)}</span>
              {product.originalPrice > product.price && (
                <>
                  <span className="text-[14px] text-black/50 line-through">{formatEUR(product.originalPrice)}</span>
                  <span className="text-[12px] px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">Poupa {savingsPercent}%</span>
                </>
              )}
            </div>

            {/* Cores */}
            {derivedColors.length > 0 && (
              <div className="mb-4">
                <div className="mb-1 text-[13px] text-black/80">Cor</div>
                <div className="flex flex-wrap gap-2">
                  {derivedColors.map((c) => (
                    <button key={c} onClick={() => setSelectedColor(c)} aria-pressed={selectedColor===c} className={`px-3 py-1 rounded-full border text-sm ${selectedColor===c ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white border-black/10 text-[#111827]'}`}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] text-black/80">Selecione o seu tamanho</div>
                  <button type="button" onClick={() => setSizeGuideOpen(true)} className="text-[12px] underline text-black/70 hover:text-black">Guia de tamanhos</button>
                </div>
                <div className="flex flex-wrap gap-2">
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
                          className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selected ? 'border-[#111827] bg-[#111827] text-white shadow-sm' : 'border-black/10 bg-white text-[#111827] hover:border-black/30'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >{size}</button>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            {/* Logística */}
            <div className="text-[13px] text-black/70 mb-4">Entrega para Portugal · prazo estimado 5–9 dias · Trocas 7 dias</div>

            <div className="mb-6">
              <div className="mb-2 text-[13px] text-black/70">Quantidade</div>
              <div className="inline-flex items-center gap-2 border border-black/[0.08] rounded-full px-2 py-1 bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/[0.05]">-</button>
                <span className="min-w-[2rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded-full grid place-items-center hover:bg-black/[0.05]">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <button onClick={handleBuyNow} className="btn-primary">Comprar agora</button>
              <button onClick={handleAddToCart} className="btn-secondary-dark">Adicionar ao carrinho</button>
            </div>

            {/* Bloco de confiança – 4 cartões */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-[14px]">
              {['Envio para Portugal','Trocas em 7 dias','Pagamento seguro (Stripe/PayPal)','Qualidade verificada'].map((label, i) => (
                <div key={i} className="rounded-xl border border-black/[0.08] bg-[#f4f1ef] px-3 py-2 text-[#1f1f1f]">{label}</div>
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

            <div className="mt-6 scarcity-3d">
              <div className="bar">
                <div className="fill" style={{ width: `${Math.min(95, Math.max(10, Math.round((product.stock/150)*100)))}%` }} />
                <div className="sheen" />
              </div>
              <div className="scarcity-legend">
                <span>Disponibilidade controlada</span>
                <span>{product.stock} unidades</span>
              </div>
            </div>
          </div>
        </div>

        {/* Experiências das clientes (profissional) */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[24px] font-semibold text-luxe">Experiências das clientes</h2>
            <div className="flex items-center gap-2 text-sm text-white">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.175 0L6.266 16.28c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.63 8.72c-.783-.57-.38-1.81.588-1.81H6.68a1 1 0 00.95-.69l1.418-4.292z"/></svg>
              <span className="font-semibold text-white">4,8</span>
              <span className="text-white/70">(128 avaliações)</span>
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
      <div className="fixed bottom-0 left-0 right-0 md:hidden backdrop-blur bg-white/85 border-t border-black/10 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-[16px] font-semibold">{formatEUR(selectedVariantPrice || product?.price || 0)}</div>
          <button onClick={handleBuyNow} className="flex-1 btn-primary py-3">Comprar agora</button>
        </div>
      </div>
    </div>
  );
}


