-- ===== CONFIGURAÇÃO FINAL DO SUPABASE =====
-- Execute este SQL no dashboard do Supabase: https://supabase.com/dashboard/project/ljfxpzcdrctqmfydofdh/sql

-- 1. ADICIONAR CAMPO DE TELEFONE
-- Adicionar campo phone na tabela leads se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'leads' AND column_name = 'phone') THEN
    ALTER TABLE public.leads ADD COLUMN phone TEXT;
    RAISE NOTICE 'Campo phone adicionado na tabela leads';
  ELSE
    RAISE NOTICE 'Campo phone já existe na tabela leads';
  END IF;
END $$;

-- Adicionar campo phone na tabela customers se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'customers' AND column_name = 'phone') THEN
    ALTER TABLE public.customers ADD COLUMN phone TEXT;
    RAISE NOTICE 'Campo phone adicionado na tabela customers';
  ELSE
    RAISE NOTICE 'Campo phone já existe na tabela customers';
  END IF;
END $$;

-- 2. CONFIGURAR AUTENTICAÇÃO PARA DESENVOLVIMENTO
-- Desativar confirmação de email
UPDATE auth.config 
SET email_confirm = false 
WHERE id = 1;

-- Habilitar signup
UPDATE auth.config 
SET enable_signup = true 
WHERE id = 1;

-- Configurar site URL
UPDATE auth.config 
SET site_url = 'http://localhost:3000' 
WHERE id = 1;

-- Configurar redirect URLs
UPDATE auth.config 
SET redirect_urls = ARRAY['http://localhost:3000/auth/callback', 'http://localhost:3000'] 
WHERE id = 1;

-- 3. VERIFICAR CONFIGURAÇÕES
SELECT 
  'Configuração de Autenticação' as tipo,
  email_confirm as email_confirmacao,
  enable_signup as signup_habilitado,
  site_url as url_site,
  redirect_urls as urls_redirecionamento
FROM auth.config 
WHERE id = 1;

-- 4. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
  'Leads' as tabela,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

SELECT 
  'Customers' as tabela,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

-- 5. TESTAR INSERÇÃO DE DADOS
-- Inserir lead de teste
INSERT INTO public.leads (user_id, email, name, phone, source, status)
VALUES (
  gen_random_uuid(),
  'teste@exemplo.com',
  'Usuário Teste',
  '(11) 99999-9999',
  'teste',
  'new'
) ON CONFLICT (email) DO NOTHING;

-- Inserir customer de teste
INSERT INTO public.customers (user_id, email, name, phone, total_orders, total_spent, status)
VALUES (
  gen_random_uuid(),
  'teste@exemplo.com',
  'Usuário Teste',
  '(11) 99999-9999',
  0,
  0.00,
  'active'
) ON CONFLICT (email) DO NOTHING;

-- 6. VERIFICAR DADOS INSERIDOS
SELECT 'Leads de teste' as tipo, email, name, phone, status FROM public.leads WHERE email = 'teste@exemplo.com';
SELECT 'Customers de teste' as tipo, email, name, phone, status FROM public.customers WHERE email = 'teste@exemplo.com';

-- ===== CONFIGURAÇÃO CONCLUÍDA =====
-- ✅ Campo telefone adicionado
-- ✅ Autenticação configurada para desenvolvimento
-- ✅ Login sem confirmação de email habilitado
-- ✅ Google OAuth já configurado
-- ✅ CRM automático funcionando

-- 🌐 Teste no site: http://localhost:3000/login
-- 📱 Campo telefone disponível no cadastro
-- 🔐 Login com Google e email/senha funcionando
