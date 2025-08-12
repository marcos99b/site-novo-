import { logger } from './logger';

// Interface para erros
interface ErrorLog {
  id: string;
  timestamp: Date;
  type: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: any;
  url?: string;
  userAgent?: string;
  ip?: string;
}

// Interface para métricas
interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

// Sistema de monitoramento em tempo real
class RealTimeMonitoring {
  private errors: ErrorLog[] = [];
  private metrics: Metric[] = [];
  private maxLogs = 1000; // Manter apenas os últimos 1000 logs
  private listeners: ((data: any) => void)[] = [];

  // Adicionar erro
  logError(error: Error | string, context?: any) {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'error',
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
    };

    this.errors.unshift(errorLog);
    this.trimLogs();
    this.notifyListeners({ type: 'error', data: errorLog });
    
    // Log estruturado
    logger.error({
      eventType: 'monitoring_error',
      ...errorLog
    });
  }

  // Adicionar warning
  logWarning(message: string, context?: any) {
    const warningLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'warning',
      message,
      context,
    };

    this.errors.unshift(warningLog);
    this.trimLogs();
    this.notifyListeners({ type: 'warning', data: warningLog });
    
    logger.warn({
      eventType: 'monitoring_warning',
      ...warningLog
    });
  }

  // Adicionar métrica
  addMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: Metric = {
      name,
      value,
      timestamp: new Date(),
      tags,
    };

    this.metrics.unshift(metric);
    this.trimMetrics();
    this.notifyListeners({ type: 'metric', data: metric });
    
    logger.info({
      eventType: 'monitoring_metric',
      ...metric
    });
  }

  // Monitorar performance de API
  monitorApiCall(url: string, method: string, duration: number, statusCode: number) {
    this.addMetric('api_call_duration', duration, { url, method, status: statusCode.toString() });
    this.addMetric('api_call_count', 1, { url, method, status: statusCode.toString() });
    
    if (statusCode >= 400) {
      this.logWarning(`API call failed: ${method} ${url} - ${statusCode}`, { duration, statusCode });
    }
  }

  // Monitorar erros de banco de dados
  monitorDatabaseError(error: Error, operation: string, table?: string) {
    this.logError(error, { operation, table });
    this.addMetric('database_error_count', 1, { operation, table: table || '' });
  }

  // Monitorar erros de integração
  monitorIntegrationError(provider: string, operation: string, error: Error) {
    this.logError(error, { provider, operation });
    this.addMetric('integration_error_count', 1, { provider, operation });
  }

  // Monitorar performance de página
  monitorPageLoad(url: string, duration: number) {
    this.addMetric('page_load_duration', duration, { url });
  }

  // Monitorar uso de recursos
  monitorResourceUsage() {
    const usage = process.memoryUsage();
    this.addMetric('memory_usage', usage.heapUsed / 1024 / 1024, { type: 'heap_used' });
    this.addMetric('memory_usage', usage.heapTotal / 1024 / 1024, { type: 'heap_total' });
    this.addMetric('memory_usage', usage.rss / 1024 / 1024, { type: 'rss' });
  }

  // Obter logs de erro
  getErrors(limit: number = 50): ErrorLog[] {
    return this.errors.slice(0, limit);
  }

  // Obter métricas
  getMetrics(name?: string, limit: number = 100): Metric[] {
    let metrics = this.metrics;
    if (name) {
      metrics = metrics.filter(m => m.name === name);
    }
    return metrics.slice(0, limit);
  }

  // Obter estatísticas
  getStats() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const errorsLastHour = this.errors.filter(e => e.timestamp > lastHour);
    const errorsLast24h = this.errors.filter(e => e.timestamp > last24h);

    return {
      totalErrors: this.errors.length,
      errorsLastHour: errorsLastHour.length,
      errorsLast24h: errorsLast24h.length,
      errorRate: errorsLastHour.length / 60, // erros por minuto
      totalMetrics: this.metrics.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    };
  }

  // Limpar logs antigos
  private trimLogs() {
    if (this.errors.length > this.maxLogs) {
      this.errors = this.errors.slice(0, this.maxLogs);
    }
  }

  private trimMetrics() {
    if (this.metrics.length > this.maxLogs) {
      this.metrics = this.metrics.slice(0, this.maxLogs);
    }
  }

  // Gerar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Sistema de listeners para tempo real
  addListener(callback: (data: any) => void) {
    this.listeners.push(callback);
  }

  removeListener(callback: (data: any) => void) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(data: any) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in monitoring listener:', error);
      }
    });
  }

  // Health check
  getHealth() {
    const stats = this.getStats();
    const errorRate = stats.errorRate;
    
    if (errorRate > 10) {
      return { status: 'critical', errorRate, message: 'High error rate detected' };
    } else if (errorRate > 5) {
      return { status: 'warning', errorRate, message: 'Elevated error rate' };
    } else {
      return { status: 'healthy', errorRate, message: 'System operating normally' };
    }
  }
}

// Instância global
export const monitoring = new RealTimeMonitoring();

// Middleware para monitorar requisições
export function monitoringMiddleware(req: any, res: any, next: any) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    monitoring.monitorApiCall(req.url, req.method, duration, res.statusCode);
  });
  
  next();
}

// Função para monitorar erros automaticamente
export function setupErrorMonitoring() {
  // Monitorar erros não capturados
  process.on('uncaughtException', (error) => {
    monitoring.logError(error, { type: 'uncaught_exception' });
  });

  process.on('unhandledRejection', (reason, promise) => {
    monitoring.logError(new Error(`Unhandled Rejection: ${reason}`), { 
      type: 'unhandled_rejection',
      promise: promise.toString()
    });
  });

  // Monitorar uso de recursos periodicamente
  setInterval(() => {
    monitoring.monitorResourceUsage();
  }, 30000); // A cada 30 segundos

  logger.info('Error monitoring setup completed');
}

export default monitoring;
