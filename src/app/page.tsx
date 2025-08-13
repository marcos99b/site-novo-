'use client';

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { formatEUR } from "@/lib/currency";
import { useEffect, useMemo, useState } from "react";
import { trackUserEvent } from '@/lib/supabase';

interface FeaturedProduct {
  id: string | number;
  name: string;
  description: string;
  price: number;
  compare_at_price: number;
  images: { src: string; alt?: string }[];
  category?: string;
}

const heroImages = [
  "/colecao-outono/_prompt_para_krea_ai_descrio_principal-_elegant_european_woman_model_wearing_modern_minimalist_wome_55bgeu2szrwlg1r04wyz_1.png",
  "/colecao-outono/_prompt_para_krea_ai_descrio_principal-_elegant_european_woman_model_wearing_modern_minimalist_wome_r3jefi8x5rb9tz9xasf6_2.png",
  "/colecao-outono/_prompt_para_krea_ai_descrio_principal-_elegant_european_woman_model_wearing_modern_minimalist_wome_rg9aw0gyq6ng5ij6w9p2_3.png",
];

export default function Home() {
  const [featured, setFeatured] = useState<FeaturedProduct[]>([]);
  const [current, setCurrent] = useState(0);

  const currentImage = useMemo(() => heroImages[current % heroImages.length], [current]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/products?featured=true', { cache: 'no-store' });
        const data = await res.json();
        setFeatured(data.products || []);
      } catch {
        setFeatured([]);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => c + 1), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // Marca visita à home como page_view já é feito no TrackingProvider; aqui marcamos visita ao catálogo CTA
    const btn = document.getElementById('cta-catalogo');
    if (!btn) return;
    const onClick = () => trackUserEvent('navigation', { to: '/catalogo', label: 'Ver Catálogo' }, window.location.pathname).catch(()=>{});
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="relative">
      {/* Hero Section elegante como Vellum */}
      <section className="relative min-h-[80vh] flex items-center hero-spot">
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Texto elegante */}
          <div className="py-12 sm:py-16 space-y-6 sm:space-y-8 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] text-luxe text-balance">
                Moda Feminina
                <br />
                <span className="font-normal highlight-aurum glow-aurum">elegante e atemporal</span>
              </h1>
              <p className="text-base sm:text-lg text-luxe-soft max-w-[44ch] leading-relaxed">
                Vestidos e conjuntos selecionados com cuidado, conforto e design. 
                Envio rápido para Portugal com identidade visual única.
              </p>
            </div>
            
            {/* CTAs elegantes */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link id="cta-catalogo" href="/catalogo" className="btn-primary">Ver Catálogo</Link>
              <Link href="/produto/1" className="btn-secondary">Produto Destaque</Link>
            </div>
          </div>

          {/* Imagem elegante */}
          <div className="relative animate-scale-in">
            <div className="model-3d relative w-full max-w-[500px] h-[600px] rounded-2xl overflow-hidden">
              <img 
                src={currentImage || '/placeholder.jpg'} 
                alt="Modelo feminina" 
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }}
              />
              
              {/* Overlay sutil */}
              <div className="absolute bottom-6 left-6 right-6 hero-badge-3d rounded-xl p-4">
                <div className="text-center">
                  <div className="text-sm text-hero-3d tracking-wide">Coleção Atual</div>
                  <div className="text-lg font-semibold text-hero-3d-strong">Outono 2025</div>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* Produtos em Destaque elegantes - Layout melhorado */}
      <section className="relative py-24 section-3d-aurum spot-under">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-4xl lg:text-5xl font-light heading-aurum-3d underline-aurum mb-6">
              Curadoria Essencial
            </h2>
            <p className="text-xl text-luxe-subtitle max-w-3xl mx-auto leading-relaxed">
              Peças autorais, estrutura impecável e caimento preciso. Selecionamos modelos com
              construção premium e acabamento atemporal para elevar o seu guarda‑roupa.
            </p>
          </div>

          {/* Grid de produtos elegante e espaçado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {featured.slice(0, 6).map((p, idx) => (
              <div key={p.id} className="group animate-slide-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                <div className="card-elegant p-8 hover:scale-[1.02] transition-all duração-500">
                  <div className="w-full h-96 bg-[#faf9f6] rounded-2xl mb-8 overflow-hidden">
                    <ProductImage src={p.images?.[0]?.src || `/cj/${p.id}/img-1.jpg`} alt={p.images?.[0]?.alt || p.name} />
                  </div>
                  <div className="mb-4"><span className="badge-elegant text-xs px-4 py-2">{p.category || 'Moda Feminina'}</span></div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-medium text-[#1a1a1a] truncate-2-no-ellipsis leading-tight group-hover:text-[#1a1a1a]/80 transition-colors">{p.name}</h3>
                    <div className="flex items-center justify-between pt-4">
                      <span className="text-2xl font-semibold text-[#1a1a1a]">{formatEUR(p.price)}</span>
                      {p.compare_at_price > p.price && (
                        <span className="text-lg text-[#1a1a1a]/50 line-through">{formatEUR(p.compare_at_price)}</span>
                      )}
                    </div>
                    <div className="pt-6">
                      <Link href={`/produto/${p.id}`} className="btn-primary w-full text-center py-4">Ver Produto</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA principal com design melhorado */}
          <div className="text-center mt-20 animate-slide-up">
            <Link href="/catalogo" className="btn-primary px-16 py-5 text-lg font-medium hover:scale-105 transition-transform duration-300">
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de benefícios como Vellum - Layout melhorado */}
      <section className="py-24 section-3d-aurum section-aurum-glow">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-light heading-aurum-3d underline-aurum mb-6">
              A experiência Reliet
            </h2>
            <p className="text-lg text-luxe-subtitle max-w-2xl mx-auto">
              Moda com engenharia de caimento, entrega precisa e suporte humano — do primeiro clique ao pós‑compra.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-16">
            <div className="text-center animate-slide-up">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium heading-aurum-3d mb-4">Logística de Precisão</h3>
              <p className="text-luxe-soft leading-relaxed">Envios rastreados para Portugal com SLA otimizado e comunicação em tempo real até a entrega.</p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium heading-aurum-3d mb-4">Ajuste & Confiança</h3>
              <p className="text-luxe-soft leading-relaxed">Prova em casa com política de troca sem fricção e curadoria para orientação de medida ideal.</p>
            </div>
            
            <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L9.172 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium heading-aurum-3d mb-4">Atendimento Autoral</h3>
              <p className="text-luxe-soft leading-relaxed">Styling assistido e pós‑compra dedicado. Suporte humano quando precisar, do seu jeito.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


