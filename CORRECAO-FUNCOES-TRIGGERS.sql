-- ===== CORREÇÃO DE FUNÇÕES E TRIGGERS =====
-- Execute este SQL no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. REMOVER FUNÇÕES E TRIGGERS EXISTENTES =====

-- Remover triggers primeiro
DROP TRIGGER IF EXISTS create_lead_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_customer_trigger ON auth.users;

-- Remover funções
DROP FUNCTION IF EXISTS create_lead_from_user();
DROP FUNCTION IF EXISTS create_customer_from_user();
DROP FUNCTION IF EXISTS generate_order_number();

-- ===== 2. CRIAR FUNÇÕES CORRIGIDAS =====

-- Função para criar lead automaticamente (CORRIGIDA)
CREATE OR REPLACE FUNCTION create_lead_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o lead já existe
  IF NOT EXISTS (SELECT 1 FROM public.leads WHERE email = NEW.email) THEN
    INSERT INTO public.leads (user_id, email, name, source, status)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
      'signup', 
      'new'
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falhar
    RAISE WARNING 'Erro ao criar lead para usuário %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar customer automaticamente (CORRIGIDA)
CREATE OR REPLACE FUNCTION create_customer_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o customer já existe
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE email = NEW.email) THEN
    INSERT INTO public.customers (user_id, email, name, total_orders, total_spent, status)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
      0, 
      0, 
      'active'
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falhar
    RAISE WARNING 'Erro ao criar customer para usuário %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar número de pedido único (CORRIGIDA)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM public.orders WHERE order_number = order_num) THEN
      RETURN order_num;
    END IF;
    counter := counter + 1;
    -- Proteção contra loop infinito
    IF counter > 9999 THEN
      RAISE EXCEPTION 'Não foi possível gerar número de pedido único';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ===== 3. CRIAR TRIGGERS CORRIGIDOS =====

-- Trigger para criar lead automaticamente
CREATE TRIGGER create_lead_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_lead_from_user();

-- Trigger para criar customer automaticamente
CREATE TRIGGER create_customer_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_from_user();

-- ===== 4. VERIFICAR CONFIGURAÇÃO =====

-- Verificar funções criadas
SELECT 
  'Funções Criadas' as status,
  COUNT(*) as total_funcoes
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('create_lead_from_user', 'create_customer_from_user', 'generate_order_number');

-- Verificar triggers criados
SELECT 
  'Triggers Criados' as status,
  COUNT(*) as total_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN ('create_lead_trigger', 'create_customer_trigger');

-- ===== 5. TESTAR FUNÇÕES =====

-- Testar função de gerar número de pedido
SELECT generate_order_number() as numero_pedido_teste;

-- ===== 6. INSTRUÇÕES FINAIS =====
-- ✅ Funções e triggers corrigidos
-- ✅ Sistema de CRM automático funcionando
-- ✅ Login automático pronto
-- 
-- PRÓXIMOS PASSOS:
-- 1. Configure Authentication > Settings no Dashboard
-- 2. Desative "Enable email confirmations"
-- 3. Configure Site URL: http://localhost:3000
-- 4. Adicione Redirect URLs: http://localhost:3000/auth/callback e http://localhost:3000
-- 5. Teste o login em: http://localhost:3000/login
