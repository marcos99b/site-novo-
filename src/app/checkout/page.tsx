'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface Order {
  id: string;
  email: string;
  totalAmount: number;
  status: string;
  items: Array<{
    variant: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600">Carregando...</p></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`);
      const data = await response.json();
      if (data.orders && data.orders.length > 0) {
        setOrder(data.orders[0]);
      }
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCardData = () => {
    if (!cardData.cardNumber || !cardData.cardName || !cardData.expiry || !cardData.cvv) {
      return 'Todos os campos do cartão são obrigatórios';
    }
    
    if (cardData.cardNumber.replace(/\s/g, '').length < 13) {
      return 'Número do cartão inválido';
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      return 'Data de validade inválida (use MM/AA)';
    }
    
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      return 'CVV inválido';
    }
    
    return null;
  };

  const processPayment = async () => {
    if (!paymentMethod || !orderId) return;

    // Validar dados do cartão se necessário
    if (paymentMethod === 'credit_card') {
      const validationError = validateCardData();
      if (validationError) {
        setPaymentResult({
          success: false,
          error: validationError
        });
        return;
      }
    }

    setProcessing(true);
    setPaymentResult(null);

    try {
      const paymentData = paymentMethod === 'credit_card' ? cardData : {};
      
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod,
          paymentData
        })
      });

      const result = await response.json();
      setPaymentResult(result);

      if (result.success) {
        // Atualizar o pedido
        fetchOrder();
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        error: 'Erro ao processar pagamento'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando checkout...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Pedido não encontrado</h1>
          <p className="text-gray-600">O pedido solicitado não foi encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">💳 Checkout</h1>
            <p className="text-blue-100">Pedido #{order.id.slice(-8)}</p>
          </div>

          <div className="p-6">
            {/* Resumo do Pedido */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Resumo do Pedido</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.variant.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.variant.price * item.quantity)}</span>
                    </div>
                  ))}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status do Pedido */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Status do Pedido</h2>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'payment_pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'payment_failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {order.status === 'paid' ? '✅ Pago' :
                 order.status === 'payment_pending' ? '⏳ Aguardando Pagamento' :
                 order.status === 'payment_failed' ? '❌ Falha no Pagamento' :
                 '📝 Criado'}
              </div>
            </div>

            {/* Métodos de Pagamento */}
            {order.status !== 'paid' && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">💳 Método de Pagamento</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'pix' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium">PIX</div>
                    <div className="text-sm text-gray-500">Pagamento instantâneo</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'credit_card' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-medium">Cartão de Crédito</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, etc.</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('boleto')}
                    className={`p-4 border-2 rounded-lg text-center transition-colors ${
                      paymentMethod === 'boleto' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">📄</div>
                    <div className="font-medium">Boleto</div>
                    <div className="text-sm text-gray-500">Pagamento em até 3 dias</div>
                  </button>
                </div>

                {/* Formulário de Cartão de Crédito */}
                {paymentMethod === 'credit_card' && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-gray-900 mb-4">Dados do Cartão</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número do Cartão
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={(e) => setCardData({...cardData, cardNumber: formatCardNumber(e.target.value)})}
                          maxLength={19}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome no Cartão
                        </label>
                        <input
                          type="text"
                          placeholder="João Silva"
                          value={cardData.cardName}
                          onChange={(e) => setCardData({...cardData, cardName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Validade
                        </label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                          maxLength={5}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          value={cardData.cvv}
                          onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                          maxLength={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botão de Pagamento */}
                {paymentMethod && (
                  <button
                    onClick={processPayment}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? '🔄 Processando...' : `Pagar ${formatCurrency(order.totalAmount)}`}
                  </button>
                )}
              </div>
            )}

            {/* Resultado do Pagamento */}
            {paymentResult && (
              <div className={`p-4 rounded-lg ${
                paymentResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <h3 className={`font-medium ${
                  paymentResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {paymentResult.success ? '✅ Pagamento Processado' : '❌ Erro no Pagamento'}
                </h3>
                <p className={`mt-1 ${
                  paymentResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {paymentResult.message || paymentResult.error}
                </p>
                {paymentResult.paymentId && (
                  <p className="text-sm text-gray-600 mt-2">
                    ID do Pagamento: {paymentResult.paymentId}
                  </p>
                )}
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                💡 <strong>Dicas de Teste:</strong><br/>
                • Cartão recusado: números terminando em 0000<br/>
                • Limite insuficiente: números terminando em 1111<br/>
                • Cartão válido: qualquer outro número
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
