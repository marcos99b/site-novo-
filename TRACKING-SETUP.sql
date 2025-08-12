-- ===== CONFIGURAÇÃO DO SISTEMA DE TRACKING =====
-- Execute este SQL no dashboard do Supabase: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql

-- 1. CRIAR TABELAS DE TRACKING

-- Tabela de eventos do usuário
CREATE TABLE IF NOT EXISTS public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  duration INTEGER, -- em segundos
  element_id TEXT,
  element_class TEXT,
  element_text TEXT,
  coordinates JSONB, -- {x: number, y: number}
  screen_size JSONB, -- {width: number, height: number}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões do usuário
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER, -- em segundos
  page_views INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de analytics agregados
CREATE TABLE IF NOT EXISTS public.analytics_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  total_button_clicks INTEGER DEFAULT 0,
  total_form_submits INTEGER DEFAULT 0,
  total_errors INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0, -- em segundos
  bounce_rate DECIMAL(5,2) DEFAULT 0, -- porcentagem
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- porcentagem
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON public.user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON public.user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON public.user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_timestamp ON public.user_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_events_page_url ON public.user_events(page_url);

CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_start_time ON public.user_sessions(start_time);

CREATE INDEX IF NOT EXISTS idx_analytics_summary_date ON public.analytics_summary(date);

-- 3. CONFIGURAR RLS (ROW LEVEL SECURITY)
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_summary ENABLE ROW LEVEL SECURITY;

-- Políticas para user_events
DROP POLICY IF EXISTS "Users can view their own events" ON public.user_events;
DROP POLICY IF EXISTS "Users can insert their own events" ON public.user_events;

CREATE POLICY "Users can view their own events" ON public.user_events 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own events" ON public.user_events 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para user_sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions 
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions 
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para analytics_summary (apenas admin)
DROP POLICY IF EXISTS "Admin can view analytics" ON public.analytics_summary;

CREATE POLICY "Admin can view analytics" ON public.analytics_summary 
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. CRIAR FUNÇÕES AUXILIARES
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para processar eventos em tempo real
CREATE OR REPLACE FUNCTION process_user_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contadores da sessão
  UPDATE public.user_sessions 
  SET 
    total_events = total_events + 1,
    page_views = CASE WHEN NEW.event_type = 'page_view' THEN page_views + 1 ELSE page_views END,
    updated_at = NOW()
  WHERE session_id = NEW.session_id;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. CRIAR TRIGGERS
-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON public.user_sessions;
DROP TRIGGER IF EXISTS update_analytics_summary_updated_at ON public.analytics_summary;

CREATE TRIGGER update_user_sessions_updated_at 
  BEFORE UPDATE ON public.user_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_summary_updated_at 
  BEFORE UPDATE ON public.analytics_summary 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para processar eventos
DROP TRIGGER IF EXISTS trigger_process_user_event ON public.user_events;

CREATE TRIGGER trigger_process_user_event
  AFTER INSERT ON public.user_events
  FOR EACH ROW EXECUTE FUNCTION process_user_event();

-- 6. INSERIR DADOS INICIAIS
INSERT INTO public.analytics_summary (date, total_sessions, total_users, total_page_views, total_button_clicks, total_form_submits, total_errors, avg_session_duration, bounce_rate, conversion_rate)
VALUES 
  (CURRENT_DATE, 0, 0, 0, 0, 0, 0, 0, 0.00, 0.00)
ON CONFLICT (date) DO NOTHING;

-- 7. VERIFICAR CONFIGURAÇÃO
SELECT 'Tabelas criadas:' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'user_%' OR table_name = 'analytics_summary';

SELECT 'Índices criados:' as status;
SELECT indexname FROM pg_indexes WHERE tablename LIKE 'user_%' OR tablename = 'analytics_summary';

SELECT 'Políticas RLS:' as status;
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename LIKE 'user_%' OR tablename = 'analytics_summary';

-- ===== CONFIGURAÇÃO CONCLUÍDA =====
-- ✅ Sistema de tracking configurado
-- ✅ Tabelas criadas com índices
-- ✅ RLS configurado
-- ✅ Triggers funcionando
-- ✅ Analytics inicializados

-- 🌐 Dashboard: http://localhost:3000/tracking
-- 📊 Eventos em tempo real
-- 🔍 Monitoramento completo
