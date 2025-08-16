// 🚀 Otimizações Avançadas para Performance
// Este arquivo contém otimizações específicas para resolver LCP, TTI e JavaScript

// Preload de recursos críticos para LCP
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload da imagem hero (LCP)
    const heroImageLink = document.createElement('link');
    heroImageLink.rel = 'preload';
    heroImageLink.href = '/colecao-outono/optimized/hero-2.jpg';
    heroImageLink.as = 'image';
    heroImageLink.fetchPriority = 'high';
    document.head.appendChild(heroImageLink);

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
  }
};

// Otimização de JavaScript para reduzir TTI
export const optimizeJavaScriptExecution = () => {
  if (typeof window !== 'undefined') {
    // Reduzir prioridade de componentes não críticos
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Carregar componentes 3D apenas quando visíveis
          const component = entry.target as HTMLElement;
          if (component.dataset.component) {
            // Lazy load do componente
            import(`@/components/${component.dataset.component}`).then((module) => {
              // Componente carregado
            });
          }
        }
      });
    }, { 
      threshold: 0.1, 
      rootMargin: '100px' 
    });

    // Observar seções 3D
    document.querySelectorAll('[data-component]').forEach((el) => {
      observer.observe(el);
    });
  }
};

// Otimização de renderização para LCP
export const optimizeRendering = () => {
  if (typeof window !== 'undefined') {
    // Usar requestIdleCallback para tarefas não críticas
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Carregar componentes 3D em background
        const components = ['Casacos3D', 'Conjuntos3D', 'Acessorios3D', 'Calçados3D'];
        components.forEach((component) => {
          import(`@/components/${component}`).catch(() => {
            // Ignorar erros de carregamento
          });
        });
      }, { timeout: 5000 });
    }
  }
};

// Otimização de cache para melhor performance
export const optimizeCache = () => {
  if (typeof window !== 'undefined') {
    // Cache de componentes já carregados
    const componentCache = new Map();
    
    // Função para carregar componente com cache
    const loadComponent = async (componentName: string) => {
      if (componentCache.has(componentName)) {
        return componentCache.get(componentName);
      }
      
      try {
        const module = await import(`@/components/${componentName}`);
        componentCache.set(componentName, module);
        return module;
      } catch (error) {
        console.warn(`Failed to load component: ${componentName}`);
        return null;
      }
    };

    // Expor função globalmente
    (window as any).loadComponent = loadComponent;
  }
};

// Inicialização das otimizações avançadas
export const initAdvancedOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Preload de recursos críticos
    preloadCriticalResources();
    
    // Otimização de JavaScript
    optimizeJavaScriptExecution();
    
    // Otimização de renderização
    optimizeRendering();
    
    // Otimização de cache
    optimizeCache();
    
    // Monitor de performance
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            const firstInputEntry = entry as PerformanceEventTiming;
            console.log('FID:', firstInputEntry.processingStart - firstInputEntry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] });
    }
  }
};
