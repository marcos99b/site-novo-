'use client';

import { useEffect } from 'react';
// Remover tracking para performance máxima
// import { trackUserEvent } from '@/lib/supabase';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  useEffect(() => {
    // Remover tracking para performance máxima
    // trackUserEvent('checkout_cancelled' as any, { reason: 'user_cancel' }, window.location.pathname).catch(() => {});
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Ícone de cancelamento elegante */}
        <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        {/* Título elegante */}
        <h1 className="text-4xl font-royal font-bold text-slate-800 mb-4 tracking-[0.2px]">
          Checkout Interrompido
        </h1>
        
        {/* Mensagem reconfortante */}
        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg mx-auto">
          Não se preocupe! Seu checkout foi interrompido, mas os itens continuam seguros no seu carrinho. Você pode retomar a compra quando quiser.
        </p>
        

        
        {/* Botões de ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/catalogo" 
            className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-8 py-4 rounded-2xl font-royal font-bold hover:from-slate-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 tracking-[0.2px]"
          >
            Continuar Comprando
          </Link>
          <Link 
            href="/" 
            className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-royal font-bold hover:border-slate-400 hover:text-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 tracking-[0.2px]"
          >
            Voltar ao Início
          </Link>
        </div>
        
        {/* Mensagem adicional */}
        <p className="text-sm text-slate-500 mt-8">
          Estamos aqui para ajudar! 🤝
        </p>
      </div>
    </div>
  );
}
