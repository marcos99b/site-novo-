'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configuração do Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
  onSuccess: (sessionId: string) => void;
  onCancel: () => void;
}

export default function PremiumCheckout({ items, onSuccess, onCancel }: CheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm items={items} onSuccess={onSuccess} onCancel={onCancel} />
    </Elements>
  );
}

function CheckoutForm({ items, onSuccess, onCancel }: CheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // Criar sessão de checkout
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerEmail: customerData.email,
          customerName: customerData.name,
          customerPhone: customerData.phone,
          metadata: {
            address: customerData.address,
            city: customerData.city,
            postalCode: customerData.postalCode,
            notes: customerData.notes
          }
        })
      });

      const { url, sessionId } = await response.json();
      
      if (url) {
        onSuccess(sessionId);
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUNA ESQUERDA - RESUMO DO PEDIDO */}
          <div className="space-y-6">
            {/* Header elegante */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-royal font-bold text-slate-800 mb-2 tracking-[0.2px]">
                Finalizar Compra
              </h1>
              <p className="text-slate-600 font-medium">
                Complete seus dados para finalizar a compra com segurança
              </p>
            </div>

            {/* Resumo dos produtos */}
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
              <h2 className="text-xl font-royal font-bold text-slate-800 mb-4 tracking-[0.2px]">
                Resumo do Pedido
              </h2>
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-royal font-semibold text-slate-800 tracking-[0.2px]">
                        {item.name}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        Quantidade: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-royal font-bold text-slate-800">
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-royal font-semibold text-slate-800">Total:</span>
                  <span className="text-2xl font-royal font-bold text-slate-800">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-emerald-800">Pagamento Seguro</p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-blue-800">Envio Premium</p>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - FORMULÁRIO */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dados pessoais */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                <h2 className="text-xl font-royal font-bold text-slate-800 mb-4 tracking-[0.2px]">
                  Dados Pessoais
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerData.name}
                      onChange={(e) => setCustomerData({...customerData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerData.email}
                      onChange={(e) => setCustomerData({...customerData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({...customerData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                      placeholder="+351 123 456 789"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço de entrega */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                <h2 className="text-xl font-royal font-bold text-slate-800 mb-4 tracking-[0.2px]">
                  Endereço de Entrega
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Endereço *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerData.address}
                      onChange={(e) => setCustomerData({...customerData, address: e.target.value})}
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerData.city}
                        onChange={(e) => setCustomerData({...customerData, city: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                        placeholder="Lisboa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerData.postalCode}
                        onChange={(e) => setCustomerData({...customerData, postalCode: e.target.value})}
                        className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                        placeholder="1000-001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-200">
                <h2 className="text-xl font-royal font-bold text-slate-800 mb-4 tracking-[0.2px]">
                  Observações Especiais
                </h2>
                
                <textarea
                  value={customerData.notes}
                  onChange={(e) => setCustomerData({...customerData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="Instruções especiais para entrega, preferências de horário, etc. (opcional)"
                />
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-300 text-slate-700 px-8 py-4 rounded-2xl font-royal font-bold hover:border-slate-400 hover:text-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 tracking-[0.2px]"
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={loading || !stripe}
                  className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 text-white px-8 py-4 rounded-2xl font-royal font-bold hover:from-slate-900 hover:to-black transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 tracking-[0.2px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '🔄 Processando...' : `Pagar €${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
