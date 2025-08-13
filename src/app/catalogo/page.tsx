'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { trackUserEvent } from '@/lib/supabase';
import ProductImage from '@/components/ProductImage';
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
};

const categories = ['Todos', 'Vestidos', 'Conjuntos', 'Outono / Inverno', 'Festa'];

export default function CatalogoPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        setProducts((data.products || []) as CatalogProduct[]);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'Todos') return true;
    const text = (p.name + ' ' + (p.category || '') + ' ' + p.description).toLowerCase();
    return (
      (selectedCategory === 'Vestidos' && /dress|vestido/i.test(text)) ||
      (selectedCategory === 'Conjuntos' && /set|conjunto/i.test(text)) ||
      (selectedCategory === 'Outono / Inverno' && /winter|inverno|autumn|outono/i.test(text)) ||
      (selectedCategory === 'Festa' && /party|festa|evening/i.test(text))
    );
  });

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
      <div className="relative min-h-[50vh] flex items-center pt-12 sm:pt-0 hero-spot">
        <div className="absolute inset-0" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 w-full">
          <div className="text-center space-y-6 animate-fade-in">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 spot-under">
        {/* Filtros elegantes com design melhorado */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 sm:mb-16 animate-slide-up toolbar-catalog">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`chip-tech ${selectedCategory === category ? 'is-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid elegante com espaçamentos melhores */}
        {loading ? (
          <div className="text-center py-20 animate-slide-up">
            <div className="inline-flex items-center gap-4 text-gray-300">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-lg">A carregar produtos...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-12">
            {filteredProducts.map((p, idx) => (
              <div key={p.id} className="group animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <Link href={`/produto/${p.id}`} className="block pointer-events-auto">
                <div className={`product-tile p-5 sm:p-7 lg:p-8 transition-all duration-300`}>
                  <div className="relative w-full h-72 sm:h-80 lg:h-96 product-media">
                    <ProductImage src={p.images?.[0]?.src || `/cj/${p.id}/img-1.jpg`} alt={p.images?.[0]?.alt || p.name} />
                    <div className="absolute top-4 left-4">
                      <span className="badge-elegant text-xs px-4 py-2">{p.category || 'Moda Feminina'}</span>
                    </div>
                  </div>
                  <div className="product-panel mt-5 space-y-4">
                     <h3 className="font-royal text-xl sm:text-2xl font-semibold product-title truncate-2-no-ellipsis leading-tight">{p.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-semibold product-price">{formatEUR(p.price)}</span>
                      {p.compare_at_price > p.price && (
                        <span className="text-base sm:text-lg product-compare line-through">{formatEUR(p.compare_at_price)}</span>
                      )}
                    </div>
                    <div className="flex gap-3 sm:gap-4 pt-2">
                      <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(p); }} className="flex-1 cta-primary pointer-events-auto">Adicionar</button>
                      <button type="button" className="flex-1 cta-secondary--dark text-center">Detalhes</button>
                    </div>
                  </div>
                </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio elegante */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-24 animate-slide-up">
            <div className="w-32 h-32 bg-[#faf9f6] rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-[#1a1a1a]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-3xl font-medium text-[#1a1a1a] mb-6">Nenhum produto encontrado</h3>
            <p className="text-lg text-[#1a1a1a]/70 mb-10 max-w-md mx-auto leading-relaxed">
              Não encontramos produtos na categoria selecionada. 
              Tente escolher outra categoria ou ver todos os produtos.
            </p>
            <button
              onClick={() => setSelectedCategory("Todos")}
              className="btn-primary px-12 py-4 text-lg font-medium"
            >
              Ver Todos os Produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


