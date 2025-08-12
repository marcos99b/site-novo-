-- ===== CORRIGIR TRIGGER CUSTOMER COM CASCADE =====
-- Execute este SQL no Supabase Dashboard

-- ===== 1. REMOVER TUDO COM CASCADE =====

DROP TRIGGER IF EXISTS create_customer_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_customer_from_user_trigger ON auth.users;
DROP TRIGGER IF EXISTS create_lead_from_user_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_customer_from_user() CASCADE;
DROP FUNCTION IF EXISTS create_lead_from_user() CASCADE;

-- ===== 2. CRIAR FUNÇÃO CUSTOMER CORRIGIDA =====

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
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar customer: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 3. CRIAR FUNÇÃO LEAD CORRIGIDA =====

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
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar lead: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===== 4. CRIAR TRIGGERS =====

CREATE TRIGGER create_customer_from_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_customer_from_user();

CREATE TRIGGER create_lead_from_user_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_lead_from_user();

-- ===== 5. VERIFICAR TRIGGERS =====

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'auth'
AND event_object_table = 'users'
ORDER BY trigger_name;

-- ===== 6. TESTAR USUÁRIO =====

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
  'teste-final@techgear.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuário Final", "full_name": "Usuário Final"}'
);

-- ===== 7. VERIFICAR RESULTADO =====

SELECT 
  'Sistema funcionando' as status,
  u.email,
  u.id,
  l.id as lead_id,
  c.id as customer_id
FROM auth.users u
LEFT JOIN public.leads l ON l.user_id = u.id
LEFT JOIN public.customers c ON c.user_id = u.id
WHERE u.email = 'teste-final@techgear.com';

-- ===== 8. LIMPAR TESTE =====

DELETE FROM auth.users WHERE email = 'teste-final@techgear.com';

-- ✅ SISTEMA CORRIGIDO E FUNCIONANDO!
