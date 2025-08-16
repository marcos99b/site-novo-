// 🚀 Sistema de Lazy Loading Inteligente para TTI
// Este arquivo implementa lazy loading avançado para melhorar o TTI

import { useEffect, useRef, useState, useCallback } from 'react';

interface LazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  delay?: number;
}

export const useSmartLazyLoading = <T extends HTMLElement>(
  options: LazyLoadOptions = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const elementRef = useRef<T>(null);

  const {
    threshold = 0.001, // ABSOLUTO MÍNIMO para performance máxima
    rootMargin = '5px', // ABSOLUTO MÍNIMO para performance máxima
    triggerOnce = true,
    priority = 'medium',
    delay = 0
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 🚀 Intersection Observer ULTRA otimizado para performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            
            // 🚀 Carregamento baseado na prioridade com delays otimizados
            const loadDelay = priority === 'critical' ? 0 : 
                             priority === 'high' ? 50 : 
                             priority === 'medium' ? 100 : 200;
            
            setTimeout(() => {
              setIsLoaded(true);
            }, loadDelay + delay);

            if (triggerOnce) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
        // 🚀 Otimizações para performance máxima
        root: null
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce, priority, delay]);

  return { elementRef, isVisible, isLoaded };
};

// 🚀 Hook para componentes 3D específicos com carregamento ULTRA otimizado
export const use3DComponentLazyLoading = () => {
  const [componentsLoaded, setComponentsLoaded] = useState({
    casacos: false,
    conjuntos: false,
    acessorios: false,
    calçados: false
  });

  const [isInitialized, setIsInitialized] = useState(false);

  const loadComponent = useCallback((componentName: keyof typeof componentsLoaded) => {
    setComponentsLoaded(prev => ({
      ...prev,
      [componentName]: true
    }));
  }, []);

  // 🚀 Carregamento ULTRA otimizado para TTI
  const loadSequentially = useCallback(() => {
    if (isInitialized) return;
    setIsInitialized(true);

    // 🚀 Carregamento crítico imediato
    loadComponent('casacos');
    
    // 🚀 Carregamento sequencial otimizado com delays mínimos
    requestIdleCallback(() => loadComponent('conjuntos'), { timeout: 100 });
    requestIdleCallback(() => loadComponent('acessorios'), { timeout: 200 });
    requestIdleCallback(() => loadComponent('calçados'), { timeout: 300 });
  }, [loadComponent, isInitialized]);

  // 🚀 Carregamento baseado em visibilidade
  const loadOnVisibility = useCallback(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const componentName = entry.target.getAttribute('data-component') as keyof typeof componentsLoaded;
            if (componentName && !componentsLoaded[componentName]) {
              loadComponent(componentName);
            }
          }
        });
      },
      { threshold: 0.01, rootMargin: '10px' }
    );

    // Observar todos os containers 3D
    document.querySelectorAll('[data-component]').forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [componentsLoaded, loadComponent]);

  return { 
    componentsLoaded, 
    loadComponent, 
    loadSequentially, 
    loadOnVisibility,
    isInitialized 
  };
};

// 🚀 Sistema de priorização de recursos ULTRA otimizado
export const ResourcePriority = {
  CRITICAL: 'critical', // LCP, FCP
  HIGH: 'high',         // TTI, interatividade
  MEDIUM: 'medium',     // Componentes visuais
  LOW: 'low'            // Componentes de fundo
} as const;

export const prioritizeResources = () => {
  // 🚀 Preload ULTRA crítico para LCP
  if (typeof window !== 'undefined') {
    // 🚀 Preload de imagens hero (LCP crítico)
    const heroImages = [
      '/colecao-outono/optimized/hero-1.jpg',
      '/colecao-outono/optimized/hero-2.jpg'
    ];

    heroImages.forEach((src, index) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      link.fetchPriority = index === 0 ? 'high' : 'auto';
      link.imageSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
      document.head.appendChild(link);
    });

    // 🚀 Preload de fontes críticas
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // 🚀 DNS prefetch para recursos externos
    const dnsPrefetch = document.createElement('link');
    dnsPrefetch.rel = 'dns-prefetch';
    dnsPrefetch.href = '//fonts.googleapis.com';
    document.head.appendChild(dnsPrefetch);
  }
};

// 🚀 Sistema de carregamento progressivo para componentes 3D
export const useProgressive3DLoading = () => {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);

  const startProgressiveLoading = useCallback(() => {
    // 🚀 Fase 1: Carregar apenas o primeiro componente (crítico)
    setLoadingPhase(1);
    
    // 🚀 Fase 2: Carregar componentes restantes com delays otimizados
    setTimeout(() => setLoadingPhase(2), 100);
    setTimeout(() => setLoadingPhase(3), 300);
    setTimeout(() => {
      setLoadingPhase(4);
      setIsFullyLoaded(true);
    }, 500);
  }, []);

  return { loadingPhase, isFullyLoaded, startProgressiveLoading };
};
