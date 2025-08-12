#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.GATEWAY_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'gateway-approval'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Aprovação automática de pedidos
app.post('/api/gateway/approve-order', async (req, res) => {
  const start = Date.now();
  
  try {
    const { orderId, customerData, items, totalAmount } = req.body;
    
    // Validações rápidas
    if (!orderId || !customerData?.email || !items || items.length === 0) {
      console.log('Pedido rejeitado - dados inválidos:', { orderId });
      return res.status(400).json({ 
        approved: false, 
        reason: 'Dados inválidos',
        orderId 
      });
    }
    
    // Verificar limite de valor (configurável)
    const maxOrderValue = process.env.MAX_ORDER_VALUE ? parseFloat(process.env.MAX_ORDER_VALUE) : 1000;
    if (totalAmount > maxOrderValue) {
      console.log('Pedido rejeitado - valor muito alto:', { orderId, totalAmount, maxOrderValue });
      return res.status(400).json({ 
        approved: false, 
        reason: 'Valor do pedido excede o limite',
        orderId,
        maxAllowed: maxOrderValue
      });
    }
    
    // Verificar estoque rapidamente
    const stockCheck = await Promise.all(
      items.map(async (item) => {
        const variant = await prisma.variant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, name: true }
        });
        return {
          variantId: item.variantId,
          requested: item.quantity,
          available: variant?.stock || 0,
          name: variant?.name || 'Desconhecido'
        };
      })
    );
    
    const outOfStock = stockCheck.filter(item => item.requested > item.available);
    if (outOfStock.length > 0) {
      console.log('Pedido rejeitado - sem estoque:', { orderId, outOfStock });
      return res.status(400).json({ 
        approved: false, 
        reason: 'Produtos sem estoque suficiente',
        orderId,
        outOfStock
      });
    }
    
    // Verificar se é cliente recorrente (aprovado automaticamente)
    const existingOrders = await prisma.order.findMany({
      where: { email: customerData.email }
    });
    
    const isReturningCustomer = existingOrders.length > 0;
    
    // Aprovação automática para clientes recorrentes ou pedidos pequenos
    const autoApprove = isReturningCustomer || totalAmount < 100;
    
    if (autoApprove) {
      // Aprovar automaticamente
      await prisma.order.update({
        where: { id: orderId },
        data: { 
          status: 'approved'
        }
      });
      
      const duration = Date.now() - start;
      console.log('Pedido aprovado automaticamente:', { 
        orderId, 
        reason: isReturningCustomer ? 'cliente recorrente' : 'valor baixo',
        duration 
      });
      
      return res.json({ 
        approved: true, 
        orderId,
        reason: isReturningCustomer ? 'Cliente recorrente' : 'Valor baixo',
        autoApproved: true
      });
    }
    
    // Para outros casos, retornar pendente para revisão manual
    await prisma.order.update({
      where: { id: orderId },
      data: { 
        status: 'pending_approval'
      }
    });
    
    const duration = Date.now() - start;
    console.log('Pedido pendente de aprovação manual:', { orderId, duration });
    
    return res.json({ 
      approved: false, 
      orderId,
      reason: 'Aguardando aprovação manual',
      requiresManualReview: true
    });
    
  } catch (error) {
    const duration = Date.now() - start;
    console.error('Erro ao aprovar pedido:', error);
    
    return res.status(500).json({ 
      approved: false, 
      reason: 'Erro interno',
      error: error.message
    });
  }
});

// Aprovação manual de pedidos
app.post('/api/gateway/manual-approve', async (req, res) => {
  try {
    const { orderId, approved, reason, adminId } = req.body;
    
    if (!orderId || approved === undefined) {
      return res.status(400).json({ success: false, error: 'orderId e approved são obrigatórios' });
    }
    
    const status = approved ? 'approved' : 'rejected';
    
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    
    console.log(`Pedido ${approved ? 'aprovado' : 'rejeitado'} manualmente:`, { 
      orderId, 
      approved, 
      reason, 
      adminId 
    });
    
    return res.json({ 
      success: true, 
      orderId,
      status: order.status
    });
    
  } catch (error) {
    console.error('Erro ao aprovar manualmente:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message
    });
  }
});

// Listar pedidos pendentes de aprovação
app.get('/api/gateway/pending-orders', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'pending_approval' },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    const total = await prisma.order.count({
      where: { status: 'pending_approval' }
    });
    
    return res.json({ 
      orders: pendingOrders,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('Erro ao buscar pedidos pendentes:', error);
    return res.status(500).json({ 
      error: error.message
    });
  }
});

// Estatísticas de aprovação
app.get('/api/gateway/stats', async (req, res) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      prisma.order.count({ where: { status: 'pending_approval' } }),
      prisma.order.count({ where: { status: 'approved' } }),
      prisma.order.count({ where: { status: 'rejected' } }),
      prisma.order.count()
    ]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: today } },
      _count: { status: true }
    });
    
    const todayData = todayStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status;
      return acc;
    }, {});
    
    return res.json({
      total,
      pending,
      approved,
      rejected,
      today: todayData
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return res.status(500).json({ 
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Gateway de Aprovação rodando em http://localhost:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log(`   - Health Check: http://localhost:${PORT}/health`);
  console.log(`   - Aprovação Automática: http://localhost:${PORT}/api/gateway/approve-order`);
  console.log(`   - Aprovação Manual: http://localhost:${PORT}/api/gateway/manual-approve`);
  console.log(`   - Pedidos Pendentes: http://localhost:${PORT}/api/gateway/pending-orders`);
  console.log(`   - Estatísticas: http://localhost:${PORT}/api/gateway/stats`);
  
  console.log('\n🔧 Configurações:');
  console.log(`   - Porta: ${PORT}`);
  console.log(`   - Rate Limit: 200 requests/minuto`);
  console.log(`   - Max Order Value: ${process.env.MAX_ORDER_VALUE || 1000}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando Gateway de Aprovação...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando Gateway de Aprovação...');
  await prisma.$disconnect();
  process.exit(0);
});
