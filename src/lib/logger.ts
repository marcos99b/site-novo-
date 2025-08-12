import pino from 'pino';

// Em ambientes serverless/edge, o transporte do pino (thread-stream) pode quebrar o build do Next
// para evitar o erro "Cannot find module .../vendor-chunks/lib/worker.js" removemos o transport.
// Ative pretty logs apenas se explicitamente solicitado via PINO_PRETTY=1.
const isBrowser = typeof window !== 'undefined';
const usePretty = process.env.PINO_PRETTY === '1' && !isBrowser && process.env.NEXT_RUNTIME !== 'edge';

const loggerConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  base: {
    env: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  },
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label: string) => ({ level: label }),
    log: (object: any) => object
  },
  // transport só é configurado quando explicitamente habilitado
  ...(usePretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' }
        }
      }
    : {})
};

// Criar logger principal (sem transport por padrão — seguro para Next/Edge)
export const logger = pino(loggerConfig);

// Loggers específicos
export const apiLogger = logger.child({ module: 'api' });
export const queueLogger = logger.child({ module: 'queue' });
export const cjLogger = logger.child({ module: 'cj' });
export const dbLogger = logger.child({ module: 'database' });
export const cacheLogger = logger.child({ module: 'cache' });

// Funções de logging estruturado
export const log = {
  // Log de requisições HTTP
  request: (req: any, res: any, duration: number) => {
    apiLogger.info({
      type: 'http_request',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  },

  // Log de erros
  error: (error: Error, context?: any) => {
    logger.error({
      type: 'error',
      message: error.message,
      stack: error.stack,
      context
    });
  },

  // Log de performance
  performance: (operation: string, duration: number, metadata?: any) => {
    logger.info({
      type: 'performance',
      operation,
      duration,
      metadata
    });
  },

  // Log de negócio
  business: (event: string, data: any) => {
    logger.info({
      type: 'business',
      event,
      data
    });
  },

  // Log de segurança
  security: (event: string, data: any) => {
    logger.warn({
      type: 'security',
      event,
      data
    });
  },

  // Log de integração
  integration: (provider: string, operation: string, data: any) => {
    logger.info({
      type: 'integration',
      provider,
      operation,
      data
    });
  }
};

// Middleware para logging de requisições
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    log.request(req, res, duration);
  });
  
  next();
};

// Função para criar contexto de transação
export const createTransactionContext = (transactionId: string) => {
  return logger.child({ transactionId });
};

// Função para logging de métricas
export const metrics = {
  increment: (metric: string, value: number = 1, tags?: Record<string, string>) => {
    logger.info({
      type: 'metric',
      metric,
      value,
      tags
    });
  },

  gauge: (metric: string, value: number, tags?: Record<string, string>) => {
    logger.info({
      type: 'gauge',
      metric,
      value,
      tags
    });
  },

  timing: (metric: string, duration: number, tags?: Record<string, string>) => {
    logger.info({
      type: 'timing',
      metric,
      duration,
      tags
    });
  }
};

// Função para logging de auditoria
export const audit = {
  userAction: (userId: string, action: string, resource: string, details?: any) => {
    logger.info({
      type: 'audit',
      category: 'user_action',
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  },

  systemAction: (action: string, resource: string, details?: any) => {
    logger.info({
      type: 'audit',
      category: 'system_action',
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  },

  dataAccess: (userId: string, operation: string, table: string, recordId?: string) => {
    logger.info({
      type: 'audit',
      category: 'data_access',
      userId,
      operation,
      table,
      recordId,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger;
