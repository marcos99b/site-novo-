import Queue from 'bull';
import { redis } from './redis';
import { logger } from './logger';
import { cjClient } from './cj';
import { prisma } from './db';

// Configuração do Redis para Bull
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  }
};

// Criar filas
export const syncProductsQueue = new Queue('sync-products', redisConfig);
export const createOrderQueue = new Queue('create-order', redisConfig);
export const processWebhookQueue = new Queue('process-webhook', redisConfig);
export const updateStockQueue = new Queue('update-stock', redisConfig);

// Processador de sincronização de produtos
syncProductsQueue.process(async (job) => {
  const { keywords, pageSize } = job.data;
  
  logger.info(`Processing sync products job: ${job.id}`, { keywords, pageSize });
  
  try {
    let totalImported = 0;
    
    for (const keyword of keywords) {
      const cjResponse = await cjClient.queryProducts({ 
        keyword, 
        pageNum: 1, 
        pageSize 
      });
      
      const items = cjResponse?.data?.list || [];
      
      for (const product of items) {
        const cjProductId = String(product.id || product.productId || product.pid || "");
        if (!cjProductId) continue;
        
        const images = Array.isArray(product.imageList) ? product.imageList : 
                      Array.isArray(product.images) ? product.images : [];
        
        const name = product.name || product.productName || "Produto";
        const description = product.description || "";
        const priceMin = Number(product.priceMin || product.price || 0);
        const priceMax = Number(product.priceMax || product.price || 0);
        
        // Criar/atualizar produto
        const dbProduct = await prisma.product.upsert({
          where: { cjProductId },
          create: {
            cjProductId,
            name,
            description,
            images,
            priceMin,
            priceMax,
          },
          update: {
            name,
            description,
            images,
            priceMin,
            priceMax,
          },
        });
        
        // Processar variantes
        const variants = Array.isArray(product.variants) ? product.variants : 
                       Array.isArray(product.variantList) ? product.variantList : [];
        
        for (const variant of variants) {
          const cjVariantId = String(variant.id || variant.variantId || variant.vid || "");
          if (!cjVariantId) continue;
          
          await prisma.variant.upsert({
            where: { cjVariantId },
            create: {
              cjVariantId,
              sku: String(variant.sku || ""),
              name: String(variant.name || variant.variantName || name),
              image: variant.image || images?.[0] || null,
              price: Number(variant.price || priceMin || 0),
              stock: Number(variant.stock || 0),
              productId: dbProduct.id,
            },
            update: {
              sku: String(variant.sku || ""),
              name: String(variant.name || variant.variantName || name),
              image: variant.image || images?.[0] || null,
              price: Number(variant.price || priceMin || 0),
              stock: Number(variant.stock || 0),
              productId: dbProduct.id,
            },
          });
        }
        
        totalImported++;
      }
    }
    
    logger.info(`Sync products job completed: ${totalImported} products imported`);
    return { success: true, totalImported };
    
  } catch (error) {
    logger.error(`Error in sync products job: ${error}`);
    throw error;
  }
});

// Processador de criação de pedidos
createOrderQueue.process(async (job) => {
  const { email, items, customerData } = job.data;
  
  logger.info(`Processing create order job: ${job.id}`, { email });
  
  try {
    // Criar ou buscar cliente
    let customer = await prisma.customer.findUnique({
      where: { email }
    });
    
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email,
          name: customerData?.name,
          phone: customerData?.phone,
          address: customerData?.address
        }
      });
    }
    
    // Calcular total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const item of items) {
      const variant = await prisma.variant.findUnique({
        where: { id: item.variantId },
        include: { product: true }
      });
      
      if (!variant) {
        throw new Error(`Variant not found: ${item.variantId}`);
      }
      
      totalAmount += variant.price * item.quantity;
      orderItems.push({
        variantId: variant.id,
        quantity: item.quantity,
        unitPrice: variant.price
      });
    }
    
    // Criar pedido
    const order = await prisma.order.create({
      data: {
        email,
        customerId: customer.id,
        totalAmount,
        status: 'created',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        }
      }
    });
    
    // Criar pedido na CJ
    const cjOrderData = {
      // Mapear dados para formato da CJ
      orderItems: orderItems.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      })),
      customerInfo: {
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    };
    
    const cjOrder = await cjClient.createOrderV2(cjOrderData);
    
    // Atualizar pedido com ID da CJ
    await prisma.order.update({
      where: { id: order.id },
      data: { cjOrderId: cjOrder.orderId }
    });
    
    logger.info(`Order created successfully: ${order.id}`);
    return { success: true, orderId: order.id, cjOrderId: cjOrder.orderId };
    
  } catch (error) {
    logger.error(`Error in create order job: ${error}`);
    throw error;
  }
});

// Processador de webhooks
processWebhookQueue.process(async (job) => {
  const { provider, data } = job.data;
  
  logger.info(`Processing webhook job: ${job.id}`, { provider });
  
  try {
    if (provider === 'cj') {
      // Processar webhook da CJ
      if (data.type === 'order_status_update') {
        await prisma.order.updateMany({
          where: { cjOrderId: data.orderId },
          data: { 
            status: data.status,
            shippingTrack: data.tracking || {}
          }
        });
      }
      
      if (data.type === 'stock_update') {
        await updateStockQueue.add('update-stock', {
          variantId: data.variantId,
          stock: data.stock
        });
      }
    }
    
    logger.info(`Webhook processed successfully: ${provider}`);
    return { success: true };
    
  } catch (error) {
    logger.error(`Error in webhook job: ${error}`);
    throw error;
  }
});

// Processador de atualização de estoque
updateStockQueue.process(async (job) => {
  const { variantId, stock } = job.data;
  
  logger.info(`Processing stock update job: ${job.id}`, { variantId, stock });
  
  try {
    await prisma.variant.update({
      where: { id: variantId },
      data: { stock }
    });
    
    // Invalidar cache
    await redis.del(`product:${variantId}`);
    
    logger.info(`Stock updated successfully: ${variantId}`);
    return { success: true };
    
  } catch (error) {
    logger.error(`Error in stock update job: ${error}`);
    throw error;
  }
});

// Configurar retry e dead letter queue
const queues = [syncProductsQueue, createOrderQueue, processWebhookQueue, updateStockQueue];

queues.forEach(queue => {
  queue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed:`, err);
  });
  
  queue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });
  
  queue.on('error', (err) => {
    logger.error('Queue error:', err);
  });
});

export { queues };
