/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 🚀 Otimizações de Performance
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    // 🎯 Otimizações de imagem
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // 🚀 Otimizações experimentais ULTRA para LCP, TTI e JavaScript
    optimizeCss: true,
    optimizePackageImports: ['@/components', 'react', 'react-dom', 'three'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
        // 🚀 Otimizações para JavaScript
        '*.tsx': {
          loaders: ['@swc/loader'],
          as: '*.js',
        },
        // 🚀 Otimizações para imagens
        '*.jpg': {
          loaders: ['@next/image-loader'],
          as: '*.webp',
        },
        '*.png': {
          loaders: ['@next/image-loader'],
          as: '*.webp',
        },
      },
    },
    // 🎯 Otimizações de performance EXTREMA
    optimizeServerReact: true,
    webVitalsAttribution: ['CLS', 'LCP', 'TTI', 'FCP'],
    // 🚀 Otimizações para JavaScript e 3D
    optimizePackageImports: ['@/components', 'react', 'react-dom', 'three'],
    // 🚀 Otimizações para imagens críticas
    optimizeImages: false, // Desabilitado para evitar conflitos
    // 🚀 Otimizações para fontes
    optimizeFonts: false, // Desabilitado para evitar conflitos
    // 🚀 Otimizações para JavaScript
    optimizeJavaScript: true,
    // 🚀 Otimizações para LCP
    optimizeLCP: true,
  },
  // 🔒 Content Security Policy para Stripe
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com https://*.arkoselabs.com https://js.stripe.com",
              "style-src 'self' 'unsafe-inline' https://*.stripe.com https://*.arkoselabs.com https://js.stripe.com",
              "img-src 'self' data: https: blob: https://*.stripe.com",
              "font-src 'self' data: https: https://*.stripe.com",
              "connect-src 'self' https://*.stripe.com https://*.arkoselabs.com https://api.stripe.com",
              "frame-src 'self' https://*.stripe.com https://checkout.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.stripe.com https://checkout.stripe.com",
              "worker-src 'self' blob:",
              "child-src 'self' https://*.stripe.com"
            ].join('; ')
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;


