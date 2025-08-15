import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '../styles/globals.css';
import Link from 'next/link';
import FacebookPixel from '@/components/FacebookPixel';
import { CartProvider } from '@/contexts/CartContext';
import CartButton from '@/components/CartButton';
import LoginButton from '@/components/LoginButton';
import Providers from '@/components/Providers';
import BrandLogo from '@/components/BrandLogo';
import ParallaxBackground from '@/components/ParallaxBackground';
import dynamic from 'next/dynamic';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Melhor performance de fontes
  preload: true
});

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['300','400','500','600','700'], 
  variable: '--font-poppins',
  display: 'swap', // Melhor performance de fontes
  preload: true
});

// Lazy load do ChatWidget para melhor performance
const ChatWidget = dynamic(() => import('@/components/ChatWidget'), { 
  ssr: false,
  loading: () => null, // Não mostrar nada enquanto carrega
  suspense: false
});

export const metadata: Metadata = {
  title: 'Reliet - Moda Feminina',
  description: 'Moda feminina elegante: vestidos e conjuntos selecionados, envio para Portugal.',
  keywords: 'vestidos, moda feminina, festa, conjuntos, elegante, portugal',
  openGraph: { title: 'Reliet - Moda Feminina', description: 'Moda feminina elegante.', type: 'website', locale: 'pt_PT' },
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="pt-PT">
      <body className={`${inter.className} ${poppins.variable} min-h-screen app-bg`}>
        <ParallaxBackground />
        <FacebookPixel pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '123456789'} />
        <Providers>
          <CartProvider>
            <header className="sticky top-0 z-50 bg-white/80 text-black backdrop-blur-xl border-b border-black/[0.06]">
              <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <BrandLogo />
                <nav className="hidden md:flex items-center gap-6 text-[14px]">
                  <Link href="/" className="nav-brand-link">HOME</Link>
                  <Link href="/catalogo" className="nav-brand-link">CATÁLOGO</Link>
                  <Link href="/pedidos" className="nav-brand-link">MEUS PEDIDOS</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <CartButton />
                    <LoginButton />
                </div>
              </div>
            </header>

            <main className="relative z-10 container-px">{children}</main>

            <footer className="mt-20 border-t border-black/[0.06] bg-white/70">
              <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-[14px]">
                <div className="md:col-span-2"><BrandLogo className="mb-3" /><p className="text-black/70">Moda feminina elegante e atual. Envio rápido para Portugal.</p></div>
                <div>
                  <div className="font-medium mb-3 text-[#111827]">Ajuda</div>
                  <ul className="space-y-2 text-black/70">
                    <li><Link href="/ajuda">Central de Ajuda</Link></li>
                    <li><Link href="/trocas-devolucoes">Trocas e Devoluções</Link></li>
                    <li><Link href="/garantia">Garantia</Link></li>
                    <li><Link href="/contato">Contato</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-black/[0.06] py-6 text-center text-black/60 text-[13px]"><p>&copy; 2024 Reliet. Todos os direitos reservados.</p></div>
            </footer>
            <ChatWidget />
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}


