/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 🚀 Otimizações básicas de Performance
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
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


