// 🚀 Otimizações de Performance
// Este arquivo contém funções e configurações para melhorar a performance do site

// Preload de recursos críticos
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload de fontes críticas
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Preload de imagens críticas
    const criticalImages = [
      '/colecao-outono/optimized/hero-1.jpg',
      '/colecao-outono/optimized/hero-2.jpg'
    ];

    criticalImages.forEach(src => {
      const imgLink = document.createElement('link');
      imgLink.rel = 'preload';
      imgLink.href = src;
      imgLink.as = 'image';
      document.head.appendChild(imgLink);
    });
  }
};

// Debounce para otimizar eventos
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle para otimizar eventos
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Intersection Observer para lazy loading
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }
  return null;
};

// Otimização de imagens
export const optimizeImageSrc = (src: string, width: number, quality: number = 80) => {
  // Se for uma imagem local, adicionar parâmetros de otimização
  if (src.startsWith('/') && !src.includes('?')) {
    return `${src}?w=${width}&q=${quality}&f=webp`;
  }
  return src;
};

// Cache de dados estáticos
export const staticCache = new Map<string, any>();

export const getCachedData = <T>(key: string, fetcher: () => T, ttl: number = 5 * 60 * 1000): T => {
  const cached = staticCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = fetcher();
  staticCache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Otimização de scroll
export const optimizeScroll = (callback: () => void) => {
  let ticking = false;
  
  const update = () => {
    callback();
    ticking = false;
  };
  
  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
  
  return requestTick;
};

// Prefetch de rotas
export const prefetchRoute = (href: string) => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }
};

// Otimização de performance geral
export const initPerformanceOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Preload de recursos críticos
    preloadCriticalResources();
    
    // Prefetch de rotas comuns
    ['/catalogo', '/produto/produto-1', '/produto/produto-2'].forEach(route => {
      prefetchRoute(route);
    });
  }
};
