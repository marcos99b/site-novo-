import { supabase } from './supabase';

// Tipos de eventos que podemos rastrear
export type TrackingEventType = 
  | 'page_view'
  | 'button_click'
  | 'form_submit'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'login_attempt'
  | 'signup_attempt'
  | 'search'
  | 'filter'
  | 'scroll'
  | 'error'
  | 'navigation'
  | 'time_spent'
  | 'mouse_movement'
  | 'keyboard_input'
  | 'cart_opened'
  | 'checkout_started';

export interface TrackingEvent {
  id?: string;
  session_id: string;
  user_id?: string;
  event_type: TrackingEventType;
  event_data: any;
  page_url: string;
  timestamp: Date;
  user_agent: string;
  ip_address?: string;
  referrer?: string;
  duration?: number; // em segundos
  element_id?: string;
  element_class?: string;
  element_text?: string;
  coordinates?: { x: number; y: number };
  screen_size?: { width: number; height: number };
}

// Classe principal de tracking
export class UserTracker {
  private sessionId: string;
  private userId?: string;
  private startTime: Date;
  private lastActivity: Date;
  private isTracking: boolean = false;
  private eventQueue: TrackingEvent[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 5000; // 5 segundos
  private flushTimer?: NodeJS.Timeout;
  private currentUrl?: string;
  private pageStartTimeMs: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = new Date();
    this.lastActivity = new Date();
    this.initTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initTracking() {
    // Inicializar tracking apenas uma vez
    if (this.isTracking) return;
    this.isTracking = true;

    // Configurar flush automático
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);

    // Rastrear quando o usuário sai da página
    window.addEventListener('beforeunload', () => {
      this.trackTimeSpentForCurrentRoute();
      this.flushEvents();
    });

    if (typeof window !== 'undefined') {
      // Inicial
      this.currentUrl = window.location.pathname;
      this.pageStartTimeMs = Date.now();
      // Page View inicial
      this.trackPageView(this.currentUrl);

      // Helper para mudança de rota SPA
      const handleRouteChange = () => {
        const newUrl = window.location.pathname;
        if (newUrl === this.currentUrl) return;
        // Registra tempo na rota anterior
        this.trackTimeSpentForCurrentRoute();
        // Page view da nova rota
        this.trackPageView(newUrl);
        // Reset estado
        this.currentUrl = newUrl;
        this.pageStartTimeMs = Date.now();
      };

      // Monkey-patch pushState/replaceState
      const origPush = history.pushState;
      const origReplace = history.replaceState;
      history.pushState = ((...args: Parameters<History['pushState']>) => {
        const ret = origPush.apply(history, args as unknown as any);
        try { handleRouteChange(); } catch {}
        return ret;
      }) as typeof history.pushState;
      history.replaceState = ((...args: Parameters<History['replaceState']>) => {
        const ret = origReplace.apply(history, args as unknown as any);
        try { handleRouteChange(); } catch {}
        return ret;
      }) as typeof history.replaceState;
      window.addEventListener('popstate', () => {
        try { handleRouteChange(); } catch {}
      });

      // Fallback por MutationObserver (trocas via Next transitions)
      const observer = new MutationObserver(() => {
        try { handleRouteChange(); } catch {}
      });
      observer.observe(document.body, { childList: true, subtree: true });

      // Visibilidade: ao ocultar, registra tempo até agora
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.trackTimeSpentForCurrentRoute();
        } else if (document.visibilityState === 'visible') {
          this.pageStartTimeMs = Date.now();
        }
      });
    }
  }

  // Rastrear visualização de página
  public trackPageView(url?: string): void {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const params = new URLSearchParams(search || '');
    const utm_source = params.get('utm_source') || undefined;
    const utm_medium = params.get('utm_medium') || undefined;
    const utm_campaign = params.get('utm_campaign') || undefined;
    const utm_term = params.get('utm_term') || undefined;
    const utm_content = params.get('utm_content') || undefined;
    const pathname = typeof window !== 'undefined' ? window.location.pathname : (url || '/');
    const href = typeof window !== 'undefined' ? window.location.href : url;
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'page_view',
      event_data: {
        page_title: typeof document !== 'undefined' ? document.title : undefined,
        page_url: href,
        referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content
      },
      page_url: pathname,
      timestamp: new Date(),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      referrer: typeof document !== 'undefined' ? document.referrer : undefined
    };

    this.addEvent(event);
  }

  // Rastrear clique em botão
  public trackButtonClick(
    elementId: string,
    elementText: string,
    elementClass?: string,
    coordinates?: { x: number; y: number }
  ): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'button_click',
      event_data: {
        button_id: elementId,
        button_text: elementText,
        button_class: elementClass
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent,
      element_id: elementId,
      element_class: elementClass,
      element_text: elementText,
      coordinates,
      screen_size: {
        width: window.screen.width,
        height: window.screen.height
      }
    };

    this.addEvent(event);
  }

  // Rastrear envio de formulário
  public trackFormSubmit(
    formId: string,
    formData: any,
    success: boolean = true
  ): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'form_submit',
      event_data: {
        form_id: formId,
        form_data: formData,
        success
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent,
      element_id: formId
    };

    this.addEvent(event);
  }

  // Rastrear visualização de produto
  public trackProductView(productId: string, productName: string): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'product_view',
      event_data: {
        product_id: productId,
        product_name: productName
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear adição ao carrinho
  public trackAddToCart(productId: string, productName: string, quantity: number): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'add_to_cart',
      event_data: {
        product_id: productId,
        product_name: productName,
        quantity
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear carrinho aberto
  public trackCartOpened(itemCount: number, totalAmount: number): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'cart_opened',
      event_data: {
        item_count: itemCount,
        total_amount: totalAmount
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear início do checkout
  public trackCheckoutStarted(items: Array<{ id: string | number; name: string; price: number; quantity: number }>, totalAmount: number): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'checkout_started',
      event_data: {
        items,
        total_amount: totalAmount,
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear remoção do carrinho
  public trackRemoveFromCart(productId: string, productName: string): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'remove_from_cart',
      event_data: {
        product_id: productId,
        product_name: productName
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear tentativa de login
  public trackLoginAttempt(email: string, success: boolean, provider?: string): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'login_attempt',
      event_data: {
        email,
        success,
        provider
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear tentativa de cadastro
  public trackSignupAttempt(email: string, success: boolean, provider?: string): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'signup_attempt',
      event_data: {
        email,
        success,
        provider
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear busca
  public trackSearch(query: string, results: number): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'search',
      event_data: {
        query,
        results_count: results
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear erro
  public trackError(error: string, errorType: string, stack?: string): void {
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'error',
      event_data: {
        error_message: error,
        error_type: errorType,
        stack_trace: stack
      },
      page_url: window.location.href,
      timestamp: new Date(),
      user_agent: navigator.userAgent
    };

    this.addEvent(event);
  }

  // Rastrear tempo gasto na página
  private trackTimeSpentForCurrentRoute(): void {
    const now = Date.now();
    const duration = Math.max(0, Math.floor((now - this.pageStartTimeMs) / 1000));
    const pageUrl = this.currentUrl || (typeof window !== 'undefined' ? window.location.pathname : '');
    if (duration <= 0) return;
    const event: TrackingEvent = {
      session_id: this.sessionId,
      user_id: this.userId,
      event_type: 'time_spent',
      event_data: {
        duration_seconds: duration,
        page_url: pageUrl
      },
      page_url: pageUrl,
      timestamp: new Date(),
      user_agent: navigator.userAgent,
      duration
    };
    this.addEvent(event);
  }

  // Adicionar evento à fila
  private addEvent(event: TrackingEvent): void {
    this.eventQueue.push(event);
    this.lastActivity = new Date();

    // Flush se atingiu o tamanho do batch
    if (this.eventQueue.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  // Enviar eventos para o servidor
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase
        .from('user_events')
        .insert(eventsToSend);

      if (error) {
        console.error('Erro ao enviar eventos de tracking:', error);
        // Recolocar eventos na fila em caso de erro
        this.eventQueue.unshift(...eventsToSend);
      } else {
        console.log(`✅ ${eventsToSend.length} eventos de tracking enviados`);
        // Atualizar agregador por rota para eventos de tempo
        for (const ev of eventsToSend) {
          if (ev.event_type === 'time_spent') {
            try {
              const seconds = Number((ev.event_data as any)?.duration_seconds || ev.duration || 0);
              if (seconds > 0) {
                await supabase.rpc('upsert_user_route_duration', {
                  p_session_id: ev.session_id,
                  p_user_id: ev.user_id || null,
                  p_page_url: ev.page_url || (typeof window !== 'undefined' ? window.location.pathname : ''),
                  p_seconds: seconds
                });
              }
            } catch (e) {
              console.warn('Falha ao atualizar user_route_durations:', (e as any)?.message || e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao enviar eventos de tracking:', error);
      // Recolocar eventos na fila em caso de erro
      this.eventQueue.unshift(...eventsToSend);
    }
  }

  // Definir ID do usuário (quando fizer login)
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  // Obter estatísticas da sessão
  public getSessionStats(): any {
    return {
      session_id: this.sessionId,
      user_id: this.userId,
      start_time: this.startTime,
      last_activity: this.lastActivity,
      events_in_queue: this.eventQueue.length,
      total_duration: Math.floor((Date.now() - this.startTime.getTime()) / 1000)
    };
  }

  // Parar tracking
  public stop(): void {
    this.isTracking = false;
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents();
  }
}

// Instância global do tracker
let globalTracker: UserTracker | null = null;

// Função para obter ou criar o tracker
export function getTracker(): UserTracker {
  if (!globalTracker) {
    globalTracker = new UserTracker();
  }
  return globalTracker;
}

// Função para inicializar tracking automático
export function initAutoTracking(): void {
  const tracker = getTracker();

  // Rastrear cliques em botões automaticamente
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.closest('button')) {
      const button = target.tagName === 'BUTTON' ? target : target.closest('button') as HTMLButtonElement;
      tracker.trackButtonClick(
        button.id || 'unknown',
        button.textContent?.trim() || 'unknown',
        button.className,
        { x: e.clientX, y: e.clientY }
      );
    }
  });

  // Rastrear envios de formulário automaticamente
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const formObject: any = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    tracker.trackFormSubmit(form.id || 'unknown', formObject);
  });

  // Rastrear erros automaticamente
  window.addEventListener('error', (e) => {
    tracker.trackError(e.message, 'javascript_error', e.error?.stack);
  });

  // Rastrear visualização de página inicial
  tracker.trackPageView();
}
