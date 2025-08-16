import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/styles/**/*.css",
  ],
  // 🚀 Otimizações de Performance EXTREMAS
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {},
  },
  plugins: [],
  // 🎯 Otimizações de build EXTREMAS para LCP e TTI
  corePlugins: {
    preflight: true,
    container: false,
    accessibility: false,
    // 🚀 Desabilitar plugins pesados para performance
    animation: false,
    backdropFilter: false,
    filter: false,
  },
  // 🚀 Otimizações para LCP e TTI
  experimental: {
    optimizeUniversalDefaults: true,
  },
};
export default config;


