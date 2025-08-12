-- ===== CRIAR USUÁRIO MANUALMENTE =====
-- Execute este SQL UMA VEZ no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. CRIAR USUÁRIO TESTE =====

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
  'teste@techgear.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuário Teste", "full_name": "Usuário Teste"}'
);

-- ===== 2. VERIFICAR SE FOI CRIADO =====

SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users 
WHERE email = 'teste@techgear.com';

-- ===== 3. CRIAR LEAD AUTOMATICAMENTE =====

INSERT INTO public.leads (user_id, email, name, source, status)
SELECT 
  id,
  email,
  raw_user_meta_data->>'name',
  'manual',
  'new'
FROM auth.users 
WHERE email = 'teste@techgear.com';

-- ===== 4. CRIAR CUSTOMER AUTOMATICAMENTE =====

INSERT INTO public.customers (user_id, email, name, total_orders, total_spent, status)
SELECT 
  id,
  email,
  raw_user_meta_data->>'name',
  0,
  0,
  'active'
FROM auth.users 
WHERE email = 'teste@techgear.com';

-- ===== 5. VERIFICAR TUDO =====

SELECT 
  'Usuário criado' as status,
  u.email,
  u.id,
  l.id as lead_id,
  c.id as customer_id
FROM auth.users u
LEFT JOIN public.leads l ON l.user_id = u.id
LEFT JOIN public.customers c ON c.user_id = u.id
WHERE u.email = 'teste@techgear.com';

-- ===== 6. CREDENCIAIS DE TESTE =====
-- Email: teste@techgear.com
-- Senha: Test123456!
-- 
-- ✅ Usuário criado manualmente
-- ✅ Lead criado automaticamente  
-- ✅ Customer criado automaticamente
-- ✅ Pronto para teste no site
