// 🚀 Otimizações EXTREMAS para Performance
// Este arquivo contém otimizações para resolver LCP e TTI críticos

// Preload EXTREMO de recursos críticos para LCP
export const preloadCriticalResourcesExtreme = () => {
  if (typeof window !== 'undefined') {
    // Preload da imagem hero (LCP crítico)
    const heroImageLink = document.createElement('link');
    heroImageLink.rel = 'preload';
    heroImageLink.href = '/colecao-outono/optimized/hero-1.jpg';
    heroImageLink.as = 'image';
    heroImageLink.fetchPriority = 'high';
    heroImageLink.imageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    document.head.appendChild(heroImageLink);

    // Preload da segunda imagem hero
    const hero2ImageLink = document.createElement('link');
    hero2ImageLink.rel = 'preload';
    hero2ImageLink.href = '/colecao-outono/optimized/hero-2.jpg';
    hero2ImageLink.as = 'image';
    hero2ImageLink.fetchPriority = 'high';
    document.head.appendChild(hero2ImageLink);

    // Preload de fontes críticas
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // DNS prefetch para recursos externos
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = '//fonts.googleapis.com';
    document.head.appendChild(dnsPrefetch);

    // Preconnect para recursos críticos
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = '//fonts.googleapis.com';
    document.head.appendChild(preconnect);
  }
};

// Otimização EXTREMA de JavaScript para reduzir TTI
export const optimizeJavaScriptExecutionExtreme = () => {
  if (typeof window !== 'undefined') {
    // Intersection Observer ULTRA otimizado
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Carregar componentes 3D apenas quando visíveis
            const component = entry.target as HTMLElement;
            if (component.dataset.component) {
              // Lazy load ULTRA otimizado
              import(`../components/${component.dataset.component}`).then((module) => {
                // Componente carregado
              }).catch(() => {
                // Ignorar erros
              });
            }
          }
        });
      },
      { 
        threshold: 0.01, // ABSOLUTO MÍNIMO
        rootMargin: '5px' // ABSOLUTO MÍNIMO
      }
    );

    // Observar seções 3D com delay
    setTimeout(() => {
      document.querySelectorAll('[data-component]').forEach((el) => {
        observer.observe(el);
      });
    }, 1000); // Delay para não bloquear LCP
  }
};

// Otimização EXTREMA de renderização para LCP
export const optimizeRenderingExtreme = () => {
  if (typeof window !== 'undefined') {
    // Usar requestIdleCallback para tarefas não críticas
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Carregar componentes 3D em background com delay
        setTimeout(() => {
                  const components = ['Casacos3D', 'Conjuntos3D', 'Acessorios3D', 'Calçados3D'];
        components.forEach((component) => {
          import(`../components/${component}`).catch(() => {
            // Ignorar erros
          });
        });
        }, 2000); // Delay de 2s para não interferir no LCP
      }, { timeout: 10000 });
    }
  }
};

// Otimização EXTREMA de cache para melhor performance
export const optimizeCacheExtreme = () => {
  if (typeof window !== 'undefined') {
    // Cache de componentes já carregados
    const componentCache = new Map();
    
    // Função para carregar componente com cache ULTRA otimizado
    const loadComponentExtreme = async (componentName: string) => {
      if (componentCache.has(componentName)) {
        return componentCache.get(componentName);
      }
      
      try {
        const module = await import(`../components/${componentName}`);
        componentCache.set(componentName, module);
        return module;
      } catch (error) {
        console.warn(`Failed to load component: ${componentName}`);
        return null;
      }
    };

    // Expor função globalmente
    (window as any).loadComponentExtreme = loadComponentExtreme;
  }
};

// Otimização EXTREMA de imagens para LCP
export const optimizeImagesExtreme = () => {
  if (typeof window !== 'undefined') {
    // Intersection Observer para imagens não críticas
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      },
      { 
        threshold: 0.01, // ABSOLUTO MÍNIMO
        rootMargin: '5px' // ABSOLUTO MÍNIMO
      }
    );

    // Observar imagens com data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Inicialização das otimizações EXTREMAS
export const initExtremeOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Preload de recursos críticos
    preloadCriticalResourcesExtreme();
    
    // Otimização de JavaScript
    optimizeJavaScriptExecutionExtreme();
    
    // Otimização de renderização
    optimizeRenderingExtreme();
    
    // Otimização de cache
    optimizeCacheExtreme();
    
    // Otimização de imagens
    optimizeImagesExtreme();
    
    // Monitor de performance EXTREMO
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP EXTREMO:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming;
            console.log('FID EXTREMO:', firstInputEntry.processingStart - firstInputEntry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }
};
