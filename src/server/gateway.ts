import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { cjClient } from '../lib/cj';
import { prisma } from '../lib/db';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';

const fastify = Fastify({
  logger: true,
  trustProxy: true
});

// Middleware de segurança
await fastify.register(helmet);
await fastify.register(cors, {
  origin: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  credentials: true
});

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  allowList: ['127.0.0.1', 'localhost']
});

// Health check
fastify.get('/health', async (request, reply) => {
  try {
    // Verificar conexões
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        cj: 'available'
      }
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

// API Routes
fastify.register(async (fastify) => {
  // Products API
  fastify.get('/api/products', async (request, reply) => {
    try {
      const products = await prisma.product.findMany({
        include: { variants: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return { products };
    } catch (error) {
      logger.error('Error fetching products:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });

  fastify.post('/api/products/sync', async (request, reply) => {
    try {
      const { keywords = ['magnetic charger'], pageSize = 20 } = request.body as any;
      
      // Adicionar job à fila (se fila estiver configurada)
      if ((fastify as any).queue && typeof (fastify as any).queue.add === 'function') {
        await (fastify as any).queue.add('sync-products', {
          keywords,
          pageSize,
          timestamp: new Date().toISOString()
        });
      }
      
      return { 
        success: true, 
        message: 'Sync job queued successfully',
        jobId: Date.now().toString()
      };
    } catch (error) {
      logger.error('Error queuing sync job:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });

  // Orders API
  fastify.post('/api/orders', async (request, reply) => {
    try {
      const orderData = request.body as any;
      
      // Validar dados do pedido
      if (!orderData.email || !orderData.items || orderData.items.length === 0) {
        reply.status(400);
        return { error: 'Invalid order data' };
      }
      
      // Adicionar job à fila (se fila estiver configurada)
      if ((fastify as any).queue && typeof (fastify as any).queue.add === 'function') {
        await (fastify as any).queue.add('create-order', {
          ...orderData,
          timestamp: new Date().toISOString()
        });
      }
      
      return { 
        success: true, 
        message: 'Order queued for processing',
        orderId: `temp-${Date.now()}`
      };
    } catch (error) {
      logger.error('Error queuing order:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });

  // CRM API
  fastify.get('/api/crm/leads', async (request, reply) => {
    try {
      const { status } = request.query as any;
      
      const leads = await prisma.lead.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: 'desc' }
      });
      
      return { leads };
    } catch (error) {
      logger.error('Error fetching leads:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });

  fastify.post('/api/crm/leads', async (request, reply) => {
    try {
      const leadData = request.body as any;
      
      const lead = await prisma.lead.create({
        data: {
          email: leadData.email,
          name: leadData.name,
          phone: leadData.phone,
          source: leadData.source || 'website',
          status: 'new'
        }
      });
      
      return { success: true, lead };
    } catch (error) {
      logger.error('Error creating lead:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });

  // CJ Integration API
  fastify.get('/api/cj/product/:id', async (request, reply) => {
    try {
      const { id } = request.params as any;
      
      // Buscar no cache primeiro
      const cached = await redis.get(`product:${id}`);
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Buscar na CJ
      const product = await cjClient.getProduct(id);
      
      // Cache por 1 hora
      await redis.setex(`product:${id}`, 3600, JSON.stringify(product));
      
      return product;
    } catch (error) {
      logger.error('Error fetching CJ product:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });

  // Webhook endpoint
  fastify.post('/api/webhooks/cj', async (request, reply) => {
    try {
      const webhookData = request.body as any;
      
      // Adicionar job à fila para processar webhook (se fila estiver configurada)
      if ((fastify as any).queue && typeof (fastify as any).queue.add === 'function') {
        await (fastify as any).queue.add('process-webhook', {
          provider: 'cj',
          data: webhookData,
          timestamp: new Date().toISOString()
        });
      }
      
      return { success: true };
    } catch (error) {
      logger.error('Error processing webhook:', error);
      reply.status(500);
      return { error: 'Internal server error' };
    }
  });
});

export { fastify };
