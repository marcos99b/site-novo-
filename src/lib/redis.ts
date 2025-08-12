import Redis from 'ioredis';
import { logger } from './logger';

// Configuração do Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000
};

// Cliente Redis principal
export const redis = new Redis(redisConfig);

// Cliente Redis para cache
export const cacheRedis = new Redis({
  ...redisConfig,
  db: parseInt(process.env.REDIS_CACHE_DB || '1')
});

// Event listeners
redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

cacheRedis.on('connect', () => {
  logger.info('Cache Redis connected successfully');
});

cacheRedis.on('error', (error) => {
  logger.error('Cache Redis connection error:', error);
});

// Funções de cache
export const cache = {
  // Cache de produtos
  async getProduct(id: string) {
    try {
      const cached = await cacheRedis.get(`product:${id}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting product from cache:', error);
      return null;
    }
  },

  async setProduct(id: string, data: any, ttl: number = 3600) {
    try {
      await cacheRedis.setex(`product:${id}`, ttl, JSON.stringify(data));
    } catch (error) {
      logger.error('Error setting product in cache:', error);
    }
  },

  // Cache de preços
  async getPrice(variantId: string) {
    try {
      const cached = await cacheRedis.get(`price:${variantId}`);
      return cached ? parseFloat(cached) : null;
    } catch (error) {
      logger.error('Error getting price from cache:', error);
      return null;
    }
  },

  async setPrice(variantId: string, price: number, ttl: number = 1800) {
    try {
      await cacheRedis.setex(`price:${variantId}`, ttl, price.toString());
    } catch (error) {
      logger.error('Error setting price in cache:', error);
    }
  },

  // Cache de frete
  async getShipping(origin: string, destination: string, weight: number) {
    try {
      const key = `shipping:${origin}:${destination}:${weight}`;
      const cached = await cacheRedis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting shipping from cache:', error);
      return null;
    }
  },

  async setShipping(origin: string, destination: string, weight: number, data: any, ttl: number = 3600) {
    try {
      const key = `shipping:${origin}:${destination}:${weight}`;
      await cacheRedis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      logger.error('Error setting shipping in cache:', error);
    }
  },

  // Cache de sessão
  async getSession(sessionId: string) {
    try {
      const cached = await cacheRedis.get(`session:${sessionId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      logger.error('Error getting session from cache:', error);
      return null;
    }
  },

  async setSession(sessionId: string, data: any, ttl: number = 86400) {
    try {
      await cacheRedis.setex(`session:${sessionId}`, ttl, JSON.stringify(data));
    } catch (error) {
      logger.error('Error setting session in cache:', error);
    }
  },

  // Invalidar cache
  async invalidate(pattern: string) {
    try {
      const keys = await cacheRedis.keys(pattern);
      if (keys.length > 0) {
        await cacheRedis.del(...keys);
        logger.info(`Invalidated ${keys.length} cache keys with pattern: ${pattern}`);
      }
    } catch (error) {
      logger.error('Error invalidating cache:', error);
    }
  },

  // Limpar todo o cache
  async clear() {
    try {
      await cacheRedis.flushdb();
      logger.info('Cache cleared successfully');
    } catch (error) {
      logger.error('Error clearing cache:', error);
    }
  }
};

// Health check
export async function checkRedisHealth() {
  try {
    await redis.ping();
    await cacheRedis.ping();
    return { status: 'healthy', redis: 'connected', cache: 'connected' };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export { redis as default };
