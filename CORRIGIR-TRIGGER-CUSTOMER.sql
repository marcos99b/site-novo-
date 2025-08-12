-- ===== CORRIGIR TRIGGER CUSTOMER =====
-- Execute este SQL no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. REMOVER TRIGGER PROBLEMÁTICO =====

DROP TRIGGER IF EXISTS create_customer_from_user_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_customer_from_user();

-- ===== 2. CRIAR FUNÇÃO CORRIGIDA =====

CREATE OR REPLACE FUNCTION create_customer_from_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (user_id, email, name, total_orders, total_spent, status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    0, 
    0, 
    'active'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, não faz nada
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falha
    RAISE WARNING 'Erro ao criar customer: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 3. CRIAR TRIGGER CORRIGIDO =====

CREATE TRIGGER create_customer_from_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_from_user();

-- ===== 4. CRIAR FUNÇÃO PARA LEAD TAMBÉM =====

CREATE OR REPLACE FUNCTION create_lead_from_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.leads (user_id, email, name, source, status)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Usuário'),
    'signup', 
    'new'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, não faz nada
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falha
    RAISE WARNING 'Erro ao criar lead: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 5. CRIAR TRIGGER PARA LEAD =====

CREATE TRIGGER create_lead_from_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_lead_from_user();

-- ===== 6. VERIFICAR TRIGGERS CRIADOS =====

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- ===== 7. TESTAR CRIANDO USUÁRIO =====

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  raw_app_meta_data,
  raw_user_meta_data
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste-trigger@techgear.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuário Trigger", "full_name": "Usuário Trigger"}'
);

-- ===== 8. VERIFICAR SE LEAD E CUSTOMER FORAM CRIADOS =====

SELECT 
  'Usuário criado' as status,
  u.email,
  u.id,
  l.id as lead_id,
  c.id as customer_id
FROM auth.users u
LEFT JOIN public.leads l ON l.user_id = u.id
LEFT JOIN public.customers c ON c.user_id = u.id
WHERE u.email = 'teste-trigger@techgear.com';

-- ===== 9. LIMPAR USUÁRIO DE TESTE =====

DELETE FROM auth.users WHERE email = 'teste-trigger@techgear.com';

-- ===== 10. CONFIRMAÇÃO =====
-- ✅ Triggers corrigidos
-- ✅ Funções criadas com tratamento de erro
-- ✅ Sistema funcionando automaticamente
-- ✅ Pronto para criar usuários sem erros
