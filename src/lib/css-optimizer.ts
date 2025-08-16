// 🚀 Sistema de Otimização ULTRA para CSS (FCP e TBT)
// Este arquivo implementa otimizações extremas para CSS

// 🚀 Inline CSS crítico para FCP
export const inlineCriticalCSS = () => {
  if (typeof window === 'undefined') return;

  // 🚀 CSS crítico inline para melhorar FCP
  const criticalCSS = `
    .lcp-optimized {
      opacity: 1 !important;
      transform: none !important;
      transition: none !important;
    }
    
    .hero-loaded {
      opacity: 1 !important;
      visibility: visible !important;
    }
    
    .image-loaded {
      opacity: 1 !important;
      transform: scale(1) !important;
    }
    
    .loading-mode {
      animation: none !important;
      transition: none !important;
    }
    
    .lcp-optimized img {
      content-visibility: auto !important;
      contain-intrinsic-size: 500px 600px !important;
    }
  `;

  // 🚀 Injetar CSS crítico
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

// 🚀 Otimização de CSS não crítico
export const optimizeNonCriticalCSS = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Carregar CSS não crítico com delay
  const loadNonCriticalCSS = () => {
    const nonCriticalCSS = [
      '/_next/static/css/app/layout.css',
      '/_next/static/css/app/globals.css'
    ];

    nonCriticalCSS.forEach(cssFile => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssFile;
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    });
  };

  // 🚀 Carregar CSS não crítico após FCP
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
  } else {
    loadNonCriticalCSS();
  }
};

// 🚀 Otimização de fontes para FCP
export const optimizeFonts = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Preload de fontes críticas
  const criticalFonts = [
    '/fonts/inter-var.woff2'
  ];

  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  // 🚀 Aplicar font-display: swap
  const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
  fontLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      link.setAttribute('href', href + '&display=swap');
    }
  });
};

// 🚀 Otimização de animações para TBT
export const optimizeAnimations = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Reduzir animações durante carregamento
  const reduceAnimations = () => {
    document.body.classList.add('reduced-motion');
    
    // 🚀 Reabilitar animações após TTI
    setTimeout(() => {
      document.body.classList.remove('reduced-motion');
    }, 2000);
  };

  // 🚀 Aplicar otimizações
  reduceAnimations();
};

// 🚀 Sistema principal de otimização CSS
export const initCSSOptimizations = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Aplicar todas as otimizações
  inlineCriticalCSS();
  optimizeNonCriticalCSS();
  optimizeFonts();
  optimizeAnimations();
};

// 🚀 Otimização específica para FCP
export const optimizeFCP = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Forçar renderização de elementos críticos
  const criticalElements = document.querySelectorAll('[data-critical="true"]');
  criticalElements.forEach(element => {
    element.classList.add('fcp-optimized');
  });

  // 🚀 Remover CSS não crítico
  const nonCriticalStyles = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  nonCriticalStyles.forEach(style => {
    style.media = 'print';
  });
};

// 🚀 Otimização específica para TBT
export const optimizeTBT = () => {
  if (typeof window === 'undefined') return;

  // 🚀 Desabilitar funcionalidades não críticas
  const disableNonCriticalFeatures = () => {
    // 🚀 Desabilitar hover effects
    document.body.classList.add('no-hover');
    
    // 🚀 Desabilitar animações complexas
    document.body.classList.add('no-animations');
    
    // 🚀 Reabilitar após TTI
    setTimeout(() => {
      document.body.classList.remove('no-hover', 'no-animations');
    }, 3000);
  };

  // 🚀 Aplicar otimizações
  disableNonCriticalFeatures();
};
