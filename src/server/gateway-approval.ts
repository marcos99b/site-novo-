import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { prisma } from '../lib/db';
import { monitoring } from '../lib/monitoring';

const fastify = Fastify({
  logger: true,
  trustProxy: true
});

// Função para configurar o gateway
async function setupGateway() {
  // Middleware de segurança
  await fastify.register(helmet);
  await fastify.register(cors, {
    origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    credentials: true
  });

  // Rate limiting mais permissivo para aprovação
  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1', 'localhost']
  });

  // Health check
  fastify.get('/health', async (request, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'gateway-approval'
      };
    } catch (error) {
      reply.status(503);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  });

  // Gateway de Aprovação Rápida
  fastify.register(async (fastify) => {
    
    // Aprovação automática de pedidos
    fastify.post('/api/gateway/approve-order', async (request, reply) => {
      const start = Date.now();
      
      try {
        const { orderId, customerData, items, totalAmount } = request.body as any;
        
        // Validações rápidas
        if (!orderId || !customerData?.email || !items || items.length === 0) {
          monitoring.logWarning('Pedido rejeitado - dados inválidos', { orderId });
          reply.status(400);
          return { 
            approved: false, 
            reason: 'Dados inválidos',
            orderId 
          };
        }
        
        // Verificar limite de valor (configurável)
        const maxOrderValue = process.env.MAX_ORDER_VALUE ? parseFloat(process.env.MAX_ORDER_VALUE) : 1000;
        if (totalAmount > maxOrderValue) {
          monitoring.logWarning('Pedido rejeitado - valor muito alto', { orderId, totalAmount, maxOrderValue });
          reply.status(400);
          return { 
            approved: false, 
            reason: 'Valor do pedido excede o limite',
            orderId,
            maxAllowed: maxOrderValue
          };
        }
        
        // Verificar estoque rapidamente
        const stockCheck = await Promise.all(
          items.map(async (item: any) => {
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
        
        const outOfStock = stockCheck.filter((item: any) => item.requested > item.available);
        if (outOfStock.length > 0) {
          monitoring.logWarning('Pedido rejeitado - sem estoque', { orderId, outOfStock });
          reply.status(400);
          return { 
            approved: false, 
            reason: 'Produtos sem estoque suficiente',
            orderId,
            outOfStock
          };
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
          monitoring.addMetric('order_approval_duration', duration, { method: 'auto', approved: 'true' });
          monitoring.logWarning('Pedido aprovado automaticamente', { orderId, reason: autoApprove ? 'cliente recorrente' : 'valor baixo' });
          
          return { 
            approved: true, 
            orderId,
            reason: isReturningCustomer ? 'Cliente recorrente' : 'Valor baixo',
            autoApproved: true
          };
        }
        
        // Para outros casos, retornar pendente para revisão manual
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            status: 'pending_approval'
          }
        });
        
        const duration = Date.now() - start;
        monitoring.addMetric('order_approval_duration', duration, { method: 'manual', approved: 'false' });
        
        return { 
          approved: false, 
          orderId,
          reason: 'Aguardando aprovação manual',
          requiresManualReview: true
        };
        
      } catch (error) {
        const duration = Date.now() - start;
        monitoring.logError(error as Error, { endpoint: '/api/gateway/approve-order' });
        monitoring.addMetric('order_approval_duration', duration, { method: 'error', approved: 'false' });
        
        reply.status(500);
        return { 
          approved: false, 
          reason: 'Erro interno',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    // Aprovação manual de pedidos
    fastify.post('/api/gateway/manual-approve', async (request, reply) => {
      try {
        const { orderId, approved, reason, adminId } = request.body as any;
        
        if (!orderId || approved === undefined) {
          reply.status(400);
          return { success: false, error: 'orderId e approved são obrigatórios' };
        }
        
        const status = approved ? 'approved' : 'rejected';
        
        const order = await prisma.order.update({
          where: { id: orderId },
          data: { status }
        });
        
        monitoring.logWarning(`Pedido ${approved ? 'aprovado' : 'rejeitado'} manualmente`, { 
          orderId, 
          approved, 
          reason, 
          adminId 
        });
        
        return { 
          success: true, 
          orderId,
          status: order.status
        };
        
      } catch (error) {
        monitoring.logError(error as Error, { endpoint: '/api/gateway/manual-approve' });
        reply.status(500);
        return { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    // Listar pedidos pendentes de aprovação
    fastify.get('/api/gateway/pending-orders', async (request, reply) => {
      try {
        const { limit = 50, offset = 0 } = request.query as any;
        
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
        
        return { 
          orders: pendingOrders,
          total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        };
        
      } catch (error) {
        monitoring.logError(error as Error, { endpoint: '/api/gateway/pending-orders' });
        reply.status(500);
        return { 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
    
    // Estatísticas de aprovação
    fastify.get('/api/gateway/stats', async (request, reply) => {
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
        
        return {
          total,
          pending,
          approved,
          rejected,
          today: todayStats.reduce((acc, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          }, {} as any)
        };
        
      } catch (error) {
        monitoring.logError(error as Error, { endpoint: '/api/gateway/stats' });
        reply.status(500);
        return { 
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });
  });
}

// Configurar o gateway
setupGateway().catch(console.error);

export { fastify as gatewayApproval };
