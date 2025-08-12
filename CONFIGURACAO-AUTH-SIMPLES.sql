-- ===== CONFIGURAÇÃO SIMPLES DE AUTENTICAÇÃO =====
-- Execute este SQL no dashboard do Supabase: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql

-- 1. Confirmar todos os usuários existentes
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- 2. Verificar quantos usuários foram confirmados
SELECT 
  'Usuários confirmados' as status,
  COUNT(*) as total
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

-- 3. Verificar configurações de autenticação
SELECT 
  'Configuração de Autenticação' as tipo,
  email_confirm as email_confirmacao,
  enable_signup as signup_habilitado,
  site_url as url_site
FROM auth.config 
WHERE id = 1;

-- 4. Se a tabela auth.config não existir, execute apenas os comandos 1 e 2
-- A configuração será feita manualmente no dashboard

-- ===== CONFIGURAÇÃO MANUAL NO DASHBOARD =====
-- 1. Acesse: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/auth/settings
-- 2. Desative "Enable email confirmations"
-- 3. Ative "Enable sign up"
-- 4. Configure "Site URL" como: http://localhost:3000
-- 5. Salve as configurações

-- ===== TESTE APÓS CONFIGURAÇÃO =====
-- Após executar este SQL e configurar manualmente:
-- 1. Acesse: http://localhost:3000/login
-- 2. Crie uma conta
-- 3. Verifique se fica logado automaticamente
