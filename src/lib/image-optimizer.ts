// 🚀 Sistema de Otimização ULTRA para Imagens (LCP)
// Este arquivo implementa otimizações extremas para LCP

// 🚀 Preload ULTRA crítico para LCP
export const preloadCriticalImages = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Preload ULTRA das imagens hero
  const criticalImages = [
    {
      src: '/colecao-outono/optimized/hero-1.jpg',
      priority: 'high',
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    },
    {
      src: '/colecao-outono/optimized/hero-2.jpg',
      priority: 'auto',
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    }
  ];

  // 🚀 Aplicar preload ULTRA
  criticalImages.forEach((image, index) => {
    // 🚀 Preload principal
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = image.src;
    preloadLink.as = 'image';
    preloadLink.fetchPriority = image.priority as 'high' | 'auto';
    preloadLink.imageSizes = image.sizes;
    document.head.appendChild(preloadLink);

    // 🚀 DNS prefetch para domínio das imagens
    if (index === 0) {
      const dnsPrefetch = document.createElement('link');
      dnsPrefetch.rel = 'dns-prefetch';
      dnsPrefetch.href = '//localhost:3000';
      document.head.appendChild(dnsPrefetch);
    }
  });

  // 🚀 Preload de fontes críticas
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
};

// 🚀 Otimização ULTRA de carregamento de imagens
export const optimizeImageLoading = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Intersection Observer ULTRA para imagens
  const imageObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          
          // 🚀 Carregar imagem quando visível
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('image-loaded');
            imageObserver.unobserve(img);
          }
        }
      });
    },
    { 
      threshold: 0.001, // ABSOLUTO MÍNIMO
      rootMargin: '5px' // ABSOLUTO MÍNIMO
    }
  );

  // 🚀 Observar todas as imagens com lazy loading
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  return imageObserver;
};

// 🚀 Sistema de carregamento progressivo de imagens
export const progressiveImageLoading = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Fase 1: Carregar apenas imagem hero (crítica)
  const heroImage = document.querySelector('[data-hero="true"]') as HTMLImageElement;
  if (heroImage) {
    heroImage.src = heroImage.dataset.src || heroImage.src;
    heroImage.classList.add('hero-loaded');
  }

  // 🚀 Fase 2: Carregar outras imagens com delay otimizado
  setTimeout(() => {
    const otherImages = document.querySelectorAll('img:not([data-hero="true"])');
    otherImages.forEach((img, index) => {
      setTimeout(() => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.dataset.src) {
          imgElement.src = imgElement.dataset.src;
          imgElement.classList.add('image-loaded');
        }
      }, index * 50); // Delay mínimo entre imagens
    });
  }, 100);
};

// 🚀 Otimização ULTRA de compressão de imagens
export const optimizeImageCompression = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Verificar se o navegador suporta WebP
  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // 🚀 Converter imagens para WebP se suportado
  if (supportsWebP()) {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      const src = img.src;
      if (src.includes('.jpg') || src.includes('.png')) {
        // 🚀 Substituir por versão WebP se disponível
        const webpSrc = src.replace(/\.(jpg|png)/, '.webp');
        img.src = webpSrc;
      }
    });
  }
};

// 🚀 Sistema principal de otimização de imagens
export const initImageOptimizations = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Aplicar todas as otimizações
  preloadCriticalImages();
  const imageObserver = optimizeImageLoading();
  progressiveImageLoading();
  optimizeImageCompression();

  // 🚀 Retornar função de cleanup
  return () => {
    imageObserver?.disconnect();
  };
};

// 🚀 Otimização específica para LCP
export const optimizeLCP = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Forçar carregamento da imagem hero
  const heroImage = document.querySelector('[data-hero="true"]') as HTMLImageElement;
  if (heroImage) {
    // 🚀 Carregar imediatamente
    heroImage.src = heroImage.dataset.src || heroImage.src;
    heroImage.loading = 'eager';
    heroImage.decoding = 'sync';
    heroImage.fetchPriority = 'high';
    
    // 🚀 Adicionar classe para estilos otimizados
    heroImage.classList.add('lcp-optimized');
  }

  // 🚀 Preload de recursos críticos
  const criticalResources = [
    '/_next/static/chunks/main-app.js',
    '/_next/static/chunks/app/layout.js'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = 'script';
    document.head.appendChild(link);
  });
};
