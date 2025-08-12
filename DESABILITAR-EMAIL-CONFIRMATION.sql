-- ===== DESABILITAR CONFIRMAÇÃO DE EMAIL =====
-- Execute este SQL no Supabase Dashboard: https://supabase.com/dashboard/project/vqpumetbhgqdpnskgbvr/sql

-- ===== 1. DESABILITAR EMAIL CONFIRMATIONS =====

UPDATE auth.config 
SET value = 'false' 
WHERE key = 'enable_email_confirmations';

-- ===== 2. HABILITAR SIGNUPS =====

UPDATE auth.config 
SET value = 'true' 
WHERE key = 'enable_signup';

-- ===== 3. CONFIGURAR SITE URL =====

UPDATE auth.config 
SET value = 'http://localhost:3000' 
WHERE key = 'site_url';

-- ===== 4. CONFIGURAR REDIRECT URLS =====

UPDATE auth.config 
SET value = 'http://localhost:3000/auth/callback,http://localhost:3000' 
WHERE key = 'redirect_urls';

-- ===== 5. VERIFICAR CONFIGURAÇÕES =====

SELECT 
  key,
  value
FROM auth.config 
WHERE key IN ('enable_email_confirmations', 'enable_signup', 'site_url', 'redirect_urls')
ORDER BY key;

-- ===== 6. TESTAR USUÁRIO SEM CONFIRMAÇÃO =====

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
  'teste-sem-confirmacao@techgear.com',
  crypt('Test123456!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  '',
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Usuário Sem Confirmação", "full_name": "Usuário Sem Confirmação"}'
);

-- ===== 7. VERIFICAR SE USUÁRIO FOI CRIADO =====

SELECT 
  'Usuário criado sem confirmação' as status,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'teste-sem-confirmacao@techgear.com';

-- ===== 8. LIMPAR USUÁRIO DE TESTE =====

DELETE FROM auth.users WHERE email = 'teste-sem-confirmacao@techgear.com';

-- ===== 9. CONFIRMAÇÃO =====
-- ✅ Email confirmations desabilitado
-- ✅ Signups habilitados
-- ✅ Site URL configurado
-- ✅ Redirect URLs configurados
-- ✅ Usuários serão logados automaticamente
-- ✅ Não precisará mais confirmar email
