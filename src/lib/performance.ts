// Configurações de performance para otimização do site

export const PERFORMANCE_CONFIG = {
  // Cache de produtos
  PRODUCT_CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  
  // Lazy loading
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '100px',
  
  // Throttling de eventos
  MOUSE_MOVE_THROTTLE: 16, // ~60fps
  SCROLL_THROTTLE: 16, // ~60fps
  
  // Imagens
  IMAGE_QUALITY: 80,
  HERO_IMAGE_MAX_WIDTH: 1200,
  PRODUCT_IMAGE_MAX_WIDTH: 800,
  
  // API
  API_TIMEOUT: 10000, // 10 segundos
  API_RETRY_ATTEMPTS: 2,
  
  // Bundle
  LAZY_LOAD_DELAY: 100, // ms
  COMPONENT_LOAD_TIMEOUT: 5000, // 5 segundos
};

// Função para debounce
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Função para throttle
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Função para preload de imagens
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

// Função para preload de componentes críticos
export function preloadCriticalComponents() {
  // Preload de imagens hero
  const heroImages = [
    '/colecao-outono/optimized/hero-1.jpg',
    '/colecao-outono/optimized/hero-2.jpg',
    '/colecao-outono/optimized/hero-3.jpg',
  ];
  
  heroImages.forEach(src => {
    preloadImage(src).catch(() => {
      // Ignorar erros de preload
    });
  });
}
