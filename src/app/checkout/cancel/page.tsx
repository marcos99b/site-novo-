'use client';

import { useEffect } from 'react';
import { trackUserEvent } from '@/lib/supabase';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  useEffect(() => {
    trackUserEvent('checkout_cancelled' as any, { reason: 'user_cancel' }, window.location.pathname).catch(() => {});
  }, []);
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="card-elegant bg-white p-8 w-full max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-semibold text-[#111827]">Checkout cancelado</h1>
        <p className="text-[#374151]">O seu checkout foi interrompido. Pode retomar quando quiser — os itens continuam no seu carrinho.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <Link href="/checkout" className="btn-secondary-dark">Voltar ao checkout</Link>
          <Link href="/catalogo" className="btn-primary">Ver catálogo</Link>
        </div>
      </div>
    </div>
  );
}
