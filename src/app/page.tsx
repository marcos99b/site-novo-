'use client';

import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { formatEUR } from "@/lib/currency";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import dynamic from 'next/dynamic';
import { useSmartLazyLoading, use3DComponentLazyLoading, prioritizeResources, useProgressive3DLoading } from "@/lib/smart-lazy-loading";
import { initJavaScriptOptimizations, optimizeTTI, optimizeJavaScriptExecution } from "@/lib/javascript-optimizer";
import { initImageOptimizations, optimizeLCP } from "@/lib/image-optimizer";
import { initCSSOptimizations, optimizeFCP, optimizeTBT } from "@/lib/css-optimizer";
// import { initPerformanceOptimizations } from "@/lib/performance";
// import { initBundleOptimizations } from "@/lib/bundle-optimizer";
// import { PERFORMANCE_CONFIG, IMAGE_OPTIMIZATION } from "@/lib/performance-config";

// import { initAdvancedOptimizations } from "@/lib/advanced-optimizations";

// Lazy load ULTRA otimizado dos componentes 3D (TTI crítico)
const Calçados3D = dynamic(() => import('@/components/Calçados3D'), {
  loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl" />,
  ssr: false,
  suspense: false
});

// Lazy load ULTRA otimizado dos componentes 3D (TTI crítico)
const Acessorios3D = dynamic(() => import('@/components/Acessorios3D'), {
  loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl" />,
  ssr: false,
  suspense: false
});

// Lazy load ULTRA otimizado dos componentes 3D (TTI crítico)
const Conjuntos3D = dynamic(() => import('@/components/Conjuntos3D'), {
  loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl" />,
  ssr: false,
  suspense: false
});

// Lazy load ULTRA otimizado dos componentes 3D (TTI crítico)
const Casacos3D = dynamic(() => import('@/components/Casacos3D'), {
  loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl" />,
  ssr: false,
  suspense: false
});

// Lazy load do banner promocional
const LazyPromotionalBanner = dynamic(() => import('@/components/PromotionalBanner'), {
  loading: () => <div className="h-32 bg-gradient-to-r from-slate-50 to-gray-100 animate-pulse rounded-lg" />,
  ssr: false
});

// Lazy load do ProductImage para melhor performance
const LazyProductImage = dynamic(() => import('@/components/ProductImage'), {
  loading: () => <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl" />,
  ssr: true
});

interface FeaturedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images?: { src: string; alt?: string }[];
  category?: string;
  slug: string; // Adicionar slug
}

// Otimizar imagens hero com lazy loading - versões comprimidas
const heroImages = [
  "/colecao-outono/optimized/hero-1.jpg",
  "/colecao-outono/optimized/hero-2.jpg",
  "/colecao-outono/optimized/hero-3.jpg",
];

export default function Home() {
  // 🚀 Sistema de lazy loading ULTRA otimizado para TTI
  const { componentsLoaded, loadSequentially, loadOnVisibility } = use3DComponentLazyLoading();
  const { loadingPhase, startProgressiveLoading } = useProgressive3DLoading();
  
  // 🚀 Inicializar otimizações de performance EXTREMAS
  useEffect(() => {
    // Priorizar recursos críticos para LCP
    prioritizeResources();
    
    // 🚀 Carregamento progressivo para TTI
    startProgressiveLoading();
    
    // 🚀 Carregamento baseado em visibilidade
    loadOnVisibility();
    
    // 🚀 Otimizações específicas para JavaScript e TTI
    const cleanupJavaScript = initJavaScriptOptimizations();
    optimizeTTI();
    optimizeJavaScriptExecution();
    
    // 🚀 Otimizações ULTRA para imagens e LCP
    const cleanupImages = initImageOptimizations();
    optimizeLCP();
    
    // 🚀 Otimizações ULTRA para CSS, FCP e TBT
    initCSSOptimizations();
    optimizeFCP();
    optimizeTBT();
    
    // initPerformanceOptimizations();
    // initBundleOptimizations();
    // initAdvancedOptimizations();
    // initExtremeOptimizations();
    
    // 🚀 Cleanup das otimizações
    return () => {
      cleanupJavaScript?.();
      cleanupImages?.();
    };
  }, [startProgressiveLoading, loadOnVisibility]);

  // Dados estáticos para garantir que funcione
  const featured = [
    {
      id: "produto-1",
      name: "Casaco de Lã Clássico",
      price: 89.9,
      compare_at_price: 120.0,
      slug: "produto-1",
      images: [{ src: "/produtos/produto-1/1.jpg", alt: "Casaco de Lã Clássico", sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }]
    },
    {
      id: "produto-2", 
      name: "Conjunto Algodão & Linho",
      price: 79.9,
      compare_at_price: 100.0,
      slug: "produto-2",
              images: [{ src: "/produtos/produto-2/2.jpg", alt: "Conjunto Algodão & Linho", sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }]
    },
    {
      id: "produto-5",
      name: "Colete Tricot Decote V", 
      price: 44.9,
      compare_at_price: 60.0,
      slug: "produto-5",
      images: [{ src: "/produtos/produto-5/1.jpg", alt: "Colete Tricot Decote V", sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }]
    },
    {
      id: "produto-6",
      name: "Colete com Fivela",
      price: 45.9,
      compare_at_price: 65.0,
      slug: "produto-6", 
      images: [{ src: "/produtos/produto-6/1.jpg", alt: "Colete com Fivela", sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }]
    }
  ];
  
  const loading = false;

  return (
    <div className="relative">
      {/* Hero Section elegante como Vellum */}
      <section className="relative min-h-[80vh] flex items-center hero-spot">
        <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Texto elegante */}
          <div className="py-12 sm:py-16 space-y-6 sm:py-8 animate-fade-in">
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
              <Link href="/produto/produto-1" className="btn-secondary">Produto Destaque</Link>
            </div>
          </div>

          {/* Imagem elegante com lazy loading */}
          <div className="relative animate-scale-in">
            <div className="model-3d relative w-full max-w-[500px] h-[600px] rounded-2xl overflow-hidden">
              <img
                data-hero="true"
                data-src="/colecao-outono/optimized/hero-1.jpg" 
                alt="Modelo feminina" 
                className="w-full h-full object-cover lcp-optimized"
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                  willChange: 'opacity',
                  contentVisibility: 'auto'
                }}
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

      {/* Produtos em Destaque elegantes - Layout interativo como catálogo */}
      <section className="relative py-24 section-3d-aurum spot-under">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light heading-aurum-3d underline-aurum mb-6">Curadoria Essencial</h2>
            <p className="text-xl text-luxe-subtitle max-w-3xl mx-auto leading-relaxed">Peças autorais, estrutura impecável e caimento preciso. Selecionamos modelos com construção premium e acabamento atemporal para elevar o seu guarda‑roupa.</p>
          </div>
          


          {/* 4 Categorias Elegantes - Formato Quadrado como Jervis Bay */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {/* CASACOS */}
            <Link href="/catalogo?category=casacos" className="block">
              <div 
                className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer"
                data-component="casacos"
              >
                {/* Componente 3D dos Casacos com carregamento progressivo ULTRA otimizado */}
                {loadingPhase >= 1 && componentsLoaded.casacos ? (
                  <Casacos3D className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="text-slate-500 text-sm">Carregando...</div>
                  </div>
                )}
                
                {/* Overlay com texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-800 pointer-events-none">
                  <h3 className="text-2xl font-light tracking-wide">CASACOS</h3>
                </div>
              </div>
            </Link>

            {/* CONJUNTOS */}
            <Link href="/catalogo?category=conjuntos" className="block">
              <div 
                className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer"
                data-component="conjuntos"
              >
                {/* Componente 3D dos Conjuntos com carregamento progressivo ULTRA otimizado */}
                {loadingPhase >= 2 && componentsLoaded.conjuntos ? (
                  <Conjuntos3D className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="text-slate-500 text-sm">Carregando...</div>
                  </div>
                )}
                
                {/* Overlay com texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-800 pointer-events-none">
                  <h3 className="text-2xl font-light tracking-wide">CONJUNTOS</h3>
                </div>
              </div>
            </Link>

            {/* ACESSÓRIOS */}
            <Link href="/catalogo?category=acessorios" className="block">
              <div 
                className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer"
                data-component="acessorios"
              >
                {/* Componente 3D dos Acessórios com carregamento progressivo ULTRA otimizado */}
                {loadingPhase >= 3 && componentsLoaded.acessorios ? (
                  <Acessorios3D className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="text-slate-500 text-sm">Carregando...</div>
                  </div>
                )}
                
                {/* Overlay com texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-800 pointer-events-none">
                  <h3 className="text-2xl font-light tracking-wide">ACESSÓRIOS</h3>
                </div>
              </div>
            </Link>

            {/* CALÇADOS */}
            <Link href="/catalogo?category=calçados" className="block">
              <div 
                className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer"
                data-component="calçados"
              >
                {/* Componente 3D dos Calçados com carregamento progressivo ULTRA otimizado */}
                {loadingPhase >= 4 && componentsLoaded.calçados ? (
                  <Calçados3D className="w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-gray-300 animate-pulse rounded-2xl flex items-center justify-center">
                    <div className="text-slate-500 text-sm">Carregando...</div>
                  </div>
                )}
                
                {/* Overlay com texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-800 pointer-events-none">
                  <h3 className="text-2xl font-light tracking-wide">CALÇADOS</h3>
                </div>
              </div>
            </Link>
          </div>









          {/* Seção "Sobre Nós" - REPLICANDO EXATAMENTE O FORMATO DO HERO */}
          <section className="relative py-24 section-3d-aurum spot-under">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Texto elegante - MESMO FORMATO DO HERO */}
                <div className="py-12 sm:py-16 space-y-6 sm:py-8 animate-fade-in">
                  <div className="space-y-6">
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] text-luxe text-balance">
                      Sobre Nós
                      <br />
                      <span className="font-normal highlight-aurum glow-aurum">tradição e inovação</span>
                    </h2>
                    <p className="text-base sm:text-lg text-luxe-soft max-w-[44ch] leading-relaxed">
                      Fundada com a missão de democratizar a elegância, a RELIET nasceu da paixão por moda atemporal e qualidade excepcional. 
                      Cada peça é selecionada com cuidado meticuloso para mulheres que valorizam sofisticação e conforto.
                    </p>
                  </div>
                  
                  {/* CTAs elegantes - MESMO FORMATO DO HERO */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Link href="/contato" className="btn-primary">Fale Conosco</Link>
                    <Link href="/catalogo" className="btn-secondary">Nossa História</Link>
                  </div>
                </div>

                {/* Imagem elegante com lazy loading - MESMO FORMATO DO HERO */}
                <div className="relative animate-scale-in">
                  <div className="model-3d relative w-full max-w-[500px] h-[600px] rounded-2xl overflow-hidden">
                                    <img
                  data-hero="true"
                  data-src="/colecao-outono/optimized/hero-2.jpg" 
                  alt="Nossa equipe e valores" 
                  className="w-full h-full object-cover lcp-optimized"
                  fetchPriority="auto"
                  loading="eager"
                  decoding="sync"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    willChange: 'opacity',
                    contentVisibility: 'auto'
                  }}
                />
                    
                    {/* Overlay sutil - MESMO FORMATO DO HERO */}
                    <div className="absolute bottom-6 left-6 right-6 hero-badge-3d rounded-xl p-4">
                      <div className="text-center">
                        <div className="text-sm text-hero-3d tracking-wide">Desde 2024</div>
                        <div className="text-lg font-semibold text-hero-3d-strong">Made in Portugal</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <div className="text-center mt-12 sm:mt-16">
            <Link href="/catalogo" className="btn-primary px-12 py-4 text-base font-medium hover:scale-105 transition-transform duration-300">
              Ver Todos os Produtos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


