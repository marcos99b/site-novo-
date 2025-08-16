// 🚀 Otimizador de Bundle JavaScript
// Este arquivo contém funções para otimizar o carregamento de JavaScript

// Debounce para otimizar eventos de scroll e resize
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

// Throttle para otimizar eventos frequentes
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

import React from 'react';
import dynamic from 'next/dynamic';

// Lazy loading otimizado para componentes pesados
export const createLazyComponent = (importFn: () => Promise<any>, fallback?: React.ReactNode) => {
  return dynamic(importFn, {
    loading: () => (fallback as React.ReactElement) || <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse rounded-2xl" />,
    ssr: false,
    suspense: false
  });
};

// Preload de recursos críticos
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload de imagens críticas
    const criticalImages = [
      '/colecao-outono/optimized/hero-1.jpg',
      '/colecao-outono/optimized/hero-2.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = src;
      link.as = 'image';
      document.head.appendChild(link);
    });

    // Preload de fontes críticas
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter-var.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
  }
};

// Otimização de scroll com requestAnimationFrame
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

// Cache de dados estáticos para reduzir re-renders
export const createStaticCache = <T,>() => {
  const cache = new Map<string, { data: T; timestamp: number }>();
  
  return {
    get: (key: string, ttl: number = 5 * 60 * 1000): T | null => {
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.data;
      }
      return null;
    },
    
    set: (key: string, data: T): void => {
      cache.set(key, { data, timestamp: Date.now() });
    },
    
    clear: (): void => {
      cache.clear();
    }
  };
};

// Otimização de imagens
export const optimizeImageLoading = (src: string, width: number, quality: number = 80) => {
  if (src.startsWith('/') && !src.includes('?')) {
    return `${src}?w=${width}&q=${quality}&f=webp`;
  }
  return src;
};

// Inicialização das otimizações
export const initBundleOptimizations = () => {
  if (typeof window !== 'undefined') {
    // Preload de recursos críticos
    preloadCriticalResources();
    
    // Otimizar scroll
    const scrollHandler = optimizeScroll(() => {
      // Lazy loading de elementos visíveis
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      }, { rootMargin: '50px' });
      
      // Observar imagens com data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        observer.observe(img);
      });
    });
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', debounce(scrollHandler, 100), { passive: true });
  }
};
