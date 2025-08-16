'use client';

import { useCart } from '@/contexts/CartContext';
import { useState, useRef, useEffect } from 'react';
// Remover tracking para performance máxima
// import { getTracker } from '@/lib/tracking';

export default function CartButton() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveItem = (itemId: number) => removeFromCart(itemId);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) removeFromCart(itemId);
    else updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = async () => {
    try {
      if (cart.items.length === 0) return;
      // Tracking de checkout iniciado
      try {
        // Remover tracking para performance máxima
        // const tracker = getTracker();
        // tracker.trackCheckoutStarted(
        //   cart.items.map((it) => ({ id: it.id, name: it.name, price: it.price, quantity: it.quantity })),
        //   cart.total
        // );
      } catch {}
      const items = cart.items.map((it) => ({
        name: it.name,
        amount_cents: Math.round(it.price * 100),
        quantity: it.quantity,
      }));
      const resp = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: 'EUR', items, successPath: '/checkout/success', cancelPath: '/checkout/cancel' })
      });
      const data = await resp.json();
      if (data.ok && data.url) {
        window.location.href = data.url;
      }
    } catch (e) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) {
                          // Remover tracking para performance máxima
              // try {
              //   const tracker = getTracker();
              //   tracker.trackCartOpened(cart.itemCount, cart.total);
              // } catch {}
          }
        }}
        className="nav-icon-3d nav-icon-3d--square"
      >
        <svg className="w-6 h-6 nav-icon-3d__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
          <path d="M6 6h13l-1.5 8.5a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 6Z"/>
          <path d="M6 6l-.5-2H3"/>
          <circle cx="9.5" cy="19" r="1.25"/>
          <circle cx="15.5" cy="19" r="1.25"/>
        </svg>
        {cart.itemCount > 0 && (<span className="nav-icon-3d__badge">{cart.itemCount}</span>)}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 z-50">
          <div className="card-elegant bg-white p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#111827]">Carrinho</h3>
              <button onClick={() => setIsOpen(false)} className="text-[#6b7280] hover:text-[#111827] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {cart.items.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" shapeRendering="geometricPrecision">
                  <path d="M6 6h13l-1.5 8.5a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 6Z"/>
                  <path d="M6 6l-.5-2H3"/>
                  <circle cx="9.5" cy="19" r="1.25"/>
                  <circle cx="15.5" cy="19" r="1.25"/>
                </svg>
                <p className="text-[#6b7280]">Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-black/[0.06]">
                      <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg'; }} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-[#111827] truncate">{item.name}</h4>
                        <p className="text-sm font-semibold text-[#1f2937]">{(item.price).toFixed(2)} €</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-6 h-6 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111827] rounded-full flex items-center justify-center text-xs font-bold transition-colors">-</button>
                          <span className="text-sm text-[#374151] min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-6 h-6 bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#111827] rounded-full flex items-center justify-center text-xs font-bold transition-colors">+</button>
                        </div>
                      </div>
                      <button onClick={() => handleRemoveItem(item.id)} className="text-[#ef4444] hover:opacity-80 transition-colors p-1" title="Remover item">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/[0.06] mt-4 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[#111827] font-bold">Total:</span>
                    <span className="text-xl font-bold text-[#111827]">{(cart.total).toFixed(2)} €</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full btn-primary py-3">Finalizar Compra</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
