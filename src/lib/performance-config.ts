// 🚀 Configurações de Performance
// Este arquivo contém configurações para otimizar a performance do site

export const PERFORMANCE_CONFIG = {
  // Cache de produtos
  PRODUCT_CACHE_DURATION: 365 * 24 * 60 * 60 * 1000, // 1 ano
  
  // Lazy loading
  INTERSECTION_THRESHOLD: 0.01, // Reduzido ao ABSOLUTO MÁXIMO
  INTERSECTION_ROOT_MARGIN: '25px', // Reduzido ao ABSOLUTO MÁXIMO
  
  // Throttling de eventos
  MOUSE_MOVE_THROTTLE: 100, // ~10fps (performance ABSOLUTA)
  SCROLL_THROTTLE: 100, // ~10fps (performance ABSOLUTA)
  
  // Imagens
  IMAGE_QUALITY: 80, // Qualidade otimizada
  HERO_IMAGE_MAX_WIDTH: 800, // Largura máxima otimizada
  PRODUCT_IMAGE_MAX_WIDTH: 600, // Largura máxima otimizada
  
  // API
  API_TIMEOUT: 5000, // 5 segundos (otimizado)
  API_RETRY_ATTEMPTS: 1, // 1 retry para performance
  
  // Bundle
  LAZY_LOAD_DELAY: 100, // ms (otimizado)
  COMPONENT_LOAD_TIMEOUT: 3000, // 3 segundos (otimizado)
  
  // Parallax
  PARALLAX_INTENSITY: 0.5, // Reduzido para performance
  SCROLL_INTENSITY: 0.05, // Reduzido para performance
  
  // 3D Effects
  TILT_INTENSITY: 0.3, // Reduzido para performance
  SCALE_EFFECT: 1.02, // Reduzido para performance
  
  // Cache
  CACHE_IMMUTABLE: true, // Cache imutável para performance
  CACHE_MAX_AGE: 31536000, // 1 ano
};

// Configurações de otimização de imagens
export const IMAGE_OPTIMIZATION = {
  formats: ['webp', 'avif'],
  quality: 80,
  sizes: {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw'
  },
  lazyLoading: true,
  preload: true
};

// Configurações de otimização de JavaScript
export const JS_OPTIMIZATION = {
  bundleSplitting: true,
  treeShaking: true,
  minification: true,
  sourceMaps: false, // Desabilitado para produção
  dynamicImports: true,
  codeSplitting: true
};

// Configurações de otimização de CSS
export const CSS_OPTIMIZATION = {
  purgeCSS: true,
  minification: true,
  criticalCSS: true,
  unusedCSS: false
};

// Configurações de cache
export const CACHE_CONFIG = {
  staticAssets: {
    maxAge: 31536000, // 1 ano
    immutable: true
  },
  apiResponses: {
    maxAge: 300, // 5 minutos
    immutable: false
  },
  images: {
    maxAge: 31536000, // 1 ano
    immutable: true
  }
};

// Configurações de preload
export const PRELOAD_CONFIG = {
  criticalImages: [
    '/colecao-outono/optimized/hero-1.jpg',
    '/colecao-outono/optimized/hero-2.jpg'
  ],
  criticalFonts: [
    '/fonts/inter-var.woff2'
  ],
  criticalRoutes: [
    '/catalogo',
    '/produto/produto-1'
  ]
};
