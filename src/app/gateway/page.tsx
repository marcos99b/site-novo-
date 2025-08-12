'use client';

import { useState, useEffect } from 'react';

interface Order {
  id: string;
  email: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: Array<{
    variant: {
      name: string;
      price: number;
    };
    quantity: number;
  }>;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  today: any;
}

export default function GatewayPage() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [approvalReason, setApprovalReason] = useState('');

  const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar pedidos pendentes
      const pendingResponse = await fetch(`${GATEWAY_URL}/api/gateway/pending-orders`);
      const pendingData = await pendingResponse.json();
      setPendingOrders(pendingData.orders || []);
      
      // Buscar estatísticas
      const statsResponse = await fetch(`${GATEWAY_URL}/api/gateway/stats`);
      const statsData = await statsResponse.json();
      setStats(statsData);
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Atualizar a cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const approveOrder = async (orderId: string, approved: boolean) => {
    try {
      const response = await fetch(`${GATEWAY_URL}/api/gateway/manual-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          approved,
          reason: approvalReason || (approved ? 'Aprovado pelo admin' : 'Rejeitado pelo admin'),
          adminId: 'admin-1'
        })
      });
      
      if (response.ok) {
        setSelectedOrder(null);
        setApprovalReason('');
        fetchData(); // Atualizar dados
      }
    } catch (error) {
      console.error('Erro ao aprovar pedido:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gateway de aprovação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 Gateway de Aprovação Rápida
          </h1>
          <p className="text-gray-600">
            Sistema de aprovação automática e manual de pedidos
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm font-medium text-gray-500">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <p className="text-sm font-medium text-yellow-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-sm font-medium text-green-600">Aprovados</p>
              <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-sm font-medium text-red-600">Rejeitados</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
            </div>
          </div>
        )}

        {/* Pedidos Pendentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              📋 Pedidos Pendentes de Aprovação ({pendingOrders.length})
            </h2>
          </div>
          <div className="p-6">
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum pedido pendente de aprovação</p>
            ) : (
              <div className="space-y-4">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900">Pedido #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-500">{order.email}</p>
                        <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} item(s)
                        </p>
                      </div>
                    </div>
                    
                    {/* Itens do pedido */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Itens:</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.variant.name} x{item.quantity}</span>
                            <span>{formatCurrency(item.variant.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Botões de ação */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        🔍 Revisar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal de Aprovação */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">
                Revisar Pedido #{selectedOrder.id.slice(-8)}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Cliente: {selectedOrder.email}</p>
                <p className="text-sm text-gray-600 mb-2">Valor: {formatCurrency(selectedOrder.totalAmount)}</p>
                <p className="text-sm text-gray-600 mb-4">Data: {formatDate(selectedOrder.createdAt)}</p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo da decisão:
                </label>
                <textarea
                  value={approvalReason}
                  onChange={(e) => setApprovalReason(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                  rows={3}
                  placeholder="Digite o motivo da aprovação/rejeição..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => approveOrder(selectedOrder.id, true)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Aprovar
                </button>
                <button
                  onClick={() => approveOrder(selectedOrder.id, false)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  ❌ Rejeitar
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setApprovalReason('');
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ✕ Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botão de Atualização */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? '🔄 Atualizando...' : '🔄 Atualizar Dados'}
          </button>
        </div>
      </div>
    </div>
  );
}


